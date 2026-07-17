import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { qualityPillars } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Quality Assurance",
  description:
    "Nexvor Intl quality assurance — material control, in-process inspection, final release testing, and lot traceability.",
  path: "/quality-assurance",
});

export default function QualityAssurancePage() {
  return (
    <div>
      <PageHero
        eyebrow="Quality"
        title="Quality Assurance"
        description="Inspection checkpoints and release criteria designed for medical device manufacturing and hospital procurement standards."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Quality Assurance" },
          ]}
        />
        <div className="mt-8 max-w-3xl">
          <h2 className="font-display text-3xl font-semibold text-steel">
            How we protect clinical reliability
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Every production lot moves through documented quality gates — from
            incoming alloy verification to final functional checks. Our
            processes align with ISO 13485 expectations so distributors and
            hospitals receive instruments ready for sterilization and use.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {qualityPillars.map((item) => (
            <div key={item.title} className="border-l-2 border-primary pl-5">
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-xl font-semibold text-steel">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/certifications">View certifications</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Ask about documentation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
