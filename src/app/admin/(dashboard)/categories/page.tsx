import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteCategoryAction } from "@/lib/actions";
import { getCategories } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Manage Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-steel">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and manage category images in Supabase Storage
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" /> Add category
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {cat.slug}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(cat.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/categories/${cat.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      id={cat.id}
                      label={cat.name}
                      onDelete={deleteCategoryAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No categories yet. Add your first category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
