/** Fixed path in the `pdf-catalogs` Supabase Storage bucket */
export const COMPANY_CATALOG_STORAGE_PATH = "company/full-catalog.pdf";

/**
 * Public URL for the full company catalog PDF.
 * Prefer `NEXT_PUBLIC_CATALOG_PDF_URL`, otherwise the default Storage object URL.
 */
export function getCompanyCatalogPdfUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_CATALOG_PDF_URL?.trim();
  if (fromEnv) return fromEnv;

  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  if (!base) return null;

  return `${base.replace(/\/$/, "")}/storage/v1/object/public/pdf-catalogs/${COMPANY_CATALOG_STORAGE_PATH}`;
}
