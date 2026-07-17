import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "New Category",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        New category
      </h1>
      <div className="mt-8">
        <CategoryForm />
      </div>
    </div>
  );
}
