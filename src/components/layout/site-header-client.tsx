"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavLink = { href: string; label: string };

type Props = {
  links: NavLink[];
  companyLinks: NavLink[];
};

/** Mobile menu only — keeps homepage desktop JS small for better INP/FID. */
export function SiteHeaderClient({ links, companyLinks }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="text-steel"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-16 border-b border-border bg-white px-4 py-4 shadow-sm"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {[...links, ...companyLinks].map((link) => (
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
    </div>
  );
}
