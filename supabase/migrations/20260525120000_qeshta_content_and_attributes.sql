-- QESHTA: content CMS (banners + homepage curation) and product attributes (gender, color_hex)
-- Mirrors RLS patterns from 20260521060455 (public catalog) and 20260521181500 (product image storage).

-- 1. Extend catalog_products -------------------------------------------------
alter table public.catalog_products
  add column if not exists gender text not null default 'Women',
  add column if not exists color_hex text;

alter table public.catalog_products
  drop constraint if exists catalog_products_gender_check;
alter table public.catalog_products
  add constraint catalog_products_gender_check
  check (gender in ('Women', 'Men', 'Unisex'));

-- 2. content_banners (banner / hero CMS blocks) -----------------------------
create table if not exists public.content_banners (
  id uuid primary key default gen_random_uuid(),
  slot text not null,
  eyebrow text,
  title text,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_banners_slot_idx
  on public.content_banners (slot, sort_order);

drop trigger if exists set_content_banners_updated_at on public.content_banners;
create trigger set_content_banners_updated_at
before update on public.content_banners
for each row execute function public.set_updated_at();

-- 3. homepage_products (curated product collections) ------------------------
create table if not exists public.homepage_products (
  id uuid primary key default gen_random_uuid(),
  slot text not null,
  product_id text not null references public.catalog_products (product_id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (slot, product_id)
);

alter table public.homepage_products
  drop constraint if exists homepage_products_slot_check;
alter table public.homepage_products
  add constraint homepage_products_slot_check
  check (slot in ('selected', 'featured', 'bestseller'));

create index if not exists homepage_products_slot_idx
  on public.homepage_products (slot, sort_order);

-- 4. RLS ---------------------------------------------------------------------
alter table public.content_banners enable row level security;
alter table public.homepage_products enable row level security;

-- content_banners
drop policy if exists "Visitors can read active banners" on public.content_banners;
create policy "Visitors can read active banners"
on public.content_banners for select to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can read all banners" on public.content_banners;
create policy "Admins can read all banners"
on public.content_banners for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert banners" on public.content_banners;
create policy "Admins can insert banners"
on public.content_banners for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update banners" on public.content_banners;
create policy "Admins can update banners"
on public.content_banners for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete banners" on public.content_banners;
create policy "Admins can delete banners"
on public.content_banners for delete to authenticated
using (public.is_admin());

-- homepage_products
drop policy if exists "Visitors can read active homepage products" on public.homepage_products;
create policy "Visitors can read active homepage products"
on public.homepage_products for select to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can read all homepage products" on public.homepage_products;
create policy "Admins can read all homepage products"
on public.homepage_products for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert homepage products" on public.homepage_products;
create policy "Admins can insert homepage products"
on public.homepage_products for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update homepage products" on public.homepage_products;
create policy "Admins can update homepage products"
on public.homepage_products for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete homepage products" on public.homepage_products;
create policy "Admins can delete homepage products"
on public.homepage_products for delete to authenticated
using (public.is_admin());

-- 5. Storage bucket for content/banner images -------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qeshta-content-images',
  'qeshta-content-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Content images are publicly readable" on storage.objects;
create policy "Content images are publicly readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'qeshta-content-images');

drop policy if exists "Admins can upload content images" on storage.objects;
create policy "Admins can upload content images"
on storage.objects for insert to authenticated
with check (bucket_id = 'qeshta-content-images' and public.is_admin());

drop policy if exists "Admins can update content images" on storage.objects;
create policy "Admins can update content images"
on storage.objects for update to authenticated
using (bucket_id = 'qeshta-content-images' and public.is_admin())
with check (bucket_id = 'qeshta-content-images' and public.is_admin());

drop policy if exists "Admins can delete content images" on storage.objects;
create policy "Admins can delete content images"
on storage.objects for delete to authenticated
using (bucket_id = 'qeshta-content-images' and public.is_admin());

-- 6. Seed --------------------------------------------------------------------
-- 6a. Color name + hex for the existing catalog (DB color was empty; values mirror src/data/products.ts)
update public.catalog_products as c
set color = case when coalesce(c.color, '') = '' then v.color else c.color end,
    color_hex = coalesce(c.color_hex, v.color_hex)
from (values
  ('cocoa-bomber', 'Cocoa', '#6b4a35'),
  ('hera-trouser', 'Black', '#1a1a1a'),
  ('araz-jacket', 'Charcoal', '#36363a'),
  ('grape-ruched-top', 'Caramel', '#a86735'),
  ('ansel-opulent-leather-jacket', 'Espresso', '#3a2a22'),
  ('moon-ivory-slingback', 'Ivory', '#e8e2d6'),
  ('ansel-opulent-skirt', 'Burgundy', '#4b1719'),
  ('selene-ruched-dress', 'Espresso', '#3a2a22'),
  ('noir-bow-bustier', 'Black', '#1a1a1a'),
  ('dalia-top-handle', 'Burgundy', '#4b1719'),
  ('nocturne-sculpted-dress', 'Black', '#1a1a1a'),
  ('atlas-shearling', 'Beige', '#d9cbb3'),
  ('black-moon-mule', 'Black', '#1a1a1a'),
  ('ivory-column-coat', 'Ivory', '#e8e2d6'),
  ('pearl-rose-earrings', 'Silver', '#c8c8cc'),
  ('cocoa-flare-trouser', 'Chocolate', '#4a3526'),
  ('moon-rose-earrings', 'Gold', '#c9a24b')
) as v(product_id, color, color_hex)
where c.product_id = v.product_id;

-- 6b. Gender: accessories read as Unisex; clothing/shoes stay Women (column default)
update public.catalog_products set gender = 'Unisex' where category = 'Accessories';

-- 6c. Shop top banner (dummy editorial copy, reuses an existing campaign image)
insert into public.content_banners (slot, eyebrow, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active)
select 'shop_top',
       'Spring 26 Edit',
       'Sculpted leather, quiet luxury',
       'Discover the pieces defining the season — tailored, textural, and made to be lived in.',
       '/images/shop-editorial-banner.jpg',
       'Explore the collection',
       '/shop/',
       0,
       true
where not exists (select 1 from public.content_banners where slot = 'shop_top');

-- 6d. Homepage curation seeded from current static logic
insert into public.homepage_products (slot, product_id, sort_order)
select 'selected', s.product_id, s.sort_order
from (values
  ('cocoa-bomber', 0),
  ('hera-trouser', 1),
  ('araz-jacket', 2),
  ('grape-ruched-top', 3)
) as s(product_id, sort_order)
where exists (select 1 from public.catalog_products c where c.product_id = s.product_id)
on conflict (slot, product_id) do nothing;

insert into public.homepage_products (slot, product_id, sort_order)
select 'featured', product_id, (row_number() over (order by updated_at desc)) - 1
from public.catalog_products
where featured = true
on conflict (slot, product_id) do nothing;

insert into public.homepage_products (slot, product_id, sort_order)
select 'bestseller', product_id, rn
from (
  select product_id,
         (row_number() over (order by featured desc, is_new desc, updated_at desc)) - 1 as rn
  from public.catalog_products
  where featured = true or is_new = true
) ranked
where rn < 4
on conflict (slot, product_id) do nothing;
