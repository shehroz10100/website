import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { siteContact } from "@/lib/site-content";

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Nexvor Intl";

export const SITE_DESCRIPTION =
  "B2B manufacturer and supplier of precision surgical instruments. German stainless steel, ISO 13485 certified, global distribution for hospitals and OEMs.";

export {
  COMPANY_CATALOG_STORAGE_PATH,
  getCompanyCatalogPdfUrl,
} from "@/lib/catalog";

type BuildMetadataInput = {
  title: string | { absolute: string };
  description: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "",
  image,
  type = "website",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedImage =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : image
        ? absoluteUrl(image)
        : absoluteUrl("/opengraph-image");
  const titleText = typeof title === "string" ? title : title.absolute;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: titleText,
      description,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: titleText,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: [resolvedImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon"),
    description: SITE_DESCRIPTION,
    email: siteContact.email,
    telephone: siteContact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Street#6 Masjid vali Fazalpura",
      addressLocality: "Sambrial",
      addressRegion: "Sialkot",
      addressCountry: "PK",
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: siteContact.email,
      telephone: siteContact.phone,
      availableLanguage: ["English", "Urdu"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/products?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: {
  product_name: string;
  short_description: string | null;
  sku: string;
  product_images: string[] | null;
  material: string | null;
  slug: string;
  stock_status?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    description: product.short_description,
    sku: product.sku,
    material: product.material || undefined,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    image: product.product_images?.length
      ? product.product_images
      : [absoluteUrl("/opengraph-image")],
    url: absoluteUrl(`/products/${product.slug}`),
    // Quote-based B2B catalog — omit Offer/price to avoid invalid Product rich results
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Availability",
        value:
          product.stock_status === "out_of_stock"
            ? "Out of stock"
            : product.stock_status === "made_to_order"
              ? "Made to order"
              : "Available for quote",
      },
    ],
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}
