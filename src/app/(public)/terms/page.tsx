import { PageHero } from "@/components/layout/page-hero";
import { buildMetadata } from "@/lib/seo";
import { siteContact } from "@/lib/site-content";

export const metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms and conditions for use of the Nexvor Intl website.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div>
      <PageHero
        title="Terms & Conditions"
        description="Terms governing use of this website and requests submitted through our forms."
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              1. Website use
            </h2>
            <p className="mt-3">
              This website provides product and company information for B2B
              buyers, distributors, and partners. Content is for general
              information and does not constitute a binding offer unless
              confirmed in writing by Nexvor Intl.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              2. Quotes and orders
            </h2>
            <p className="mt-3">
              Inquiries submitted online are requests for information or
              quotation. Prices, lead times, and availability are confirmed only
              through formal commercial communication.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              3. Product information
            </h2>
            <p className="mt-3">
              Specifications, certifications, and stock status may change.
              Always verify critical requirements with our sales team before
              purchasing or distributing instruments.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              4. Intellectual property
            </h2>
            <p className="mt-3">
              Site content, branding, and product descriptions are owned by
              Nexvor Intl or its licensors. You may not copy or redistribute
              materials for commercial use without permission.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              5. Limitation of liability
            </h2>
            <p className="mt-3">
              To the fullest extent permitted by law, Nexvor Intl is not
              liable for indirect or consequential damages arising from website
              use. Clinical use of instruments must follow applicable medical
              and regulatory guidance.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-steel">
              6. Contact
            </h2>
            <p className="mt-3">
              Questions about these terms: email{" "}
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
