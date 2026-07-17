import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "New Product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        New product
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a surgical instrument to the catalog
      </p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
