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
grant update (status, inventory_quantity, low_stock_threshold, allow_backorder, featured)
on public.catalog_products to authenticated;
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
