grant usage on schema public to anon;
grant select on public.catalog_products to anon;

drop policy if exists "Customers can read active catalog products" on public.catalog_products;
drop policy if exists "Visitors can read active catalog products" on public.catalog_products;
create policy "Visitors can read active catalog products"
on public.catalog_products
for select
to anon, authenticated
using (status = 'active');
