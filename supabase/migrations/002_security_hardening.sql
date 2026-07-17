-- Security hardening: ensure RLS is enabled and policies are least-privilege.
-- Safe to re-run.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;

-- Drop loose authenticated write policies if you later introduce roles;
-- current model: any authenticated user is an admin.

-- Prevent anon from reading inquiries (must already exist; recreate for safety)
drop policy if exists "Authenticated can read inquiries" on public.inquiries;
create policy "Authenticated can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "Anyone can create inquiries" on public.inquiries;
create policy "Anyone can create inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (
    char_length(customer_name) between 2 and 120
    and char_length(email) between 3 and 254
    and char_length(message) between 10 and 4000
  );

-- Deny anon updates/deletes on inquiries (no policy = deny by default with RLS)
drop policy if exists "Authenticated can delete inquiries" on public.inquiries;
create policy "Authenticated can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);

-- Catalog remains publicly readable
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- Storage: public read, authenticated write only
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));
