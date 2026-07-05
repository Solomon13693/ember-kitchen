-- Menu add-ons attached to menu items

create table if not exists menu_addons (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) not null default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);

alter table menu_addons enable row level security;

drop policy if exists "menu_addons_select_all" on menu_addons;
drop policy if exists "menu_addons_admin_write" on menu_addons;
drop policy if exists "menu_addons_admin_update" on menu_addons;
drop policy if exists "menu_addons_admin_delete" on menu_addons;

create policy "menu_addons_select_all" on menu_addons for select using (true);
create policy "menu_addons_admin_write" on menu_addons for insert with check (is_admin());
create policy "menu_addons_admin_update" on menu_addons for update using (is_admin());
create policy "menu_addons_admin_delete" on menu_addons for delete using (is_admin());
