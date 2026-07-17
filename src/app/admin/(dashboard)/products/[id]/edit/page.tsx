import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getProductById } from "@/lib/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        Edit product
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.product_name}</p>
      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
