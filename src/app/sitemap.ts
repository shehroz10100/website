import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/categories", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    {
      path: "/quality-assurance",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/certifications",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/manufacturing",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    { path: "/catalog", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/products/${p.slug}`),
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: p.featured ? 0.85 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/categories/${c.slug}`),
    lastModified: new Date(c.created_at),
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
