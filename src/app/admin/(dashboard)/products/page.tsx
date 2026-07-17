import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/actions";
import { getAdminProducts, getCategories } from "@/lib/queries";
import { formatDate, stockStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/admin/delete-button";
import { DeleteAllProductsButton } from "@/components/admin/delete-all-products-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";

export const metadata: Metadata = {
  title: "Manage Products",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.category);

  const { products, total, pageSize, totalPages } = await getAdminProducts({
    search: params.q,
    categoryId: category?.id,
    page,
    pageSize: 30,
  });

  const { total: allProductsTotal } = await getAdminProducts({
    page: 1,
    pageSize: 1,
  });

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const q = overrides.q !== undefined ? overrides.q : params.q;
    const categorySlug =
      overrides.category !== undefined ? overrides.category : params.category;
    const pageVal = overrides.page !== undefined ? overrides.page : undefined;

    if (q) next.set("q", q);
    if (categorySlug) next.set("category", categorySlug);
    if (pageVal && pageVal !== "1") next.set("page", pageVal);

    const qs = next.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-steel">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} catalog item{total === 1 ? "" : "s"}
            {params.q || params.category ? " (filtered)" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DeleteAllProductsButton total={allProductsTotal} />
          <Button asChild variant="outline">
            <Link href="/admin/import">Import PDF</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </Button>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={params.q}
            placeholder="Search by name or SKU..."
          />
        </div>
        <div className="sm:w-56 space-y-1.5">
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
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Filter</Button>
          {(params.q || params.category) && (
            <Button asChild variant="ghost">
              <Link href="/admin/products">Clear</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.product_name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {(product.product_images?.length ?? 0) > 0 && (
                      <Badge variant="outline">
                        {product.product_images!.length} image
                        {product.product_images!.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.categories?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {stockStatusLabel(product.stock_status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(product.updated_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <DuplicateButton
                      id={product.id}
                      onDuplicate={duplicateProductAction}
                    />
                    <DeleteButton
                      id={product.id}
                      label={product.product_name}
                      onDelete={deleteProductAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No products found. Adjust filters or create a new product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} of {total} · {pageSize} per page
          </p>
          {totalPages > 1 && (
            <nav
              aria-label="Product pages"
              className="flex flex-wrap items-center justify-center gap-1.5"
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Link
                  href={buildHref({
                    page: String(Math.max(1, page - 1)),
                  })}
                >
                  Previous
                </Link>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    asChild
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="min-w-9 px-2"
                  >
                    <Link
                      href={buildHref({
                        page: pageNum === 1 ? undefined : String(pageNum),
                      })}
                      aria-current={pageNum === page ? "page" : undefined}
                    >
                      {pageNum}
                    </Link>
                  </Button>
                )
              )}
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
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
