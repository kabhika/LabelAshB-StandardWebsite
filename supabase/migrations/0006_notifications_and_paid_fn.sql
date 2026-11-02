-- 0006: order notifications, an idempotent "mark paid" function, and
-- cleanup of abandoned checkouts.
--
-- Why: before this, a paid order only wrote to the database and nobody was
-- told. Both /api/checkout/verify and /api/webhooks/razorpay can report the
-- same payment, so the paid transition must happen exactly once and only
-- that first transition may send alerts or reduce stock.

alter table orders
  add column if not exists notified_at timestamptz;

-- One row per alert attempt, per channel. Read from Supabase Studio or the
-- admin page with the service role. No public policies.
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_log_order on notification_log (order_id);
create index if not exists idx_notification_log_status on notification_log (status, created_at desc);

alter table notification_log enable row level security;

-- Marks an order paid the first time Razorpay reports its payment, and
-- reduces stock in the same transaction. Returns transitioned = true only
-- on that first call; later calls (duplicate webhook, verify then webhook)
-- return false so no second alert is sent and stock is not reduced twice.
create or replace function mark_order_paid(
  p_razorpay_order_id text,
  p_payment_id text,
  p_signature text default null
)
returns table (r_order_id uuid, r_order_number text, r_transitioned boolean)
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  update public.orders o
     set status = 'paid',
         payment_status = 'captured',
         razorpay_payment_id = p_payment_id,
         razorpay_signature = coalesce(p_signature, o.razorpay_signature)
   where o.razorpay_order_id = p_razorpay_order_id
     and o.payment_status <> 'captured'
  returning o.* into v_order;

  if found then
    update public.product_variants pv
       set inventory_quantity = greatest(pv.inventory_quantity - i.quantity, 0)
      from public.order_items i
     where i.order_id = v_order.id
       and i.variant_id = pv.id;

    return query select v_order.id, v_order.order_number, true;
  else
    return query
      select o.id, o.order_number, false
        from public.orders o
       where o.razorpay_order_id = p_razorpay_order_id;
  end if;
end;
$$;

revoke all on function mark_order_paid(text, text, text) from public, anon, authenticated;
grant execute on function mark_order_paid(text, text, text) to service_role;

-- Abandoned checkouts: every click on Pay creates a pending order row.
-- After 24 hours with no payment they are cancelled so the orders list
-- only shows real activity. A late payment still marks the order paid
-- (mark_order_paid does not look at status).
create or replace function expire_stale_pending_orders()
returns integer
language sql
set search_path = ''
as $$
  with expired as (
    update public.orders
       set status = 'cancelled'
     where status = 'pending'
       and payment_status = 'created'
       and created_at < now() - interval '24 hours'
    returning 1
  )
  select count(*)::integer from expired;
$$;

revoke all on function expire_stale_pending_orders() from public, anon, authenticated;
grant execute on function expire_stale_pending_orders() to service_role;
