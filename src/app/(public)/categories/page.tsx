import { CategoryCard } from "@/components/products/category-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories } from "@/lib/queries";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Instrument Categories",
  description:
    "Browse Nexvor Intl categories — general surgery, orthopedic, cardiovascular, ENT, laparoscopic, and dental.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Instrument Categories",
          description:
            "Browse Nexvor Intl specialty instrument categories.",
          path: "/categories",
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Categories" },
        ]}
      />
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-steel">
          Categories
        </h1>
        <p className="mt-3 text-muted-foreground">
          Specialty instrument lines organized for clinical buyers and
          distributors.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))
        ) : (
          <p className="text-muted-foreground">
            No categories yet. Run the Supabase migration and seed script.
          </p>
        )}
      </div>
    </div>
  );
}
