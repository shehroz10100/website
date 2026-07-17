"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
  SkipForward,
} from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { createClient } from "@/lib/supabase/client";
import {
  bulkCreateProductsAction,
  ensureSpecialtyCategoriesAction,
} from "@/lib/actions";
import { buildProductFieldsFromPdfPage } from "@/lib/pdf-product-fields";
import { enrichFromOcrText } from "@/lib/ocr-enrich-product";
import { keywordSuggestCategory } from "@/lib/surgical-categories";
import { cn, slugify } from "@/lib/utils";
import type { Category } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type DraftProduct = {
  id: string;
  pageNumber: number;
  productName: string;
  size: string;
  sku: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  material: string;
  finish: string;
  certifications: string;
  specifications: string;
  metaTitle: string;
  metaDescription: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
  categoryId: string;
  categorySource?: "ai" | "keyword" | "manual" | "ocr";
  imageUrl: string;
  previewUrl: string;
  included: boolean;
};

type Props = {
  categories: Category[];
  aiConfigured: boolean;
};

function matchCategoryId(suggestedName: string, categories: Category[]): string {
  const lower = suggestedName.toLowerCase();
  const match =
    categories.find((c) => c.name.toLowerCase() === lower) ||
    categories.find(
      (c) =>
        c.slug.includes(lower.split(" ")[0]) ||
        lower.includes(c.name.toLowerCase().split(" ")[0])
    );
  return match?.id || categories[0]?.id || "";
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create image"))),
      "image/jpeg",
      0.88
    );
  });
}

export function PdfCatalogImport({ categories: initialCategories }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [phase, setPhase] = useState<
    "idle" | "parsing" | "categorizing" | "review" | "importing"
  >("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const [items, setItems] = useState<DraftProduct[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const included = useMemo(() => items.filter((i) => i.included), [items]);
  const readyCount = useMemo(
    () =>
      included.filter(
        (i) =>
          i.productName.trim().length >= 2 &&
          i.categoryId &&
          i.sku.trim().length >= 2
      ).length,
    [included]
  );
  const focused = items[focusIndex] ?? null;

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFocused = useCallback(
    (patch: Partial<DraftProduct>) => {
      setItems((prev) =>
        prev.map((item, idx) => {
          if (idx !== focusIndex) return item;
          const next = { ...item, ...patch };
          if (patch.categoryId !== undefined) {
            next.categorySource = "manual";
          }
          if (patch.productName !== undefined || patch.size !== undefined) {
            const name = patch.productName ?? item.productName;
            const size = patch.size ?? item.size;
            if (!patch.slug) {
              next.slug = slugify(size ? `${name}-${size}` : name) || item.slug;
            }
          }
          return next;
        })
      );
    },
    [focusIndex]
  );

  async function runAutoCategorize(drafts: DraftProduct[]) {
    if (!drafts.length) return;

    setPhase("categorizing");
    setProgress({
      current: 0,
      total: drafts.length,
      label: "Preparing specialty categories…",
    });

    try {
      const ensured = await ensureSpecialtyCategoriesAction();
      if (!ensured.success || !ensured.categories?.length) {
        toast({
          title: "Category setup failed",
          description: ensured.message,
          variant: "destructive",
        });
        setPhase("review");
        return;
      }

      setCategories(ensured.categories as Category[]);
      const categoryList = ensured.categories as Category[];

      const resolveCategoryId = (categoryName: string) => {
        const lower = categoryName.toLowerCase();
        return (
          categoryList.find((c) => c.name.toLowerCase() === lower)?.id ||
          categoryList.find((c) => c.slug === slugify(categoryName))?.id ||
          categoryList.find((c) => c.slug === "general-surgery")?.id ||
          categoryList[0]?.id ||
          ""
        );
      };

      // OpenAI quota is exceeded — use OCR on catalog page images directly
      toast({
        title: "Reading product images",
        description:
          "Assigning categories by OCR from each catalog page (OpenAI skipped — quota exceeded).",
      });

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        workerPath:
          "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
      });

      const categoryCounts = new Map<string, number>();

      try {
        for (let i = 0; i < drafts.length; i++) {
          const draft = drafts[i];
          setProgress({
            current: i + 1,
            total: drafts.length,
            label: `OCR reading image ${i + 1} of ${drafts.length}…`,
          });

          const imageSrc = draft.previewUrl || draft.imageUrl;
          let ocrText = "";
          try {
            const {
              data: { text },
            } = await worker.recognize(imageSrc);
            ocrText = text || "";
          } catch {
            ocrText = `${draft.productName} ${draft.size}`;
          }

          const enriched = enrichFromOcrText(
            ocrText,
            draft.pageNumber,
            draft.productName
          );
          const categoryId = resolveCategoryId(enriched.categoryName);
          categoryCounts.set(
            enriched.categoryName,
            (categoryCounts.get(enriched.categoryName) || 0) + 1
          );

          setItems((prev) =>
            prev.map((item) =>
              item.pageNumber === draft.pageNumber
                ? {
                    ...item,
                    productName: enriched.productName,
                    size: enriched.size || item.size,
                    sku: enriched.sku || item.sku,
                    slug: enriched.slug || item.slug,
                    categoryId,
                    categorySource: "ocr" as const,
                    shortDescription: enriched.shortDescription,
                    fullDescription: enriched.fullDescription,
                    material: enriched.material,
                    finish: enriched.finish,
                    certifications: enriched.certifications,
                    specifications: enriched.specifications,
                    metaTitle: enriched.metaTitle,
                    metaDescription: enriched.metaDescription,
                  }
                : item
            )
          );

          if (i % 2 === 0) await new Promise((r) => setTimeout(r, 0));
        }
      } finally {
        await worker.terminate().catch(() => undefined);
      }

      setPhase("review");
      const summary = [...categoryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, n]) => `${name}: ${n}`)
        .join(" · ");

      toast({
        title: "Image OCR complete",
        description: summary || `Updated ${drafts.length} products from images.`,
      });
    } catch (e) {
      console.error("[ocr-categorize]", e);
      setPhase("review");
      toast({
        title: "Auto-assign failed",
        description:
          e instanceof Error
            ? e.message
            : "Could not read images. You can still set categories manually or retry Auto-assign from images.",
        variant: "destructive",
      });
    }
  }

  async function processPdf(file: File) {
    setPhase("parsing");
    setItems([]);
    setFocusIndex(0);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to import.");

      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocument({ data }).promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total, label: "Reading PDF pages…" });

      const drafts: DraftProduct[] = [];

      for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
        setProgress({
          current: pageNumber,
          total,
          label: `Extracting page ${pageNumber} of ${total}…`,
        });

        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const rawText = textContent.items
          .map((item) => ("str" in item ? String(item.str) : ""))
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        const suggested = keywordSuggestCategory(rawText);
        const categoryId = matchCategoryId(suggested, categories);
        const categoryName =
          categories.find((c) => c.id === categoryId)?.name || suggested;
        const fields = buildProductFieldsFromPdfPage(
          rawText,
          pageNumber,
          categoryName
        );

        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported in this browser");

        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await canvasToBlob(canvas);
        const previewUrl = URL.createObjectURL(blob);

        const path = `imports/${Date.now()}-p${pageNumber}-${Math.random()
          .toString(36)
          .slice(2)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, blob, {
            contentType: "image/jpeg",
            upsert: false,
            cacheControl: "3600",
          });

        if (uploadError) {
          URL.revokeObjectURL(previewUrl);
          throw new Error(
            `Page ${pageNumber} image upload failed: ${uploadError.message}`
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);

        drafts.push({
          id: `${pageNumber}-${fields.slug || "item"}`,
          pageNumber,
          productName: fields.productName,
          size: fields.size,
          sku: fields.sku,
          slug: fields.slug,
          shortDescription: fields.shortDescription,
          fullDescription: fields.fullDescription,
          material: fields.material,
          finish: fields.finish,
          certifications: fields.certifications,
          specifications: fields.specifications,
          metaTitle: fields.metaTitle,
          metaDescription: fields.metaDescription,
          stockStatus: fields.stockStatus,
          categoryId,
          categorySource: "keyword",
          imageUrl: publicUrl,
          previewUrl,
          included: true,
        });

        if (pageNumber % 5 === 0) {
          setItems([...drafts]);
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      // Keep extracted products even if OCR fails afterward
      setItems(drafts);
      setFocusIndex(0);
      setPhase("review");
      toast({
        title: "PDF processed",
        description: `Found ${drafts.length} products. Starting image OCR for categories…`,
      });

      await runAutoCategorize(drafts);
    } catch (e) {
      console.error("[processPdf]", e);
      setPhase((prev) => (prev === "parsing" ? "idle" : prev));
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : "Could not process PDF",
        variant: "destructive",
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function applyBulkCategory() {
    if (!bulkCategoryId) return;
    const categoryName = categories.find((c) => c.id === bulkCategoryId)?.name;
    setItems((prev) =>
      prev.map((item) => {
        if (!item.included) return item;
        const fields = buildProductFieldsFromPdfPage(
          [item.productName, item.size, item.specifications].join("\n"),
          item.pageNumber,
          categoryName
        );
        return {
          ...item,
          categoryId: bulkCategoryId,
          categorySource: "manual",
          shortDescription: fields.shortDescription,
          fullDescription: fields.fullDescription,
          metaDescription: fields.metaDescription,
        };
      })
    );
    toast({
      title: "Category applied",
      description: "Category and descriptions updated for included products.",
    });
  }

  async function importProducts() {
    const payload = included
      .filter(
        (i) =>
          i.productName.trim().length >= 2 &&
          i.categoryId &&
          i.sku.trim().length >= 2
      )
      .map((i) => ({
        product_name: i.productName.trim(),
        image_url: i.imageUrl,
        category_id: i.categoryId,
        page_number: i.pageNumber,
        sku: i.sku.trim(),
        slug: i.slug.trim(),
        size: i.size.trim(),
        short_description: i.shortDescription.trim(),
        full_description: i.fullDescription.trim(),
        material: i.material.trim(),
        finish: i.finish.trim(),
        certifications: i.certifications.trim(),
        specifications: i.specifications.trim(),
        meta_title: i.metaTitle.trim(),
        meta_description: i.metaDescription.trim(),
        stock_status: i.stockStatus,
      }));

    if (!payload.length) {
      toast({
        title: "Nothing to import",
        description: "Include products with name, SKU, and category.",
        variant: "destructive",
      });
      return;
    }

    const missing = included.find(
      (i) =>
        i.included &&
        (!i.productName.trim() || !i.categoryId || i.sku.trim().length < 2)
    );
    if (missing) {
      toast({
        title: "Incomplete product",
        description: `Check name, SKU, and category for "${missing.productName || `page ${missing.pageNumber}`}".`,
        variant: "destructive",
      });
      const idx = items.findIndex((i) => i.id === missing.id);
      if (idx >= 0) setFocusIndex(idx);
      return;
    }

    setPhase("importing");
    const result = await bulkCreateProductsAction(payload);
    if (result.success) {
      toast({
        title: "Import complete",
        description: result.message,
      });
      router.push("/admin/products");
      router.refresh();
    } else {
      setPhase("review");
      toast({
        title: "Import failed",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (phase !== "review") return;

    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault();
        setFocusIndex((i) => Math.min(items.length - 1, i + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        setFocusIndex((i) => Math.max(0, i - 1));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, items.length]);

  if (!categories.length && phase === "idle") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          No categories yet — after you upload a PDF, image OCR creates
          Orthopedic, Dental, ENT, General Surgery, and other specialties from
          each product page, then assigns them automatically.
        </div>
        <div className="rounded-lg border bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-steel">
            Upload product catalog PDF
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each page should include product name, size, and image. Categories
            are detected and created automatically.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="max-w-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void processPdf(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <FileUp className="h-4 w-4" /> Choose PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {phase === "idle" && (
        <div className="rounded-lg border bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-steel">
            Upload product catalog PDF
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each page should include product name, size, and image. After
            extract, OCR reads each page image to set name + category (ENT,
            Dental, Orthopedic, etc.).
          </p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            OpenAI quota is currently exceeded, so categorization uses image OCR
            only. Products stay in review even if OCR fails — you can retry{" "}
            <strong>Auto-assign from images</strong> or set categories manually.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="max-w-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void processPdf(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <FileUp className="h-4 w-4" /> Choose PDF
            </Button>
          </div>
        </div>
      )}

      {(phase === "parsing" || phase === "categorizing") && (
        <div className="rounded-lg border bg-white p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="font-medium text-steel">{progress.label}</p>
              {phase === "parsing" ? (
                <p className="text-sm text-muted-foreground">
                  {progress.current} / {progress.total} pages
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {progress.current} / {progress.total} products · creating
                  missing categories…
                </p>
              )}
            </div>
          </div>
          {(phase === "parsing" || phase === "categorizing") && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Keep this tab open. Large catalogs may take several minutes.
          </p>
        </div>
      )}

      {(phase === "review" || phase === "importing") && focused && (
        <>
          <div className="sticky top-0 z-20 -mx-4 border-b bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-medium text-steel">
                  Review products · {focusIndex + 1} of {items.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {readyCount} ready · {included.length} included · shortcuts: ← →
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Apply category to all included</Label>
                  <select
                    value={bulkCategoryId}
                    onChange={(e) => setBulkCategoryId(e.target.value)}
                    className="flex h-10 min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Choose…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="button" variant="outline" onClick={applyBulkCategory}>
                  Apply to all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={phase === "importing"}
                  onClick={() => void runAutoCategorize(items)}
                >
                  Auto-assign from images
                </Button>
                <Button
                  type="button"
                  disabled={phase === "importing" || readyCount === 0}
                  onClick={() => void importProducts()}
                >
                  {phase === "importing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Importing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Import {readyCount}{" "}
                      products
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="max-h-[75vh] space-y-2 overflow-y-auto rounded-lg border bg-white p-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFocusIndex(idx)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border p-2 text-left text-xs transition",
                    idx === focusIndex
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted",
                    !item.included && "opacity-40"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl || item.imageUrl}
                    alt=""
                    className="h-12 w-10 shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-medium text-steel">
                      {item.productName || `Page ${item.pageNumber}`}
                    </span>
                    {item.size && (
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {item.size}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-lg border bg-white p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {focused.pageNumber}
                  {focused.size ? ` · Size ${focused.size}` : ""}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={focusIndex === 0}
                    onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={focusIndex >= items.length - 1}
                    onClick={() =>
                      setFocusIndex((i) => Math.min(items.length - 1, i + 1))
                    }
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-8 xl:grid-cols-2 xl:items-start">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={focused.previewUrl || focused.imageUrl}
                    alt={focused.productName}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <Label htmlFor="focus-name">Product name *</Label>
                    <Input
                      id="focus-name"
                      value={focused.productName}
                      onChange={(e) =>
                        updateFocused({ productName: e.target.value })
                      }
                      className="text-base"
                      autoFocus
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="focus-size">Size (from PDF)</Label>
                      <Input
                        id="focus-size"
                        value={focused.size}
                        onChange={(e) => updateFocused({ size: e.target.value })}
                        placeholder="e.g. 14cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="focus-sku">SKU *</Label>
                      <Input
                        id="focus-sku"
                        value={focused.sku}
                        onChange={(e) => updateFocused({ sku: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="focus-slug">Slug</Label>
                      <Input
                        id="focus-slug"
                        value={focused.slug}
                        onChange={(e) => updateFocused({ slug: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="focus-category">Category *</Label>
                      <select
                        id="focus-category"
                        value={focused.categoryId}
                        onChange={(e) =>
                          updateFocused({ categoryId: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                      >
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {focused.categorySource === "ai"
                          ? "Assigned by OpenAI from image + name"
                          : focused.categorySource === "ocr"
                            ? "Assigned by reading text from the product image (OCR)"
                            : focused.categorySource === "keyword"
                              ? "Suggested from product name keywords"
                              : "Manually selected"}
                        . Change anytime before import.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="focus-short">Short description</Label>
                    <Textarea
                      id="focus-short"
                      rows={3}
                      value={focused.shortDescription}
                      onChange={(e) =>
                        updateFocused({ shortDescription: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="focus-full">Full description</Label>
                    <Textarea
                      id="focus-full"
                      rows={5}
                      value={focused.fullDescription}
                      onChange={(e) =>
                        updateFocused({ fullDescription: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="focus-material">Material</Label>
                      <Input
                        id="focus-material"
                        value={focused.material}
                        onChange={(e) =>
                          updateFocused({ material: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="focus-finish">Finish</Label>
                      <Input
                        id="focus-finish"
                        value={focused.finish}
                        onChange={(e) => updateFocused({ finish: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="focus-certs">Certifications</Label>
                      <Input
                        id="focus-certs"
                        value={focused.certifications}
                        onChange={(e) =>
                          updateFocused({ certifications: e.target.value })
                        }
                        placeholder="ISO 13485, CE"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="focus-stock">Stock status</Label>
                      <select
                        id="focus-stock"
                        value={focused.stockStatus}
                        onChange={(e) =>
                          updateFocused({
                            stockStatus: e.target
                              .value as DraftProduct["stockStatus"],
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="in_stock">In stock</option>
                        <option value="low_stock">Low stock</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="made_to_order">Made to order</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="focus-specs">
                      Specifications (one per line: Key: Value)
                    </Label>
                    <Textarea
                      id="focus-specs"
                      rows={4}
                      value={focused.specifications}
                      onChange={(e) =>
                        updateFocused({ specifications: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="focus-meta-title">Meta title</Label>
                      <Input
                        id="focus-meta-title"
                        value={focused.metaTitle}
                        onChange={(e) =>
                          updateFocused({ metaTitle: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="focus-meta-desc">Meta description</Label>
                      <Input
                        id="focus-meta-desc"
                        value={focused.metaDescription}
                        onChange={(e) =>
                          updateFocused({ metaDescription: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={focused.included}
                      onChange={(e) =>
                        updateFocused({ included: e.target.checked })
                      }
                      className="h-4 w-4 rounded border"
                    />
                    Include this product in import
                  </label>

                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      setFocusIndex((i) => Math.min(items.length - 1, i + 1))
                    }
                    disabled={focusIndex >= items.length - 1}
                  >
                    <SkipForward className="h-4 w-4" /> Save & next product
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
