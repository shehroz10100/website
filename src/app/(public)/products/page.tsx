import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCatalogProducts,
  getCategories,
  type ProductSort,
} from "@/lib/queries";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Surgical Instruments Catalog",
  description:
    "Browse Nexvor Intl instruments — forceps, scissors, clamps, laparoscopic tools, and specialty lines. Search, filter, and sort the B2B catalog.",
  path: "/products",
});

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "sku-asc", label: "SKU" },
  { value: "featured", label: "Featured first" },
];

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

function isSort(value?: string): value is ProductSort {
  return SORT_OPTIONS.some((o) => o.value === value);
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort: ProductSort = isSort(params.sort) ? params.sort : "newest";
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.category);

  const { products, total, pageSize, totalPages } = await getCatalogProducts({
    search: params.q,
    categoryId: category?.id,
    page,
    pageSize: 12,
    sort,
  });

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const q = overrides.q !== undefined ? overrides.q : params.q;
    const categorySlug =
      overrides.category !== undefined ? overrides.category : params.category;
    const sortVal = overrides.sort !== undefined ? overrides.sort : sort;
    const pageVal = overrides.page;

    if (q) next.set("q", q);
    if (categorySlug) next.set("category", categorySlug);
    if (sortVal && sortVal !== "newest") next.set("sort", sortVal);
    if (pageVal && pageVal !== "1") next.set("page", pageVal);

    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Surgical Instruments Catalog",
          description:
            "Browse Nexvor Intl instruments for hospitals and distributors.",
          path: "/products",
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Products" },
        ]}
      />

      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-steel">
          Product catalog
        </h1>
        <p className="mt-3 text-muted-foreground">
          Search, filter, and sort surgical instruments. Responsive product
          cards for desktop and mobile browsing.
        </p>
      </div>

      <form className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={params.q}
            placeholder="Search products or SKU..."
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="text-xs font-medium text-muted-foreground"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={params.category ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="sort"
            className="text-xs font-medium text-muted-foreground"
          >
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply
          </Button>
          {(params.q || params.category || params.sort) && (
            <Button asChild variant="ghost">
              <Link href="/products">Clear</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: "", page: "1" })}
          className={`rounded-md px-3 py-1.5 text-sm ${
            !params.category
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildHref({ category: cat.slug, page: "1" })}
            className={`rounded-md px-3 py-1.5 text-sm ${
              params.category === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {total} product{total === 1 ? "" : "s"}
        {params.q || params.category ? " matching filters" : ""}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-muted-foreground">
            No products found. Adjust search, category, or sorting.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              <Link href={buildHref({ page: String(Math.max(1, page - 1)) })}>
                Previous
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            >
              <Link
                href={buildHref({
                  page: String(Math.min(totalPages, page + 1)),
                })}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
