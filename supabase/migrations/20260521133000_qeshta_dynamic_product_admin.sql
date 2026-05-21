alter table public.catalog_products
add column if not exists alt text,
add column if not exists color text,
add column if not exists material text,
add column if not exists collection text not null default 'Spring 26',
add column if not exists description text,
add column if not exists tags text[] not null default '{}',
add column if not exists is_new boolean not null default false,
add column if not exists detail_hero_image text,
add column if not exists detail_hero_alt text,
add column if not exists detail_tabs jsonb,
add column if not exists variants jsonb;

update public.catalog_products
set alt = coalesce(alt, name),
    color = coalesce(color, ''),
    material = coalesce(material, ''),
    description = coalesce(description, name)
where alt is null
   or color is null
   or material is null
   or description is null;

grant insert (
  product_id,
  name,
  category,
  price,
  image,
  alt,
  color,
  material,
  collection,
  description,
  tags,
  is_new,
  detail_hero_image,
  detail_hero_alt,
  detail_tabs,
  variants,
  status,
  inventory_quantity,
  low_stock_threshold,
  allow_backorder,
  featured,
  created_at,
  updated_at
) on public.catalog_products to authenticated;

grant update (
  name,
  category,
  price,
  image,
  alt,
  color,
  material,
  collection,
  description,
  tags,
  is_new,
  detail_hero_image,
  detail_hero_alt,
  detail_tabs,
  variants,
  status,
  inventory_quantity,
  low_stock_threshold,
  allow_backorder,
  featured,
  updated_at
) on public.catalog_products to authenticated;

grant delete on public.catalog_products to authenticated;

drop policy if exists "Admins can insert catalog products" on public.catalog_products;
create policy "Admins can insert catalog products"
on public.catalog_products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can delete catalog products" on public.catalog_products;
create policy "Admins can delete catalog products"
on public.catalog_products
for delete
to authenticated
using (public.is_admin());
