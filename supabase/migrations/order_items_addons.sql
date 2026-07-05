-- Persist selected add-ons on order line items

alter table order_items
  add column if not exists addons jsonb not null default '[]'::jsonb;
