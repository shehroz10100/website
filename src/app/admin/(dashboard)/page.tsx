import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  FolderTree,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const activityStyles = {
  inquiry: "bg-amber-100 text-amber-900",
  product: "bg-emerald-100 text-emerald-900",
  category: "bg-sky-100 text-sky-900",
};

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(12),
  ]);

  const cards = [
    {
      label: "Total Products",
      value: stats.products,
      href: "/admin/products",
      icon: Package,
      hint: `${stats.featured} featured`,
    },
    {
      label: "Categories",
      value: stats.categories,
      href: "/admin/categories",
      icon: FolderTree,
      hint: "Instrument lines",
    },
    {
      label: "Inquiries",
      value: stats.inquiries,
      href: "/admin/inquiries",
      icon: MessageSquare,
      hint: "Quote requests",
    },
    {
      label: "Featured",
      value: stats.featured,
      href: "/admin/products",
      icon: Star,
      hint: "Homepage highlights",
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-steel">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of catalog health and recent activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/categories/new">Add category</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border bg-white p-5 transition hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold text-steel">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Recent Activity
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/inquiries">View inquiries</Link>
          </Button>
        </div>
        <div className="divide-y">
          {activity.length > 0 ? (
            activity.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col gap-2 px-5 py-4 text-sm transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={activityStyles[item.type]}
                      variant="secondary"
                    >
                      {item.type}
                    </Badge>
                    <p className="font-medium text-steel">{item.title}</p>
                  </div>
                  {item.subtitle && (
                    <p className="mt-1 truncate text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </Link>
            ))
          ) : (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No recent activity yet. Add products or wait for inquiries.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
