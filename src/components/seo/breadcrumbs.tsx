import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: Props) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav
        aria-label="Breadcrumb"
        className={cn("mb-6 text-sm text-muted-foreground", className)}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={cn(isLast && "text-foreground")}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
