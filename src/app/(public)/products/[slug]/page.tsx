import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  InquiryFormDynamic,
  ProductImageGalleryDynamic,
} from "@/components/seo/dynamic-widgets";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { stockStatusLabel } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return buildMetadata({
      title: "Product not found",
      description: "The requested surgical instrument could not be found.",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.meta_title || product.product_name,
    description:
      product.meta_description ||
      product.short_description ||
      `${product.product_name} — precision surgical instrument from Nexvor Intl.`,
    path: `/products/${product.slug}`,
    image: product.product_images?.[0],
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category_id
    ? (await getProducts({ categoryId: product.category_id, limit: 4 })).filter(
        (p) => p.id !== product.id
      )
    : [];

  const specs = product.specifications || {};
  const images = product.product_images || [];

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...(product.categories
      ? [
          {
            name: product.categories.name,
            href: `/categories/${product.categories.slug}`,
          },
        ]
      : []),
    { name: product.product_name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={productJsonLd(product)} />
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGalleryDynamic
          images={images}
          alt={product.product_name}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                product.stock_status === "in_stock" ? "success" : "secondary"
              }
            >
              {stockStatusLabel(product.stock_status)}
            </Badge>
            {product.featured && <Badge>Featured</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-steel sm:text-4xl">
            {product.product_name}
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Material</p>
              <p className="font-medium text-steel">
                {product.material || "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Finish</p>
              <p className="font-medium text-steel">{product.finish || "—"}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Certifications</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.certifications && product.certifications.length > 0 ? (
                product.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">
                    {cert}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>

          {product.pdf_catalog && (
            <Button asChild variant="outline" className="mt-6">
              <a
                href={product.pdf_catalog}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4" /> Download PDF catalog
              </a>
            </Button>
          )}

          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold text-steel">
              Product specifications
            </h2>
            {Object.keys(specs).length > 0 ? (
              <dl className="mt-4 divide-y divide-border border border-border">
                {Object.entries(specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 gap-2 px-4 py-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Specifications will be listed here when available.
              </p>
            )}
          </div>

          {product.full_description && (
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold text-steel">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.full_description}
              </p>
            </div>
          )}

          <div className="card-premium p-6">
            <h2 className="font-display text-xl font-semibold text-steel">
              Inquiry form
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit your details — inquiries are stored securely in our
              database for the sales team.
            </p>
            <div className="mt-4">
              <InquiryFormDynamic
                productId={product.id}
                productName={product.product_name}
              />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-steel">
            Related products
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
