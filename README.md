# Nexvor Intl

Production-ready B2B surgical instruments website built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**, and **Supabase** (Auth, PostgreSQL, Storage).

## Features

- Public catalog: home, products, categories, product detail, about, contact
- Quote / inquiry forms with Zod + React Hook Form patterns via Server Actions
- Admin panel: login, dashboard, products CRUD, categories CRUD, inquiries
- PDF catalog import: extract product name + image per page, review categories, bulk create
- Supabase Auth with middleware-protected `/admin` routes
- Image & PDF uploads to Supabase Storage
- Company catalog PDF download on `/catalog` (upload via Admin → Catalog PDF)
- SEO: metadata, sitemap, robots, JSON-LD on product pages
- Responsive, Vercel-ready deployment

## Quick start

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon key** into `.env.local`
3. In the SQL Editor, run:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/seed.sql` (optional sample catalog)
4. Confirm storage buckets exist: `product-images`, `category-images`, `pdf-catalogs` (created by the migration)
5. Create an admin user: **Authentication → Users → Add user** (email/password)

### 3. Run locally

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional; never expose to the client |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://nexvorintl.com`) |
| `NEXT_PUBLIC_SITE_NAME` | Brand name for titles |
| `NEXT_PUBLIC_CATALOG_PDF_URL` | Optional override for the master catalog PDF download URL |
| `OPENAI_API_KEY` | Optional; enables AI vision category detection on PDF import |
| `OPENAI_CATEGORY_MODEL` | Optional OpenAI model (default `gpt-4o-mini`) |

## Deploy on Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add the same environment variables
4. Deploy

Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## Project structure

```
src/
  app/
    (public)/          # Marketing + catalog pages
    admin/             # Login + protected dashboard
  components/
    ui/                # Shadcn-style primitives
    admin/             # Admin forms & sidebar
    forms/             # Inquiry form
    layout/            # Header / footer
  lib/
    actions.ts         # Server Actions
    queries.ts         # Data fetching
    supabase/          # Browser, server, middleware clients
    validations.ts     # Zod schemas
supabase/
  migrations/          # PostgreSQL schema + RLS
  seed.sql             # Sample data
```

## Security notes

- Row Level Security: public read on catalog; authenticated write; inquiries insert for all, read for authenticated
- Admin routes protected by Next.js middleware + `getUser()` session check
- Storage uploads require an authenticated session

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```
