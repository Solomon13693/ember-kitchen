-- =========================================================
-- 1. TABLES (order matters — profiles first)
-- =========================================================

create table if not exists profiles (
  id uuid references auth.users primary key,
  name text not null,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  category_id uuid references categories(id),
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references profiles(id) not null,
  status text default 'pending'
    check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  type text check (type in ('delivery','pickup')),
  total_amount numeric(10,2) not null,
  address text,
  phone text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null,
  price numeric(10,2) not null,
  addons jsonb not null default '[]'::jsonb
);

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  status text not null
    check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  created_at timestamptz default now() not null,
  unique (order_id, status)
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  label text,
  street text not null,
  city text not null,
  state text not null,
  is_default boolean default false
);

-- =========================================================
-- 2. ROW LEVEL SECURITY
-- =========================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_events enable row level security;
alter table addresses enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- categories
drop policy if exists "categories_select_all" on categories;
drop policy if exists "categories_admin_write" on categories;
drop policy if exists "categories_admin_update" on categories;
drop policy if exists "categories_admin_delete" on categories;
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

-- menu_items
drop policy if exists "menu_items_select_all" on menu_items;
drop policy if exists "menu_items_admin_write" on menu_items;
drop policy if exists "menu_items_admin_update" on menu_items;
drop policy if exists "menu_items_admin_delete" on menu_items;
create policy "menu_items_select_all" on menu_items for select using (true);
create policy "menu_items_admin_write" on menu_items for insert with check (is_admin());
create policy "menu_items_admin_update" on menu_items for update using (is_admin());
create policy "menu_items_admin_delete" on menu_items for delete using (is_admin());

-- orders
drop policy if exists "orders_select_own_or_admin" on orders;
drop policy if exists "orders_insert_own" on orders;
drop policy if exists "orders_update_admin" on orders;
create policy "orders_select_own_or_admin" on orders
  for select using (auth.uid() = user_id or is_admin());
create policy "orders_insert_own" on orders
  for insert with check (auth.uid() = user_id);
create policy "orders_update_admin" on orders
  for update using (is_admin());

-- order_items
drop policy if exists "order_items_select_own_or_admin" on order_items;
drop policy if exists "order_items_insert_own" on order_items;
create policy "order_items_select_own_or_admin" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );
create policy "order_items_insert_own" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- order_status_events
drop policy if exists "order_status_events_select_own_or_admin" on order_status_events;
create policy "order_status_events_select_own_or_admin" on order_status_events
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_status_events.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

-- addresses
drop policy if exists "addresses_select_own" on addresses;
drop policy if exists "addresses_insert_own" on addresses;
drop policy if exists "addresses_update_own" on addresses;
drop policy if exists "addresses_delete_own" on addresses;
create policy "addresses_select_own" on addresses for select using (auth.uid() = user_id);
create policy "addresses_insert_own" on addresses for insert with check (auth.uid() = user_id);
create policy "addresses_update_own" on addresses for update using (auth.uid() = user_id);
create policy "addresses_delete_own" on addresses for delete using (auth.uid() = user_id);

-- =========================================================
-- 3. SEED DATA
-- =========================================================

insert into categories (name, slug)
select * from (values
  ('Rice Dishes', 'rice-dishes'),
  ('Soups', 'soups'),
  ('Proteins', 'proteins'),
  ('Drinks', 'drinks'),
  ('Snacks', 'snacks')
) as v(name, slug)
where not exists (select 1 from categories limit 1);

-- =========================================================
-- 3b. ORDER STATUS TIMELINE
-- =========================================================

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

-- =========================================================
-- 3c. AUTO-CREATE PROFILE ON SIGNUP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Customer'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    phone = coalesce(excluded.phone, profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 4. STORAGE (menu-images bucket)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "menu_images_public_read" on storage.objects;
drop policy if exists "menu_images_admin_insert" on storage.objects;
drop policy if exists "menu_images_admin_update" on storage.objects;
drop policy if exists "menu_images_admin_delete" on storage.objects;

create policy "menu_images_public_read" on storage.objects
  for select using (bucket_id = 'menu-images');

create policy "menu_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'menu-images' and is_admin());

create policy "menu_images_admin_update" on storage.objects
  for update using (bucket_id = 'menu-images' and is_admin());

create policy "menu_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'menu-images' and is_admin());

-- =========================================================
-- 5. REALTIME (live order status updates)
-- =========================================================

alter table orders replica identity full;

do $$
begin
  alter publication supabase_realtime add table orders;
exception
  when duplicate_object then null;
end $$;

-- =========================================================
-- 6. ADMIN SEED
-- =========================================================

insert into profiles (id, name, phone, role)
select
  u.id,
  'Admin',
  '08000000000',
  'admin'
from auth.users u
where u.email = 'admin@gmail.com'
on conflict (id) do update
set role = 'admin', name = 'Admin';

update profiles
set role = 'admin', name = 'Admin'
where id = (
  select id from auth.users where email = 'admin@gmail.com'
);

select u.email, p.name, p.role
from auth.users u
join profiles p on p.id = u.id
where u.email = 'admin@gmail.com';