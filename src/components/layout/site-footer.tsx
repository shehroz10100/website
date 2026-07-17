import Link from "next/link";
import { siteContact } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden text-white">
      <div className="absolute inset-0 steel-gradient" />
      <div className="hero-grid absolute inset-0 opacity-25" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold">
            Nexvor<span className="text-sky-300"> Intl</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Precision surgical instruments for hospitals, distributors, and OEM
            partners worldwide. Certified quality. Reliable global supply.
          </p>
          <div className="mt-5 space-y-1.5 text-sm text-white/70">
            <p>{siteContact.address}</p>
            <a
              href={siteContact.phoneHref}
              className="block transition hover:text-white"
            >
              {siteContact.phone}
            </a>
            <a
              href={`mailto:${siteContact.email}`}
              className="block transition hover:text-white"
            >
              {siteContact.email}
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-200/80">
            Catalog
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/products" className="transition hover:text-white">
                Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="transition hover:text-white">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="transition hover:text-white">
                Catalog Download
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-200/80">
            Company
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/about" className="transition hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/quality-assurance" className="transition hover:text-white">
                Quality Assurance
              </Link>
            </li>
            <li>
              <Link href="/certifications" className="transition hover:text-white">
                Certifications
              </Link>
            </li>
            <li>
              <Link href="/manufacturing" className="transition hover:text-white">
                Manufacturing Process
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-200/80">
            Legal
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${siteContact.email}`}
                className="transition hover:text-white"
              >
                {siteContact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/15 bg-black/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Nexvor Intl. All rights reserved.</p>
          <p>ISO 13485 · CE · FDA Registered Facility</p>
        </div>
      </div>
    </footer>
  );
}
