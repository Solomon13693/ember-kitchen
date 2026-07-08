-- Payment fields on orders (Paystack test + COD)

alter table orders
  add column if not exists payment_method text
    check (payment_method in ('cod', 'paystack')),
  add column if not exists payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'pending', 'paid', 'failed')),
  add column if not exists payment_reference text;

create unique index if not exists orders_payment_reference_unique
  on orders (payment_reference)
  where payment_reference is not null;
