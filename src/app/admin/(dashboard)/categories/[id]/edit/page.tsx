import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Category",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        Edit category
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{category.name}</p>
      <div className="mt-8">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
