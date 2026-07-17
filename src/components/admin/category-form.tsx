"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import {
  createCategoryAction,
  updateCategoryAction,
  type ActionResult,
} from "@/lib/actions";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { useToast } from "@/hooks/use-toast";

const initial: ActionResult | null = null;

type Props = {
  category?: Category;
};

export function CategoryForm({ category }: Props) {
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const { toast } = useToast();

  useEffect(() => {
    if (state && !state.success) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={category?.name}
          onChange={(e) => {
            const slugInput = document.getElementById(
              "slug"
            ) as HTMLInputElement | null;
            if (slugInput && !category) {
              slugInput.value = slugify(e.target.value);
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" name="slug" required defaultValue={category?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Category image (Supabase Storage)</Label>
        <FileUploadField
          bucket="category-images"
          name="image"
          defaultUrls={category?.image ? [category.image] : []}
          label="Upload image"
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : category ? "Update" : "Create"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
