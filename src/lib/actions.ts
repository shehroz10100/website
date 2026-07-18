"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  inquirySchema,
  loginSchema,
  productSchema,
} from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  getClientIpFromHeaders,
  sanitizeOptional,
  sanitizeText,
} from "@/lib/security";
import { COMPANY_CATALOG_STORAGE_PATH } from "@/lib/catalog";
import {
  enrichProductsFromImages,
  isAiCategorizationConfigured,
} from "@/lib/ai-categorize";
import {
  CANONICAL_SURGICAL_CATEGORIES,
  categoryDescription,
  categorySlugFromName,
  normalizeCategoryName,
} from "@/lib/surgical-categories";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

async function requireAuth() {
  const originCheck = await assertSameOrigin();
  if (!originCheck.ok) {
    throw new Error(originCheck.message);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return supabase;
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const originCheck = await assertSameOrigin();
  if (!originCheck.ok) {
    return { success: false, message: originCheck.message };
  }

  const headerStore = await headers();
  const ip = getClientIpFromHeaders(headerStore);
  const limited = rateLimit({
    key: `login:${ip}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many login attempts. Please try again later.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid credentials",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, message: "Invalid email or password" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function submitInquiryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const originCheck = await assertSameOrigin();
  if (!originCheck.ok) {
    return { success: false, message: originCheck.message };
  }

  const headerStore = await headers();
  const ip = getClientIpFromHeaders(headerStore);
  const limited = rateLimit({
    key: `inquiry:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many inquiries. Please wait and try again.",
    };
  }

  // Honeypot — bots often fill hidden fields
  if (String(formData.get("website") || "").trim()) {
    return {
      success: true,
      message: "Inquiry submitted. Our team will respond shortly.",
    };
  }

  const raw = {
    customer_name: sanitizeText(String(formData.get("customer_name") || ""), 120),
    company_name: sanitizeOptional(String(formData.get("company_name") || ""), 160),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: sanitizeOptional(String(formData.get("phone") || ""), 40),
    country: sanitizeOptional(String(formData.get("country") || ""), 80),
    message: sanitizeText(String(formData.get("message") || ""), 4000),
    product_id: formData.get("product_id") || undefined,
    website: String(formData.get("website") || ""),
  };

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the form fields",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { product_id, website, ...rest } = parsed.data;
  if (website) {
    // Honeypot filled — pretend success without storing
    return {
      success: true,
      message: "Inquiry submitted. Our team will respond shortly.",
    };
  }

  const { error } = await supabase.from("inquiries").insert({
    customer_name: rest.customer_name,
    email: rest.email,
    message: rest.message,
    product_id: product_id || null,
    company_name: rest.company_name || null,
    phone: rest.phone || null,
    country: rest.country || null,
  });

  if (error) {
    return { success: false, message: "Unable to submit inquiry right now." };
  }

  return {
    success: true,
    message: "Inquiry submitted. Our team will respond shortly.",
  };
}

export async function createCategoryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const name = String(formData.get("name") || "");
    const slug = String(formData.get("slug") || slugify(name));
    const description = String(formData.get("description") || "");
    const image = String(formData.get("image") || "");

    const parsed = categorySchema.safeParse({
      name,
      slug,
      description: description || undefined,
      image: image || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image?.split(",")[0]?.trim() || null,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    redirect("/admin/categories");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to create category",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const name = String(formData.get("name") || "");
    const slug = String(formData.get("slug") || slugify(name));
    const description = String(formData.get("description") || "");
    const image = String(formData.get("image") || "");

    const parsed = categorySchema.safeParse({
      name,
      slug,
      description: description || undefined,
      image: image || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image?.split(",")[0]?.trim() || null,
      })
      .eq("id", id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath(`/categories/${parsed.data.slug}`);
    revalidatePath("/");
    redirect("/admin/categories");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to update category",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true, message: "Category deleted" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to delete",
    };
  }
}

export async function ensureSpecialtyCategoriesAction(): Promise<
  ActionResult & {
    categories?: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      created_at: string;
    }[];
  }
> {
  try {
    const supabase = await requireAuth();

    const { data: existing, error: listError } = await supabase
      .from("categories")
      .select("*");

    if (listError) {
      return { success: false, message: listError.message };
    }

    const bySlug = new Map((existing || []).map((c) => [c.slug, c] as const));
    const byName = new Map(
      (existing || []).map((c) => [c.name.toLowerCase(), c] as const)
    );

    for (const name of CANONICAL_SURGICAL_CATEGORIES) {
      const slug = categorySlugFromName(name);
      if (bySlug.has(slug) || byName.has(name.toLowerCase())) continue;

      const { data: created, error } = await supabase
        .from("categories")
        .insert({
          name,
          slug,
          description: categoryDescription(name),
          image: null,
        })
        .select("*")
        .single();

      if (error) {
        const { data: again } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (again) {
          bySlug.set(again.slug, again);
          byName.set(again.name.toLowerCase(), again);
        }
        continue;
      }

      if (created) {
        bySlug.set(created.slug, created);
        byName.set(created.name.toLowerCase(), created);
      }
    }

    // Backfill empty descriptions (e.g. "Orthopedic instruments")
    for (const cat of existing || []) {
      if (cat.description?.trim()) continue;
      const description = categoryDescription(cat.name);
      await supabase
        .from("categories")
        .update({ description })
        .eq("id", cat.id);
    }

    const { data: allCategories, error: refreshError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (refreshError) {
      return { success: false, message: refreshError.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");

    return {
      success: true,
      message: `Ready ${allCategories?.length || 0} specialty categories`,
      categories: allCategories || [],
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to ensure categories",
    };
  }
}

export type AutoEnrichment = {
  page_number: number;
  category_id: string;
  category_name: string;
  source: string;
  product_name: string;
  size: string;
  sku: string;
  slug: string;
  short_description: string;
  full_description: string;
  material: string;
  finish: string;
  certifications: string;
  specifications: string;
  meta_title: string;
  meta_description: string;
};

export type AutoCategorizeItem = {
  product_name: string;
  image_url: string;
  size?: string;
  page_number: number;
};

export async function autoCategorizeImportAction(
  items: AutoCategorizeItem[]
): Promise<
  ActionResult & {
    assignments?: AutoEnrichment[];
    categories?: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      created_at: string;
    }[];
    aiEnabled?: boolean;
  }
> {
  try {
    const supabase = await requireAuth();

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: "No products to categorize" };
    }

    if (items.length > 300) {
      return { success: false, message: "Enrichment limited to 300 products" };
    }

    const aiEnabled = isAiCategorizationConfigured();
    if (!aiEnabled) {
      return {
        success: false,
        message:
          "OPENAI_API_KEY is missing. Add it to .env.local and restart the server so AI can read product images for category, name, and descriptions.",
        aiEnabled: false,
      };
    }

    // Ensure the full specialty set exists up front
    const { data: existing, error: listError } = await supabase
      .from("categories")
      .select("*");

    if (listError) {
      return { success: false, message: listError.message };
    }

    const bySlug = new Map((existing || []).map((c) => [c.slug, c] as const));
    const byName = new Map(
      (existing || []).map((c) => [c.name.toLowerCase(), c] as const)
    );

    for (const name of CANONICAL_SURGICAL_CATEGORIES) {
      const slug = categorySlugFromName(name);
      if (bySlug.has(slug) || byName.has(name.toLowerCase())) continue;

      const { data: created, error } = await supabase
        .from("categories")
        .insert({
          name,
          slug,
          description: categoryDescription(name),
          image: null,
        })
        .select("*")
        .single();

      if (error) {
        const { data: again } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (again) {
          bySlug.set(again.slug, again);
          byName.set(again.name.toLowerCase(), again);
        }
        continue;
      }

      if (created) {
        bySlug.set(created.slug, created);
        byName.set(created.name.toLowerCase(), created);
      }
    }

    const { results: enrichments, errors: enrichErrors } =
      await enrichProductsFromImages(
        items.map((item) => ({
          productName: item.product_name,
          imageUrl: item.image_url,
          size: item.size,
          pageNumber: item.page_number,
        })),
        3
      );

    const aiCount = enrichments.filter((e) => e.source === "ai").length;
    if (aiCount === 0) {
      return {
        success: false,
        message:
          enrichErrors[0] ||
          "AI did not enrich any products. Check OPENAI_API_KEY, billing, and that product images are publicly reachable.",
        aiEnabled: true,
      };
    }

    // Create any unexpected AI category names (should be rare)
    for (const enrichment of enrichments) {
      const name = normalizeCategoryName(enrichment.categoryName);
      const slug = categorySlugFromName(name);
      if (bySlug.has(slug) || byName.has(name.toLowerCase())) continue;

      const { data: created } = await supabase
        .from("categories")
        .insert({
          name,
          slug,
          description: categoryDescription(name),
          image: null,
        })
        .select("*")
        .single();

      if (created) {
        bySlug.set(created.slug, created);
        byName.set(created.name.toLowerCase(), created);
      }
    }

    const { data: allCategories, error: refreshError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (refreshError) {
      return { success: false, message: refreshError.message };
    }

    const categories = allCategories || [];
    const resolveCategory = (categoryName: string) => {
      const normalized = normalizeCategoryName(categoryName);
      const slug = categorySlugFromName(normalized);
      return (
        categories.find((c) => c.slug === slug) ||
        categories.find(
          (c) => c.name.toLowerCase() === normalized.toLowerCase()
        ) ||
        categories.find((c) => c.slug === "general-surgery") ||
        categories[0]
      );
    };

    const assignments: AutoEnrichment[] = items.map((item, idx) => {
      const enrichment = enrichments[idx];
      const category = resolveCategory(enrichment.categoryName);
      return {
        page_number: item.page_number,
        category_id: category?.id || "",
        category_name: category?.name || enrichment.categoryName,
        source: enrichment.source,
        product_name: enrichment.productName,
        size: enrichment.size,
        sku: enrichment.sku,
        slug: enrichment.slug,
        short_description: enrichment.shortDescription,
        full_description: enrichment.fullDescription,
        material: enrichment.material,
        finish: enrichment.finish,
        certifications: enrichment.certifications,
        specifications: enrichment.specifications,
        meta_title: enrichment.metaTitle,
        meta_description: enrichment.metaDescription,
      };
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");

    const aiOk = assignments.filter((a) => a.source === "ai").length;
    const categorySet = new Set(assignments.map((a) => a.category_name));

    return {
      success: true,
      message: `AI enriched ${aiOk}/${assignments.length} products across ${categorySet.size} categories.${
        enrichErrors.length
          ? ` ${enrichErrors.length} page(s) fell back to keywords.`
          : ""
      }`,
      assignments,
      categories,
      aiEnabled: true,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "AI enrichment failed",
    };
  }
}

function parseProductForm(formData: FormData) {
  const name = String(formData.get("product_name") || "");
  const certificationsRaw = String(formData.get("certifications") || "");
  const specsRaw = String(formData.get("specifications") || "");
  const imagesRaw = String(formData.get("product_images") || "");
  const existingImages = String(formData.get("existing_images") || "");

  let specifications: Record<string, string> = {};
  if (specsRaw.trim()) {
    try {
      specifications = JSON.parse(specsRaw);
    } catch {
      specsRaw.split("\n").forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          specifications[key.trim()] = rest.join(":").trim();
        }
      });
    }
  }

  const imageUrls = [
    ...existingImages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ...imagesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ];

  return {
    product_name: name,
    slug: String(formData.get("slug") || slugify(name)),
    sku: String(formData.get("sku") || ""),
    category_id: String(formData.get("category_id") || ""),
    short_description: String(formData.get("short_description") || ""),
    full_description: String(formData.get("full_description") || ""),
    material: String(formData.get("material") || ""),
    finish: String(formData.get("finish") || ""),
    certifications: certificationsRaw,
    specifications: JSON.stringify(specifications),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    stock_status: String(formData.get("stock_status") || "in_stock"),
    meta_title: String(formData.get("meta_title") || ""),
    meta_description: String(formData.get("meta_description") || ""),
    product_images: imageUrls,
    pdf_catalog: String(formData.get("pdf_catalog") || ""),
  };
}

export async function createProductAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const raw = parseProductForm(formData);
    const parsed = productSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const certs = parsed.data.certifications
      ? parsed.data.certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    let specs: Record<string, string> = {};
    if (parsed.data.specifications) {
      try {
        specs = JSON.parse(parsed.data.specifications);
      } catch {
        specs = {};
      }
    }

    const { error } = await supabase.from("products").insert({
      product_name: parsed.data.product_name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      category_id: parsed.data.category_id || null,
      short_description: parsed.data.short_description || null,
      full_description: parsed.data.full_description || null,
      material: parsed.data.material || null,
      finish: parsed.data.finish || null,
      certifications: certs,
      specifications: specs,
      featured: parsed.data.featured,
      stock_status: parsed.data.stock_status,
      meta_title: parsed.data.meta_title || null,
      meta_description: parsed.data.meta_description || null,
      product_images: parsed.data.product_images || [],
      pdf_catalog: parsed.data.pdf_catalog?.split(",")[0]?.trim() || null,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    redirect("/admin/products");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to create product",
    };
  }
}

export type BulkImportProduct = {
  product_name: string;
  image_url: string;
  category_id: string;
  page_number: number;
  sku?: string;
  slug?: string;
  size?: string;
  short_description?: string;
  full_description?: string;
  material?: string;
  finish?: string;
  certifications?: string;
  specifications?: string;
  meta_title?: string;
  meta_description?: string;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
};

export async function bulkCreateProductsAction(
  items: BulkImportProduct[]
): Promise<ActionResult & { created?: number; failed?: number }> {
  try {
    const supabase = await requireAuth();

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: "No products to import" };
    }

    if (items.length > 300) {
      return { success: false, message: "Import is limited to 300 products at once" };
    }

    // Load existing keys so re-imports / seed data don't collide
    const { data: existingRows, error: existingError } = await supabase
      .from("products")
      .select("slug, sku");

    if (existingError) {
      return { success: false, message: existingError.message };
    }

    const usedSlugs = new Set(
      (existingRows || []).map((r) => r.slug).filter(Boolean)
    );
    const usedSkus = new Set(
      (existingRows || []).map((r) => r.sku).filter(Boolean)
    );

    const uniqueSlug = (base: string, pageNumber: number) => {
      const cleaned = slugify(base) || "instrument";
      const candidate = `${cleaned}-p${pageNumber}`.slice(0, 180);
      if (!usedSlugs.has(candidate)) {
        usedSlugs.add(candidate);
        return candidate;
      }
      let n = 2;
      while (usedSlugs.has(`${candidate}-${n}`.slice(0, 200))) n++;
      const finalSlug = `${candidate}-${n}`.slice(0, 200);
      usedSlugs.add(finalSlug);
      return finalSlug;
    };

    const uniqueSku = (preferred: string, pageNumber: number) => {
      let sku = preferred.replace(/[^A-Za-z0-9._\-]/g, "").slice(0, 64);
      if (sku.length < 2) {
        sku = `NXV-${String(pageNumber).padStart(4, "0")}`;
      }
      if (!usedSkus.has(sku)) {
        usedSkus.add(sku);
        return sku;
      }
      // Prefer page-based SKU when preferred collides
      let candidate = `NXV-${String(pageNumber).padStart(4, "0")}`;
      let n = 2;
      while (usedSkus.has(candidate)) {
        candidate = `NXV-${String(pageNumber).padStart(4, "0")}-${n++}`.slice(0, 64);
      }
      usedSkus.add(candidate);
      return candidate;
    };

    const rows: {
      product_name: string;
      slug: string;
      sku: string;
      category_id: string | null;
      product_images: string[];
      featured: boolean;
      stock_status: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
      short_description: string | null;
      full_description: string | null;
      material: string | null;
      finish: string | null;
      certifications: string[];
      specifications: Record<string, string>;
      meta_title: string | null;
      meta_description: string | null;
    }[] = [];

    for (const item of items) {
      const name = sanitizeText(String(item.product_name || ""), 200);
      if (name.length < 2) continue;

      const imageUrl = String(item.image_url || "").trim();
      if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
        return {
          success: false,
          message: `Missing image for "${name}"`,
        };
      }

      const categoryId = String(item.category_id || "").trim();
      if (!categoryId) {
        return {
          success: false,
          message: `Select a category for "${name}"`,
        };
      }

      const size = sanitizeOptional(item.size, 40) || "";
      const slug = uniqueSlug(
        String(item.slug || "").trim() ||
          (size ? `${name}-${size}` : name) ||
          `instrument-${item.page_number}`,
        item.page_number
      );

      const sku = uniqueSku(
        sanitizeText(String(item.sku || "").trim(), 64),
        item.page_number
      );

      const specsRaw = String(item.specifications || "");
      const specifications: Record<string, string> = {};
      if (size && !/^size\s*:/im.test(specsRaw)) {
        specifications.Size = size;
      }
      specsRaw.split("\n").forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          specifications[key.trim()] = rest.join(":").trim();
        }
      });

      const certs = String(item.certifications || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const stockStatus = item.stock_status || "in_stock";

      rows.push({
        product_name: name,
        slug,
        sku,
        category_id: categoryId,
        product_images: [imageUrl],
        featured: false,
        stock_status: stockStatus,
        short_description:
          sanitizeOptional(item.short_description, 500) || null,
        full_description:
          sanitizeOptional(item.full_description, 10000) || null,
        material: sanitizeOptional(item.material, 200) || null,
        finish: sanitizeOptional(item.finish, 200) || null,
        certifications: certs,
        specifications,
        meta_title: sanitizeOptional(item.meta_title, 70) || name.slice(0, 70),
        meta_description:
          sanitizeOptional(item.meta_description, 160) || null,
      });
    }

    if (rows.length === 0) {
      return { success: false, message: "No valid products to import" };
    }

    let created = 0;
    const failedRows: string[] = [];
    const chunkSize = 25;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from("products")
        .insert(chunk)
        .select("id");

      if (!error) {
        created += data?.length ?? chunk.length;
        continue;
      }

      // Fall back to per-row insert so one collision doesn't abort the whole import
      for (const row of chunk) {
        let attempt = { ...row };
        let tries = 0;
        let inserted = false;

        while (tries < 5 && !inserted) {
          const { error: rowError } = await supabase
            .from("products")
            .insert(attempt);

          if (!rowError) {
            created += 1;
            usedSlugs.add(attempt.slug);
            usedSkus.add(attempt.sku);
            inserted = true;
            break;
          }

          if (!/duplicate key|unique constraint/i.test(rowError.message)) {
            failedRows.push(`${row.product_name}: ${rowError.message}`);
            break;
          }

          tries += 1;
          attempt = {
            ...attempt,
            slug: uniqueSlug(`${row.slug}-${tries}`, i + tries),
            sku: uniqueSku(`${row.sku}-${tries}`, i + tries + 1),
          };
        }

        if (!inserted && tries >= 5) {
          failedRows.push(`${row.product_name}: could not resolve unique slug/sku`);
        }
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/");

    if (created === 0) {
      return {
        success: false,
        message:
          failedRows[0] ||
          "Import failed — no products were created (slug/SKU conflicts).",
        created: 0,
        failed: rows.length,
      };
    }

    return {
      success: true,
      message:
        failedRows.length === 0
          ? `Imported ${created} products`
          : `Imported ${created} products (${failedRows.length} failed)`,
      created,
      failed: failedRows.length,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Bulk import failed",
    };
  }
}

export async function updateProductAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const raw = parseProductForm(formData);
    const parsed = productSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const certs = parsed.data.certifications
      ? parsed.data.certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    let specs: Record<string, string> = {};
    if (parsed.data.specifications) {
      try {
        specs = JSON.parse(parsed.data.specifications);
      } catch {
        specs = {};
      }
    }

    const { error } = await supabase
      .from("products")
      .update({
        product_name: parsed.data.product_name,
        slug: parsed.data.slug,
        sku: parsed.data.sku,
        category_id: parsed.data.category_id || null,
        short_description: parsed.data.short_description || null,
        full_description: parsed.data.full_description || null,
        material: parsed.data.material || null,
        finish: parsed.data.finish || null,
        certifications: certs,
        specifications: specs,
        featured: parsed.data.featured,
        stock_status: parsed.data.stock_status,
        meta_title: parsed.data.meta_title || null,
        meta_description: parsed.data.meta_description || null,
        product_images: parsed.data.product_images || [],
        pdf_catalog: parsed.data.pdf_catalog?.split(",")[0]?.trim() || null,
      })
      .eq("id", id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${parsed.data.slug}`);
    revalidatePath("/");
    redirect("/admin/products");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to update product",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, message: "Product deleted" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to delete",
    };
  }
}

export async function deleteAllProductsAction(): Promise<
  ActionResult & { deleted?: number }
> {
  try {
    const supabase = await requireAuth();

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (countError) {
      return { success: false, message: countError.message };
    }

    const total = count ?? 0;
    if (total === 0) {
      return { success: true, message: "No products to delete", deleted: 0 };
    }

    // Delete all rows (neq filter matches every uuid)
    const { error } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/catalog");

    return {
      success: true,
      message: `Deleted ${total} product${total === 1 ? "" : "s"}`,
      deleted: total,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to delete all products",
    };
  }
}

export async function duplicateProductAction(
  id: string
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !product) {
      return {
        success: false,
        message: fetchError?.message || "Product not found",
      };
    }

    const suffix = Date.now().toString(36);
    const { data: created, error } = await supabase
      .from("products")
      .insert({
        category_id: product.category_id,
        product_name: `${product.product_name} (Copy)`,
        slug: `${product.slug}-copy-${suffix}`,
        sku: `${product.sku}-COPY-${suffix}`.slice(0, 64),
        short_description: product.short_description,
        full_description: product.full_description,
        specifications: product.specifications,
        material: product.material,
        finish: product.finish,
        certifications: product.certifications,
        product_images: product.product_images,
        pdf_catalog: product.pdf_catalog,
        featured: false,
        stock_status: product.stock_status,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    if (created?.id) {
      redirect(`/admin/products/${created.id}/edit`);
    }

    return { success: true, message: "Product duplicated" };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to duplicate",
    };
  }
}

export async function deleteInquiryAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/inquiries");
    return { success: true, message: "Inquiry deleted" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to delete",
    };
  }
}

export async function uploadFileAction(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  try {
    const supabase = await requireAuth();
    const file = formData.get("file") as File | null;
    const bucket = String(formData.get("bucket") || "product-images");

    if (!file || file.size === 0) {
      return { success: false, message: "No file provided" };
    }

    const allowedBuckets = [
      "product-images",
      "category-images",
      "pdf-catalogs",
    ];
    if (!allowedBuckets.includes(bucket)) {
      return { success: false, message: "Invalid bucket" };
    }

    const ext = file.name.split(".").pop() || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });

    if (error) {
      return { success: false, message: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { success: true, message: "Uploaded", url: publicUrl };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Upload failed",
    };
  }
}

export async function uploadCompanyCatalogAction(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  try {
    const supabase = await requireAuth();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, message: "No file provided" };
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return { success: false, message: "Please upload a PDF file" };
    }

    const path = COMPANY_CATALOG_STORAGE_PATH;

    const { error } = await supabase.storage
      .from("pdf-catalogs")
      .upload(path, file, {
        upsert: true,
        contentType: "application/pdf",
        cacheControl: "3600",
      });

    if (error) {
      return { success: false, message: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("pdf-catalogs").getPublicUrl(path);

    // Bust CDN/browser cache after replace
    const url = `${publicUrl}?v=${Date.now()}`;

    return { success: true, message: "Company catalog uploaded", url };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Upload failed",
    };
  }
}
