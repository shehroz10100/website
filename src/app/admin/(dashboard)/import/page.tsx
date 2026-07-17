import type { Metadata } from "next";
import Link from "next/link";
import { PdfCatalogImport } from "@/components/admin/pdf-catalog-import";
import { isAiCategorizationConfigured } from "@/lib/ai-categorize";
import { getCategories } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Import PDF Catalog",
  robots: { index: false, follow: false },
};

export default async function AdminImportPage() {
  const categories = await getCategories();
  const aiConfigured = isAiCategorizationConfigured();

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-3xl font-semibold text-steel">
            Import PDF catalog
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Upload a multi-page PDF, then click <strong>Auto-assign from
            images</strong> to read each page photo and set product names plus
            specialties (ENT, Dental, Orthopedic, etc.).
          </p>
          {aiConfigured ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              OpenAI is configured. If quota/billing fails, OCR fallback still
              assigns categories from image text.
            </p>
          ) : (
            <p className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
              Image OCR works without OpenAI. Optional: add OPENAI_API_KEY for
              stronger vision naming.
            </p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
      <div className="mt-8">
        <PdfCatalogImport
          categories={categories}
          aiConfigured={aiConfigured}
        />
      </div>
    </div>
  );
}
