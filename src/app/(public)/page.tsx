import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { CategoryCard } from "@/components/products/category-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getProducts } from "@/lib/queries";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  buildMetadata,
} from "@/lib/seo";
import {
  ABOUT_PANEL_IMAGE,
  HERO_BACKGROUND_IMAGE,
  HERO_BACKGROUND_IMAGE_MOBILE,
  certifications,
  exportCountries,
  manufacturingSteps,
  qualityPillars,
  testimonials,
  whyChooseUs,
} from "@/lib/site-content";

export const metadata: Metadata = buildMetadata({
  title: { absolute: `${SITE_NAME} | Precision Surgical Instruments` },
  description: SITE_DESCRIPTION,
  path: "/",
});

/** Longer CDN cache — cuts mobile TTFB on repeat visits */
export const revalidate = 300;

function HeroBackground() {
  const common = {
    alt: "Precision stainless steel surgical instruments",
    sizes: "100vw",
    quality: 55,
  };

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...common,
    src: HERO_BACKGROUND_IMAGE_MOBILE,
    width: 800,
    height: 534,
  });

  const {
    props: { srcSet: desktopSrcSet, ...rest },
  } = getImageProps({
    ...common,
    src: HERO_BACKGROUND_IMAGE,
    width: 1280,
    height: 854,
    priority: true,
  });

  return (
    <picture>
      <source media="(max-width: 768px)" srcSet={mobileSrcSet} sizes="100vw" />
      {/* Art-directed LCP hero — picture + optimized srcSets */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...rest}
        srcSet={desktopSrcSet}
        alt={common.alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getProducts({ featured: true, limit: 6 }),
    getCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${SITE_NAME} | Precision Surgical Instruments`,
          description: SITE_DESCRIPTION,
          isPartOf: { "@type": "WebSite", name: SITE_NAME },
        }}
      />
      {/* Hero Banner — art-directed image, no motion (CLS/LCP) */}
      <section className="relative isolate min-h-[62vh] overflow-hidden text-white sm:min-h-[75vh] lg:min-h-[85vh]">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-steel/92 via-steel/75 to-steel/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-steel/70 via-transparent to-steel/30" />
        <div className="relative mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[75vh] sm:px-6 sm:py-24 lg:min-h-[85vh] lg:px-8">
          <p className="font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Nexvor Intl
          </p>
          <div className="mt-4 h-1 w-24 bg-primary" />
          <h1 className="mt-5 max-w-2xl font-display text-xl font-medium leading-snug text-white/90 sm:mt-6 sm:text-3xl">
            Precision instruments for the modern OR
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-lg">
            German stainless steel surgical tools for hospitals, distributors,
            and OEM partners — engineered for reliability under sterilization.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <Button asChild size="lg" className="rounded-full bg-primary px-8 shadow-sm hover:bg-teal-deep">
              <Link href="/products">
                Browse Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/contact">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="border-b border-border bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              About Nexvor
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-steel sm:text-4xl">
              Company introduction
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Nexvor Intl manufactures and supplies precision surgical
              instruments for hospitals, GPOs, distributors, and OEM
              private-label programs. Our focus is consistent SKUs, certified
              quality systems, and dependable export logistics.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From general surgery forceps to laparoscopic graspers, every line
              is produced for sterilization durability and clinical reliability.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/about">Learn more about us</Link>
            </Button>
          </div>
          <div className="relative min-h-[280px] overflow-hidden text-white sm:min-h-[320px]">
            <Image
              src={ABOUT_PANEL_IMAGE}
              alt="Stainless steel surgical scissors"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={55}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-steel/90 via-steel/45 to-transparent" />
            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-8 sm:min-h-[320px]">
              <p className="font-display text-2xl font-semibold">
                Built for procurement teams
              </p>
              <p className="mt-2 max-w-md text-sm text-white/75">
                Documentation packs, lot traceability, and scalable production
                capacity for annual contracts and sample lots alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold text-steel sm:text-4xl">
                Product categories
              </h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Specialty lines for general, orthopedic, cardiovascular, ENT,
                laparoscopic, and dental surgery.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/categories">All categories</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length > 0 ? (
              categories.slice(0, 6).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))
            ) : (
              <p className="col-span-full text-muted-foreground">
                Categories will appear here once the catalog is loaded.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[380px]">
            <Image
              src="/images/categories/general-surgery.jpg"
              alt="Featured stainless steel surgical instruments"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
              quality={55}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-steel/90 via-steel/70 to-steel/40" />
            <div className="relative z-10 flex min-h-[320px] flex-col items-start justify-center px-6 py-12 sm:min-h-[380px] sm:px-10 lg:px-14">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Featured products
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
                High-demand SKUs trusted by surgical teams and procurement
                partners.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full bg-primary px-8 shadow-sm hover:bg-teal-deep"
              >
                <Link href="/products">
                  View all products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-steel sm:text-4xl">
              Why choose us
            </h2>
            <p className="mt-2 text-muted-foreground">
              A manufacturing partner designed for clinical buyers and global
              distributors.
            </p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div key={item.title}>
                <item.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold text-steel">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="bg-steel py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Manufacturing process
              </h2>
              <p className="mt-2 max-w-lg text-white/65">
                From alloy selection to export dispatch — a controlled path to
                clinical-ready instruments.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/manufacturing">Full process</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {manufacturingSteps.map((step) => (
              <div key={step.step} className="border-t border-primary/50 pt-5">
                <p className="font-mono text-xs text-primary">{step.step}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold text-steel sm:text-4xl">
                Quality assurance
              </h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Inspection checkpoints and release criteria designed for medical
                device manufacturing.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/quality-assurance">Quality details</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {qualityPillars.map((item) => (
              <div
                key={item.title}
                className="border-l-2 border-primary bg-white py-2 pl-4"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-display text-lg font-semibold text-steel">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="relative overflow-hidden py-20 text-white">
        <div className="absolute inset-0 steel-gradient" />
        <div className="absolute inset-0 bg-steel/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Certifications
              </h2>
              <p className="mt-2 max-w-lg text-white/65">
                Compliance documentation supporting hospital and distributor
                onboarding.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/certifications">View certifications</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:border-primary/50 hover:bg-white/10"
              >
                <div className="h-1 w-10 bg-primary" />
                <p className="mt-4 font-display text-xl font-semibold">
                  {cert.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {cert.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Export Countries */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-steel sm:text-4xl">
              Global export countries
            </h2>
            <p className="mt-2 text-muted-foreground">
              Serving hospitals and distributors across major healthcare markets.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {exportCountries.map((country) => (
              <li
                key={country}
                className="border-b border-border py-3 text-sm font-medium text-steel"
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-steel sm:text-4xl">
            Customer testimonials
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Feedback from procurement leaders and clinical materials teams.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="border-t-2 border-primary pt-6">
                <p className="text-base leading-relaxed text-steel">
                  “{item.quote}”
                </p>
                <footer className="mt-6">
                  <p className="font-semibold text-steel">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative overflow-hidden py-24">
        <Image
          src={HERO_BACKGROUND_IMAGE}
          alt=""
          fill
          quality={60}
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div className="absolute inset-0 bg-steel/88" />
        <div className="relative mx-auto max-w-3xl px-4 text-center text-white sm:px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to request a quote?
          </h2>
          <p className="mt-4 text-white/70">
            Share volumes, certifications, and destination country — our sales
            team responds with pricing and lead times.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-white px-8 text-primary hover:bg-white/90">
              <Link href="/contact">Contact us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/catalog">Download catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
