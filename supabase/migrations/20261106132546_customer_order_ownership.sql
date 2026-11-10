alter table public.orders
  add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_customer_user_created_idx
  on public.orders (customer_user_id, created_at desc)
  where customer_user_id is not null;
