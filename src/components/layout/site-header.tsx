import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

const links = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/catalog", label: "Catalog" },
  { href: "/contact", label: "Contact Us" },
];

const companyLinks = [
  { href: "/quality-assurance", label: "Quality Assurance" },
  { href: "/certifications", label: "Certifications" },
  { href: "/manufacturing", label: "Manufacturing" },
];

/** Server header — desktop nav has no client JS (helps INP / FID). */
export function SiteHeader() {
  return (
    <header className="relative sticky top-0 z-50 border-b border-border/80 bg-white text-steel">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-steel"
        >
          Nexvor<span className="text-primary"> Intl</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
              aria-haspopup="true"
            >
              Company
              <span className="text-[10px]" aria-hidden>
                ▾
              </span>
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-border bg-white py-2 opacity-0 shadow-[var(--shadow-card)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Button asChild size="sm" className="rounded-full px-5 shadow-sm">
            <Link href="/contact">Request Quote</Link>
          </Button>
        </nav>

        <SiteHeaderClient links={links} companyLinks={companyLinks} />
      </div>
    </header>
  );
}
