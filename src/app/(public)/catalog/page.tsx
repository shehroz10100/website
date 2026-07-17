import Image from "next/image";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/queries";
import { buildMetadata, getCompanyCatalogPdfUrl, SITE_NAME } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Catalog Download",
  description: `Download the ${SITE_NAME} product catalog PDF and individual instrument datasheets.`,
  path: "/catalog",
});

export default async function CatalogPage() {
  const [products, companyCatalogUrl] = await Promise.all([
    getProducts({ featured: true, limit: 12 }),
    Promise.resolve(getCompanyCatalogPdfUrl()),
  ]);
  const withPdf = products.filter((p) => p.pdf_catalog);

  return (
    <div>
      <PageHero
        eyebrow="Resources"
        title="Catalog Download"
        description="Download our complete B2B instrument catalog or individual product PDF datasheets."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Catalog" },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="border border-border bg-white p-8">
            <div className="relative mb-6 aspect-[16/10] overflow-hidden bg-muted">
              <Image
                src="/images/surgical-instruments-catalog.jpg"
                alt="Precision stainless steel surgical instruments"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                quality={75}
              />
            </div>
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-steel">
              Full company catalog
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Download the latest master catalog including specialty lines,
              SKUs, materials, and certification overview for your buying team.
            </p>
            {companyCatalogUrl ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a
                    href={companyCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`${SITE_NAME.replace(/\s+/g, "-").toLowerCase()}-catalog.pdf`}
                  >
                    <Download className="h-4 w-4" /> Download catalog
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Request printed copy</Link>
                </Button>
              </div>
            ) : (
              <Button asChild className="mt-6">
                <Link href="/contact">
                  <Download className="h-4 w-4" /> Request full catalog
                </Link>
              </Button>
            )}
          </div>
          <div className="border border-border bg-muted/40 p-8">
            <h2 className="font-display text-2xl font-semibold text-steel">
              Product PDF catalogs
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Instruments with uploaded PDF datasheets appear below. You can
              also open any product page for available downloads.
            </p>
            <ul className="mt-6 space-y-3">
              {withPdf.length > 0 ? (
                withPdf.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm"
                  >
                    <span className="font-medium text-steel">
                      {product.product_name}
                    </span>
                    <a
                      href={product.pdf_catalog!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-primary hover:underline"
                    >
                      Download PDF
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  No product PDFs uploaded yet. Browse the{" "}
                  <Link
                    href="/products"
                    className="text-primary hover:underline"
                  >
                    product catalog
                  </Link>{" "}
                  or download the full company catalog.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
