create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  key text not null,
  product_id text not null,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  image text not null,
  variant_id text not null,
  variant_label text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, key)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_number text not null unique default (
    'QES-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'paid', 'fulfilled', 'cancelled')),
  currency text not null default 'EGP',
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  total numeric(12, 2) not null check (total >= 0),
  customer_email text not null,
  customer_name text not null,
  phone text,
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  image text not null,
  variant_id text not null,
  variant_label text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;

alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can read their profile" on public.profiles;
create policy "Customers can read their profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Customers can create their profile" on public.profiles;
create policy "Customers can create their profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Customers can update their profile" on public.profiles;
create policy "Customers can update their profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Customers can read their cart" on public.carts;
create policy "Customers can read their cart"
on public.carts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can create their cart" on public.carts;
create policy "Customers can create their cart"
on public.carts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Customers can update their cart" on public.carts;
create policy "Customers can update their cart"
on public.carts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Customers can delete their cart" on public.carts;
create policy "Customers can delete their cart"
on public.carts
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can read their cart items" on public.cart_items;
create policy "Customers can read their cart items"
on public.cart_items
for select
to authenticated
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Customers can create their cart items" on public.cart_items;
create policy "Customers can create their cart items"
on public.cart_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Customers can update their cart items" on public.cart_items;
create policy "Customers can update their cart items"
on public.cart_items
for update
to authenticated
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Customers can delete their cart items" on public.cart_items;
create policy "Customers can delete their cart items"
on public.cart_items
for delete
to authenticated
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Customers can read their orders" on public.orders;
create policy "Customers can read their orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can create their orders" on public.orders;
create policy "Customers can create their orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Customers can read their order items" on public.order_items;
create policy "Customers can read their order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Customers can create their order items" on public.order_items;
create policy "Customers can create their order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists create_profile_on_signup on auth.users;
create trigger create_profile_on_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.create_customer_order(
  p_customer_email text,
  p_customer_name text,
  p_phone text,
  p_shipping_address jsonb,
  p_notes text,
  p_items jsonb
)
returns table (id uuid, order_number text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  item jsonb;
  order_id uuid;
  order_total numeric(12, 2);
  generated_order_number text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to create an order.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot create an order without items.';
  end if;

  select coalesce(
    sum((line ->> 'price')::numeric * (line ->> 'quantity')::integer),
    0
  )
  into order_total
  from jsonb_array_elements(p_items) as line;

  insert into public.orders (
    user_id,
    subtotal,
    total,
    customer_email,
    customer_name,
    phone,
    shipping_address,
    notes
  )
  values (
    auth.uid(),
    order_total,
    order_total,
    p_customer_email,
    p_customer_name,
    nullif(p_phone, ''),
    p_shipping_address,
    nullif(p_notes, '')
  )
  returning orders.id, orders.order_number
  into order_id, generated_order_number;

  for item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      name,
      price,
      image,
      variant_id,
      variant_label,
      size,
      quantity
    )
    values (
      order_id,
      item ->> 'productId',
      item ->> 'name',
      (item ->> 'price')::numeric,
      item ->> 'image',
      item ->> 'variantId',
      item ->> 'variantLabel',
      item ->> 'size',
      (item ->> 'quantity')::integer
    );
  end loop;

  return query select order_id, generated_order_number;
end;
$$;

grant execute on function public.create_customer_order(
  text,
  text,
  text,
  jsonb,
  text,
  jsonb
) to authenticated;
