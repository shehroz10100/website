"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  const companyActive = companyLinks.some((l) => pathname.startsWith(l.href));

  useEffect(() => {
    setOpen(false);
    setCompanyOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setCompanyOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 text-steel backdrop-blur-md">
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
              className={cn(
                "text-sm font-medium text-muted-foreground transition hover:text-primary",
                pathname.startsWith(link.href) && "text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCompanyOpen((v) => !v)}
              aria-expanded={companyOpen}
              aria-haspopup="true"
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary",
                companyActive && "text-primary"
              )}
            >
              Company <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {companyOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[200px] rounded-xl border border-border bg-white py-2 shadow-[var(--shadow-card)]">
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
            )}
          </div>
          <Button asChild size="sm" className="rounded-full px-5 shadow-sm">
            <Link href="/contact">Request Quote</Link>
          </Button>
        </nav>

        <button
          type="button"
          className="text-steel lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-border bg-white px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link href="/contact" onClick={() => setOpen(false)}>
                Request Quote
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
