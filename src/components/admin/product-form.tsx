"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import {
  createProductAction,
  updateProductAction,
  type ActionResult,
} from "@/lib/actions";
import { slugify } from "@/lib/utils";
import type { Category, Product } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { useToast } from "@/hooks/use-toast";

const initial: ActionResult | null = null;

type Props = {
  product?: Product;
  categories: Category[];
};

export function ProductForm({ product, categories }: Props) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
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

  const specsDefault = product?.specifications
    ? Object.entries(product.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product_name">Product name *</Label>
          <Input
            id="product_name"
            name="product_name"
            required
            defaultValue={product?.product_name}
            onChange={(e) => {
              const slugInput = document.getElementById(
                "slug"
              ) as HTMLInputElement | null;
              if (slugInput && !product) {
                slugInput.value = slugify(e.target.value);
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" required defaultValue={product?.slug} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" name="sku" required defaultValue={product?.sku} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_status">Stock status</Label>
          <select
            id="stock_status"
            name="stock_status"
            defaultValue={product?.stock_status ?? "in_stock"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="made_to_order">Made to Order</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_description">Short description</Label>
        <Textarea
          id="short_description"
          name="short_description"
          defaultValue={product?.short_description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_description">Full description</Label>
        <Textarea
          id="full_description"
          name="full_description"
          className="min-h-[140px]"
          defaultValue={product?.full_description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            name="material"
            defaultValue={product?.material ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finish">Finish</Label>
          <Input
            id="finish"
            name="finish"
            defaultValue={product?.finish ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certifications">
          CE / ISO Certifications (comma-separated)
        </Label>
        <Input
          id="certifications"
          name="certifications"
          defaultValue={product?.certifications?.join(", ") ?? ""}
          placeholder="ISO 13485, CE Mark, FDA Registered"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specifications">
          Specifications (one per line: Key: Value)
        </Label>
        <Textarea
          id="specifications"
          name="specifications"
          defaultValue={specsDefault}
          placeholder={"length: 14 cm\njaw: Straight"}
        />
      </div>

      <div className="space-y-2">
        <Label>Multiple product images (Supabase Storage)</Label>
        <FileUploadField
          bucket="product-images"
          name="product_images"
          multiple
          defaultUrls={product?.product_images ?? []}
          label="Upload images"
        />
      </div>

      <div className="space-y-2">
        <Label>PDF catalog (Supabase Storage)</Label>
        <FileUploadField
          bucket="pdf-catalogs"
          name="pdf_catalog"
          accept="application/pdf"
          defaultUrls={product?.pdf_catalog ? [product.pdf_catalog] : []}
          label="Upload PDF"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meta_title">SEO Meta title</Label>
          <Input
            id="meta_title"
            name="meta_title"
            defaultValue={product?.meta_title ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">SEO Meta description</Label>
          <Input
            id="meta_description"
            name="meta_description"
            defaultValue={product?.meta_description ?? ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          value="true"
          defaultChecked={product?.featured}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="featured">Featured product toggle</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
