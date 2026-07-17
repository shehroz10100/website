import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { manufacturingSteps } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Manufacturing Process",
  description:
    "How Nexvor Intl manufactures precision instruments — from material selection to inspection, packaging, and export dispatch.",
  path: "/manufacturing",
});

export default function ManufacturingPage() {
  return (
    <div>
      <PageHero
        eyebrow="Production"
        title="Manufacturing Process"
        description="A controlled path from surgical-grade alloys to sterilized-ready instruments for global B2B supply."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Manufacturing" },
          ]}
        />
        <ol className="mt-8 space-y-10">
          {manufacturingSteps.map((step) => (
            <li
              key={step.step}
              className="grid gap-4 border-b border-border pb-10 last:border-0 sm:grid-cols-[120px_1fr] sm:gap-8"
            >
              <div>
                <p className="font-mono text-sm text-primary">{step.step}</p>
                <step.icon className="mt-3 h-7 w-7 text-steel" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-steel">
                  {step.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Button asChild className="mt-4">
          <Link href="/quality-assurance">See quality gates</Link>
        </Button>
      </section>
    </div>
  );
}
