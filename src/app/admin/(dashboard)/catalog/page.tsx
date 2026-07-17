import type { Metadata } from "next";
import { CompanyCatalogUpload } from "@/components/admin/company-catalog-upload";
import { getCompanyCatalogPdfUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Company Catalog",
  robots: { index: false, follow: false },
};

export default function AdminCatalogPage() {
  const catalogUrl = getCompanyCatalogPdfUrl();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        Company catalog
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the master PDF shown on the public Catalog Download page
      </p>
      <div className="mt-8 max-w-2xl">
        <CompanyCatalogUpload currentUrl={catalogUrl} />
      </div>
    </div>
  );
}
