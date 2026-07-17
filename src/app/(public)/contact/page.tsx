import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { InquiryFormDynamic } from "@/components/seo/dynamic-widgets";
import { buildMetadata } from "@/lib/seo";
import { siteContact } from "@/lib/site-content";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Contact Nexvor Intl for RFQs, distributor partnerships, and OEM private-label inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Sales"
        title="Contact Us"
        description="Share your requirements — product SKUs, quantities, destination country, and certification needs. We typically respond within one business day."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Contact Us" },
          ]}
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-steel">
              Sales contacts
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <a
                  href={`mailto:${siteContact.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {siteContact.email}
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <a
                  href={siteContact.phoneHref}
                  className="font-medium text-primary hover:underline"
                >
                  {siteContact.phone}
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium text-steel">
                  {siteContact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Hours</p>
                <p className="font-medium text-steel">
                  Mon–Fri, 09:00–18:00 (PKT)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Catalog</p>
                <a
                  href="/catalog"
                  className="font-medium text-primary hover:underline"
                >
                  Download catalog resources
                </a>
              </div>
            </div>
          </div>
          <div className="card-premium p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-steel">
              Send an inquiry
            </h2>
            <div className="mt-4">
              <InquiryFormDynamic />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Prefer a product-specific quote? Open any product page and use the
              inquiry form there.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
