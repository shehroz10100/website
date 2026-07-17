import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategoryBySlug, getProducts } from "@/lib/queries";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return buildMetadata({
      title: "Category not found",
      description: "The requested category could not be found.",
      path: `/categories/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: category.name,
    description:
      category.description ||
      `${category.name} surgical instruments from Nexvor Intl.`,
    path: `/categories/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ categoryId: category.id });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: category.name,
          description:
            category.description || `${category.name} surgical instruments`,
          path: `/categories/${category.slug}`,
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Categories", href: "/categories" },
          { name: category.name },
        ]}
      />

      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Category
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-steel">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        )}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-muted-foreground">
            No products in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
