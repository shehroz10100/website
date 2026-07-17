import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { exportCountries } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "About Nexvor Intl — precision instrument manufacturing for hospitals, distributors, and OEM partners.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="Company"
        title="About Us"
        description="We manufacture and supply precision surgical instruments for hospitals, group purchasing organizations, and OEM private-label programs."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "About Us" },
          ]}
        />
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold text-steel">
              Built for clinical reliability
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every instrument is produced from surgical-grade stainless alloys,
              finished for sterilization cycles, and inspected against
              dimensional and functional tolerances. Our quality system is
              aligned with ISO 13485 requirements for medical device
              manufacturing.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Procurement teams work with us for consistent SKUs, documentation
              packs, and scalable production capacity — from sample lots to
              annual contracts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/manufacturing">Manufacturing process</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/quality-assurance">Quality assurance</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              {
                title: "Materials",
                text: "German stainless steel grades selected for corrosion resistance, hardness, and edge retention.",
              },
              {
                title: "Compliance",
                text: "CE marking pathways, FDA-registered facility documentation, and lot traceability on request.",
              },
              {
                title: "Partnerships",
                text: "Distributor margins, private label branding, and custom instrument sets for health systems.",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 border-primary pl-4">
                <h3 className="font-display text-lg font-semibold text-steel">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-steel">
            Markets we serve
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {exportCountries.map((country) => (
              <li
                key={country}
                className="border-b border-border py-2 text-sm text-muted-foreground"
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
