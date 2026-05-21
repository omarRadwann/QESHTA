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

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlist_items_user_id_created_at_idx
on public.wishlist_items (user_id, created_at desc);

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
grant select, insert, delete on public.wishlist_items to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;

alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
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

drop policy if exists "Customers can read their wishlist" on public.wishlist_items;
create policy "Customers can read their wishlist"
on public.wishlist_items
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Customers can add wishlist items" on public.wishlist_items;
create policy "Customers can add wishlist items"
on public.wishlist_items
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Customers can remove wishlist items" on public.wishlist_items;
create policy "Customers can remove wishlist items"
on public.wishlist_items
for delete
to authenticated
using (user_id = auth.uid());

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
    nullif(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name'
      ),
      ''
    )
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

alter table public.profiles
add column if not exists role text not null default 'customer'
check (role in ('customer', 'admin'));

update public.profiles
set role = 'customer'
where role is null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.catalog_products (
  product_id text primary key,
  name text not null,
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  image text not null,
  status text not null default 'active'
    check (status in ('active', 'draft', 'archived')),
  inventory_quantity integer not null default 12 check (inventory_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  allow_backorder boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.catalog_products (
  product_id,
  name,
  category,
  price,
  image,
  inventory_quantity,
  low_stock_threshold,
  featured
)
values
  ('cocoa-bomber', 'Cocoa Leather Bomber', 'Coats & Jackets', 1000, '/images/product-leather-bomber.jpg', 18, 4, true),
  ('hera-trouser', 'Hera Split Trouser', 'Bottoms', 850, '/images/product-black-trouser.jpg', 18, 4, true),
  ('araz-jacket', 'Araz Sculpted Jacket', 'Coats & Jackets', 1500, '/images/product-structured-jacket.jpg', 18, 4, true),
  ('grape-ruched-top', 'Grape Ruched Top', 'Tops', 650, '/images/product-ruched-top.jpg', 18, 4, true),
  ('ansel-opulent-leather-jacket', 'Ansel Opulent Leather Jacket', 'Coats & Jackets', 1500, '/images/product-espresso-wrap-jacket.jpg', 12, 3, false),
  ('moon-ivory-slingback', 'Moon Ivory Slingback', 'Shoes', 1000, '/images/product-ivory-slingback.jpg', 12, 3, false),
  ('ansel-opulent-skirt', 'Ansel Opulent Leather Skirt', 'Bottoms', 1000, '/images/product-skirt-burgundy.jpg', 16, 4, false),
  ('selene-ruched-dress', 'Selene Ruched Dress', 'Dresses', 2000, '/images/product-espresso-ruched-dress.jpg', 10, 3, false),
  ('noir-bow-bustier', 'Noir Bow Bustier', 'Tops', 550, '/images/product-black-bow-bustier.jpg', 14, 3, false),
  ('dalia-top-handle', 'Dalia Top Handle Bag', 'Accessories', 1000, '/images/product-burgundy-bag.jpg', 12, 3, false),
  ('nocturne-sculpted-dress', 'Nocturne Sculpted Dress', 'Dresses', 2500, '/images/product-black-sculpted-dress.jpg', 8, 2, false),
  ('atlas-shearling', 'Atlas Shearling Jacket', 'Coats & Jackets', 1800, '/images/product-beige-shearling-jacket.jpg', 9, 2, false),
  ('black-moon-mule', 'Black Moon Mule', 'Shoes', 1200, '/images/product-black-mule.jpg', 12, 3, false),
  ('ivory-column-coat', 'Ivory Column Coat', 'Coats & Jackets', 1300, '/images/product-ivory-trench.jpg', 10, 2, false),
  ('pearl-rose-earrings', 'Pearl Rose Earrings', 'Accessories', 450, '/images/product-pearl-rose-earrings.jpg', 20, 5, false),
  ('cocoa-flare-trouser', 'Cocoa Flare Trouser', 'Bottoms', 950, '/images/product-chocolate-flare-trousers.jpg', 12, 3, false),
  ('moon-rose-earrings', 'Moon Rose Earrings', 'Accessories', 350, '/images/product-rose-earrings.jpg', 20, 5, true)
on conflict (product_id) do update
set name = excluded.name,
    category = excluded.category,
    price = excluded.price,
    image = excluded.image,
    featured = excluded.featured,
    updated_at = now();

grant select on public.catalog_products to authenticated;
grant update (
  status,
  inventory_quantity,
  low_stock_threshold,
  allow_backorder,
  featured,
  price,
  updated_at
) on public.catalog_products to authenticated;

revoke insert on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant insert (
  id,
  email,
  full_name,
  phone,
  marketing_opt_in,
  created_at,
  updated_at
) on public.profiles to authenticated;
grant update (
  email,
  full_name,
  phone,
  marketing_opt_in,
  updated_at
) on public.profiles to authenticated;

grant select on public.catalog_products to authenticated;
grant update (status, inventory_quantity, low_stock_threshold, allow_backorder, featured, price)
on public.catalog_products to authenticated;
grant update (price, updated_at) on public.catalog_products to authenticated;
grant select on public.orders to authenticated;
grant update (status, notes, updated_at) on public.orders to authenticated;
grant select on public.order_items to authenticated;

alter table public.catalog_products enable row level security;

drop policy if exists "Customers can read active catalog products" on public.catalog_products;
create policy "Customers can read active catalog products"
on public.catalog_products
for select
to authenticated
using (status = 'active');

grant usage on schema public to anon;
grant select on public.catalog_products to anon;

drop policy if exists "Customers can read active catalog products" on public.catalog_products;
drop policy if exists "Visitors can read active catalog products" on public.catalog_products;
create policy "Visitors can read active catalog products"
on public.catalog_products
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Admins can read all catalog products" on public.catalog_products;
create policy "Admins can read all catalog products"
on public.catalog_products
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update catalog products" on public.catalog_products;
create policy "Admins can update catalog products"
on public.catalog_products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists set_catalog_products_updated_at on public.catalog_products;
create trigger set_catalog_products_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read all carts" on public.carts;
create policy "Admins can read all carts"
on public.carts
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read all cart items" on public.cart_items;
create policy "Admins can read all cart items"
on public.cart_items
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
on public.orders
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read all order items" on public.order_items;
create policy "Admins can read all order items"
on public.order_items
for select
to authenticated
using (public.is_admin());

create or replace function public.set_customer_role(
  p_profile_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can update account roles.';
  end if;

  if p_role not in ('customer', 'admin') then
    raise exception 'Unsupported account role.';
  end if;

  if p_profile_id = auth.uid() and p_role <> 'admin' then
    raise exception 'Admins cannot remove their own admin role.';
  end if;

  update public.profiles
  set role = p_role,
      updated_at = now()
  where id = p_profile_id;

  if not found then
    raise exception 'Profile not found.';
  end if;
end;
$$;

revoke all on function public.set_customer_role(uuid, text) from public;
grant execute on function public.set_customer_role(uuid, text) to authenticated;

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
security definer
set search_path = public
as $$
declare
  item jsonb;
  line_product_id text;
  line_quantity integer;
  line_size text;
  order_id uuid;
  order_total numeric(12, 2) := 0;
  generated_order_number text;
  catalog_product public.catalog_products%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to create an order.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot create an order without items.';
  end if;

  if nullif(trim(p_customer_email), '') is null then
    raise exception 'Customer email is required.';
  end if;

  if nullif(trim(p_customer_name), '') is null then
    raise exception 'Customer name is required.';
  end if;

  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'Shipping address is required.';
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    line_product_id := item ->> 'productId';
    line_quantity := (item ->> 'quantity')::integer;
    line_size := item ->> 'size';

    if line_product_id is null or line_product_id = '' then
      raise exception 'Product id is required.';
    end if;

    if line_quantity is null or line_quantity <= 0 then
      raise exception 'Order quantity must be greater than zero.';
    end if;

    if line_size not in ('XS', 'S', 'M', 'L', 'XL') then
      raise exception 'Unsupported product size.';
    end if;

    select *
    into catalog_product
    from public.catalog_products
    where product_id = line_product_id
      and status = 'active'
    for update;

    if not found then
      raise exception 'Product % is not available.', line_product_id;
    end if;

    if not catalog_product.allow_backorder and catalog_product.inventory_quantity < line_quantity then
      raise exception 'Only % units are available for %.',
        catalog_product.inventory_quantity,
        catalog_product.name;
    end if;

    if not catalog_product.allow_backorder then
      update public.catalog_products
      set inventory_quantity = inventory_quantity - line_quantity,
          updated_at = now()
      where product_id = catalog_product.product_id;
    end if;

    order_total := order_total + (catalog_product.price * line_quantity);
  end loop;

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
    trim(p_customer_email),
    trim(p_customer_name),
    nullif(trim(p_phone), ''),
    p_shipping_address,
    nullif(trim(p_notes), '')
  )
  returning orders.id, orders.order_number
  into order_id, generated_order_number;

  for item in select * from jsonb_array_elements(p_items)
  loop
    line_product_id := item ->> 'productId';
    line_quantity := (item ->> 'quantity')::integer;

    select *
    into catalog_product
    from public.catalog_products
    where product_id = line_product_id;

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
      catalog_product.product_id,
      catalog_product.name,
      catalog_product.price,
      coalesce(nullif(item ->> 'image', ''), catalog_product.image),
      coalesce(nullif(item ->> 'variantId', ''), 'default'),
      coalesce(nullif(item ->> 'variantLabel', ''), 'Default'),
      item ->> 'size',
      line_quantity
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
