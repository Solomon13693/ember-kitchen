-- Link add-ons to menu items

alter table menu_addons
  add column if not exists menu_item_id uuid references menu_items(id) on delete cascade;

create index if not exists menu_addons_menu_item_id_idx on menu_addons(menu_item_id);

-- Remove orphaned global add-ons from the old standalone flow
delete from menu_addons where menu_item_id is null;
