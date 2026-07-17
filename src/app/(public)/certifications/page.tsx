import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { certifications } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Certifications",
  description:
    "ISO 13485, CE Mark, FDA-registered facility documentation, and material compliance for Nexvor Intl instruments.",
  path: "/certifications",
});

export default function CertificationsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Compliance"
        title="Certifications"
        description="Compliance documentation supporting hospital onboarding, distributor agreements, and export programs."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Certifications" },
          ]}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {certifications.map((cert) => (
            <article
              key={cert.name}
              className="border border-border bg-white p-8"
            >
              <h2 className="font-display text-2xl font-semibold text-steel">
                {cert.name}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {cert.detail}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Need certificates for a tender or vendor onboarding pack? Contact
          sales with your destination market and we will share the applicable
          documentation set.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">Request certificates</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quality-assurance">Quality assurance</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
