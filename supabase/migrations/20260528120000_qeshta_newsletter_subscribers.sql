-- Newsletter subscribers.
-- Visitors and signed-in customers may subscribe (insert-only); the list itself
-- is never readable by anon (no select grant/policy) to prevent email harvesting.
-- Admins can review the list, mirroring the is_admin() pattern used elsewhere.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness so "Foo@x.com" and "foo@x.com" do not duplicate.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

-- Subscribe-only for the public. Column-level grant keeps id/created_at on defaults.
grant insert (email, source) on public.newsletter_subscribers to anon, authenticated;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (true);

-- Admins (and only admins) can read the subscriber list.
grant select on public.newsletter_subscribers to authenticated;

drop policy if exists "Admins can read subscribers" on public.newsletter_subscribers;
create policy "Admins can read subscribers"
on public.newsletter_subscribers
for select
to authenticated
using (public.is_admin());
