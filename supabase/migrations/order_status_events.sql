-- Run in Supabase SQL Editor to persist per-stage order timestamps.

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  status text not null
    check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  created_at timestamptz default now() not null,
  unique (order_id, status)
);

alter table order_status_events enable row level security;

drop policy if exists "order_status_events_select_own_or_admin" on order_status_events;
create policy "order_status_events_select_own_or_admin" on order_status_events
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_status_events.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create or replace function record_initial_order_status_event()
returns trigger as $$
begin
  insert into order_status_events (order_id, status, created_at)
  values (NEW.id, 'pending', NEW.created_at)
  on conflict (order_id, status) do nothing;
  return NEW;
end;
$$ language plpgsql security definer;

create or replace function record_order_status_change_event()
returns trigger as $$
begin
  if NEW.status is distinct from OLD.status then
    insert into order_status_events (order_id, status, created_at)
    values (NEW.id, NEW.status, now())
    on conflict (order_id, status) do nothing;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists orders_record_initial_status on orders;
create trigger orders_record_initial_status
  after insert on orders
  for each row execute function record_initial_order_status_event();

drop trigger if exists orders_record_status_change on orders;
create trigger orders_record_status_change
  after update of status on orders
  for each row execute function record_order_status_change_event();

-- Backfill existing orders (pending + current status at minimum)
insert into order_status_events (order_id, status, created_at)
select id, 'pending', created_at from orders
on conflict (order_id, status) do nothing;

insert into order_status_events (order_id, status, created_at)
select id, status, updated_at from orders
where status <> 'pending'
on conflict (order_id, status) do nothing;

alter table order_status_events replica identity full;

do $$
begin
  alter publication supabase_realtime add table order_status_events;
exception
  when duplicate_object then null;
end $$;
