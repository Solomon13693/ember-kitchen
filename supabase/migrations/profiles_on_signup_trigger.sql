-- Auto-create a profile row whenever a new auth user signs up.
-- Works even when email confirmation is enabled (no client session yet).

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
