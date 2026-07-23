import type { Metadata } from "next";
import { Outfit, Figtree } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SITE_DESCRIPTION, SITE_NAME, buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const base = buildMetadata({
  title: `${SITE_NAME} | Precision Surgical Instruments`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  ...base,
  title: {
    default: `${SITE_NAME} | Precision Surgical Instruments`,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Medical Devices",
  keywords: [
    "surgical instruments",
    "B2B surgical supplier",
    "ISO 13485",
    "German stainless steel",
    "hospital instruments",
    "OEM surgical instruments",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${figtree.variable} antialiased`}>
        <SiteJsonLd />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
