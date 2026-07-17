"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  FileUp,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/import", label: "Import PDF", icon: FileUp },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/catalog", label: "Catalog PDF", icon: FileText },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

export function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b bg-steel px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="font-display font-semibold">
          Nexvor Admin
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="space-y-1 border-b bg-steel p-3 lg:hidden">
          <NavLinks />
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </form>
        </div>
      )}
      <aside className="hidden w-64 shrink-0 flex-col bg-steel text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="font-display text-lg font-semibold">
            Nexvor Admin
          </Link>
          {email && (
            <p className="mt-1 truncate text-xs text-white/50">{email}</p>
          )}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLinks />
        </nav>
        <div className="border-t border-white/10 p-3">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </form>
          <Link
            href="/"
            className="mt-2 block px-3 text-xs text-white/40 hover:text-white/70"
          >
            ← View site
          </Link>
        </div>
      </aside>
    </>
  );
}
