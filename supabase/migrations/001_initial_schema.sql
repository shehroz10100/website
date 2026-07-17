-- Nexvor Intl — Initial Schema
-- Run in Supabase SQL Editor or via CLI

-- Extensions
create extension if not exists "uuid-ossp";

-- Categories
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  image text,
  description text,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete set null,
  product_name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  full_description text,
  specifications jsonb default '{}'::jsonb,
  material text,
  finish text,
  certifications text[] default '{}',
  product_images text[] default '{}',
  pdf_catalog text,
  featured boolean not null default false,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Inquiries
create table if not exists public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  company_name text,
  email text not null,
  phone text,
  country text,
  message text not null,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_featured on public.products(featured) where featured = true;
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);
create index if not exists idx_inquiries_product_id on public.inquiries(product_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- Storage buckets (run after creating buckets in dashboard if needed)
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('pdf-catalogs', 'pdf-catalogs', true)
on conflict (id) do nothing;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;

-- Public read for catalog
create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- Authenticated admins can manage catalog
create policy "Authenticated can insert categories"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "Authenticated can update categories"
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete categories"
  on public.categories for delete
  to authenticated
  using (true);

create policy "Authenticated can insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- Inquiries: anyone can submit, only authenticated can read/delete
create policy "Anyone can create inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

create policy "Authenticated can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);

-- Storage policies
create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));

create policy "Authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));

create policy "Authenticated update storage"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));

create policy "Authenticated delete storage"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('product-images', 'category-images', 'pdf-catalogs'));
