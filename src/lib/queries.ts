import { unstable_cache } from "next/cache";
import { createClient, createPublicClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  Category,
  InquiryWithProduct,
  Product,
  ProductWithCategory,
} from "@/types/database";

const PUBLIC_REVALIDATE = 300;

async function fetchCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig()) return [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("getCategories:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("getCategories:", e);
    return [];
  }
}

export const getCategories = unstable_cache(fetchCategories, ["public-categories"], {
  revalidate: PUBLIC_REVALIDATE,
});

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getCategoryBySlug:", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("getCategoryBySlug:", e);
    return null;
  }
}

type ProductQueryOptions = {
  categoryId?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
};

async function fetchProducts(
  options?: ProductQueryOptions
): Promise<ProductWithCategory[]> {
  if (!hasSupabaseConfig()) return [];
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false });

    if (options?.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }
    if (options?.featured) {
      query = query.eq("featured", true);
    }
    if (options?.search) {
      query = query.or(
        `product_name.ilike.%${options.search}%,sku.ilike.%${options.search}%,short_description.ilike.%${options.search}%`
      );
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getProducts:", error.message);
      return [];
    }
    return (data as ProductWithCategory[]) ?? [];
  } catch (e) {
    console.error("getProducts:", e);
    return [];
  }
}

const getCachedProducts = unstable_cache(
  async (cacheKey: string) => {
    const parsed = JSON.parse(cacheKey) as {
      categoryId: string | null;
      featured: boolean | null;
      search: string | null;
      limit: number | null;
    };
    return fetchProducts({
      categoryId: parsed.categoryId ?? undefined,
      featured: parsed.featured ?? undefined,
      search: parsed.search ?? undefined,
      limit: parsed.limit ?? undefined,
    });
  },
  ["public-products"],
  { revalidate: PUBLIC_REVALIDATE }
);

export function getProducts(
  options?: ProductQueryOptions
): Promise<ProductWithCategory[]> {
  return getCachedProducts(
    JSON.stringify({
      categoryId: options?.categoryId ?? null,
      featured: options?.featured ?? null,
      search: options?.search ?? null,
      limit: options?.limit ?? null,
    })
  );
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getProductBySlug:", error.message);
      return null;
    }
    return data as ProductWithCategory | null;
  } catch (e) {
    console.error("getProductBySlug:", e);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getProductById:", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("getProductById:", e);
    return null;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getCategoryById:", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("getCategoryById:", e);
    return null;
  }
}

export async function getInquiries(): Promise<InquiryWithProduct[]> {
  if (!hasSupabaseConfig()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*, products(id, product_name, sku, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getInquiries:", error.message);
      return [];
    }
    return (data as InquiryWithProduct[]) ?? [];
  } catch (e) {
    console.error("getInquiries:", e);
    return [];
  }
}

export async function getDashboardStats() {
  if (!hasSupabaseConfig()) {
    return { products: 0, categories: 0, inquiries: 0, featured: 0 };
  }
  try {
    const supabase = await createClient();
    const [products, categories, inquiries, featured] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("inquiries").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("featured", true),
    ]);

    return {
      products: products.count ?? 0,
      categories: categories.count ?? 0,
      inquiries: inquiries.count ?? 0,
      featured: featured.count ?? 0,
    };
  } catch (e) {
    console.error("getDashboardStats:", e);
    return { products: 0, categories: 0, inquiries: 0, featured: 0 };
  }
}

export type ProductSort =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "sku-asc"
  | "featured"
  | "updated";

export type CatalogProductsResult = {
  products: ProductWithCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getCatalogProducts(options?: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
}): Promise<CatalogProductsResult> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 12;
  const sort = options?.sort ?? "newest";
  const empty: CatalogProductsResult = {
    products: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
  };

  if (!hasSupabaseConfig()) return empty;

  try {
    const supabase = createPublicClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select("*, categories(id, name, slug)", { count: "exact" })
      .range(from, to);

    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "name-asc":
        query = query.order("product_name", { ascending: true });
        break;
      case "name-desc":
        query = query.order("product_name", { ascending: false });
        break;
      case "sku-asc":
        query = query.order("sku", { ascending: true });
        break;
      case "featured":
        query = query
          .order("featured", { ascending: false })
          .order("product_name", { ascending: true });
        break;
      case "updated":
        query = query.order("updated_at", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    if (options?.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }
    if (options?.search?.trim()) {
      const q = options.search.trim();
      query = query.or(
        `product_name.ilike.%${q}%,sku.ilike.%${q}%,short_description.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("getCatalogProducts:", error.message);
      return empty;
    }

    const total = count ?? 0;
    return {
      products: (data as ProductWithCategory[]) ?? [],
      total,
      page,
      pageSize,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  } catch (e) {
    console.error("getCatalogProducts:", e);
    return empty;
  }
}

/** @deprecated Prefer getCatalogProducts — kept for admin compatibility */
export type AdminProductsResult = CatalogProductsResult;

export async function getAdminProducts(options?: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminProductsResult> {
  return getCatalogProducts({
    ...options,
    sort: "updated",
    pageSize: options?.pageSize ?? 10,
  });
}

export type ActivityItem = {
  id: string;
  type: "inquiry" | "product" | "category";
  title: string;
  subtitle: string;
  href: string;
  created_at: string;
};

export async function getRecentActivity(
  limit = 10
): Promise<ActivityItem[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    const supabase = await createClient();
    const [inquiries, products, categories] = await Promise.all([
      supabase
        .from("inquiries")
        .select("id, customer_name, company_name, email, created_at, products(product_name)")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("products")
        .select("id, product_name, sku, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(limit),
      supabase
        .from("categories")
        .select("id, name, slug, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const items: ActivityItem[] = [];

    for (const inq of inquiries.data ?? []) {
      const productName = (
        inq.products as { product_name: string } | null
      )?.product_name;
      items.push({
        id: `inquiry-${inq.id}`,
        type: "inquiry",
        title: `Inquiry from ${inq.customer_name}`,
        subtitle: [inq.company_name || inq.email, productName]
          .filter(Boolean)
          .join(" · "),
        href: "/admin/inquiries",
        created_at: inq.created_at,
      });
    }

    for (const p of products.data ?? []) {
      const isNew =
        new Date(p.updated_at).getTime() - new Date(p.created_at).getTime() <
        5000;
      items.push({
        id: `product-${p.id}-${p.updated_at}`,
        type: "product",
        title: isNew ? `Product added: ${p.product_name}` : `Product updated: ${p.product_name}`,
        subtitle: `SKU ${p.sku}`,
        href: `/admin/products/${p.id}/edit`,
        created_at: p.updated_at,
      });
    }

    for (const c of categories.data ?? []) {
      items.push({
        id: `category-${c.id}`,
        type: "category",
        title: `Category added: ${c.name}`,
        subtitle: c.slug,
        href: `/admin/categories/${c.id}/edit`,
        created_at: c.created_at,
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  } catch (e) {
    console.error("getRecentActivity:", e);
    return [];
  }
}
