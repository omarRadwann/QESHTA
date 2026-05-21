create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

grant select, insert, delete on public.wishlist_items to authenticated;

alter table public.wishlist_items enable row level security;

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

create index if not exists wishlist_items_user_id_created_at_idx
on public.wishlist_items (user_id, created_at desc);
