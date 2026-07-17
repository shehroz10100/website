import { PageHero } from "@/components/layout/page-hero";
import { buildMetadata } from "@/lib/seo";
import { siteContact } from "@/lib/site-content";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for Nexvor Intl website and inquiry forms.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHero
        title="Privacy Policy"
        description="How we collect, use, and protect information submitted through this website."
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              1. Information we collect
            </h2>
            <p className="mt-3">
              When you submit an inquiry or contact form, we collect details you
              provide such as name, company, email, phone, country, message
              content, and any related product of interest.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              2. How we use information
            </h2>
            <p className="mt-3">
              We use submitted information to respond to quote requests, provide
              product information, manage distributor or OEM discussions, and
              improve our sales support processes.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              3. Sharing
            </h2>
            <p className="mt-3">
              We do not sell personal information. Data may be processed by
              service providers that host our website, database, or email
              systems, solely to operate the business and respond to your
              request.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              4. Retention
            </h2>
            <p className="mt-3">
              Inquiry records are retained as needed for sales follow-up,
              compliance, and legitimate business purposes, then deleted or
              anonymized when no longer required.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              5. Contact
            </h2>
            <p className="mt-3">
              For privacy requests, email{" "}
              <a
                href={`mailto:${siteContact.email}`}
                className="text-primary hover:underline"
              >
                {siteContact.email}
              </a>
              , call{" "}
              <a
                href={siteContact.phoneHref}
                className="text-primary hover:underline"
              >
                {siteContact.phone}
              </a>
              , or write to {siteContact.address}.
            </p>
          </section>
          <p className="text-xs">Last updated: July 17, 2026</p>
        </div>
      </article>
    </div>
  );
}
