-- Human-facing order numbers (LAB-1001, LAB-1002, ...), assigned server
-- side so concurrent checkouts never collide. orders.order_number stays
-- "not null unique" from 0001_init.sql; this trigger fills it in when the
-- application inserts a row without one.

create sequence if not exists order_number_seq start 1001;

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'LAB-' || nextval('order_number_seq')::text;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_order_number on orders;
create trigger trg_orders_order_number
  before insert on orders
  for each row execute function set_order_number();
