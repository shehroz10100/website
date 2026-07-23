import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { stockStatusLabel } from "@/lib/utils";
import type { ProductWithCategory } from "@/types/database";

type Props = {
  product: ProductWithCategory;
};

export function ProductCard({ product }: Props) {
  const image = product.product_images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-premium group block overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.product_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
            <span className="font-display text-4xl font-semibold text-primary/20">
              VX
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.categories?.name ?? "Catalog"}
          </p>
          <Badge
            variant={
              product.stock_status === "in_stock"
                ? "success"
                : product.stock_status === "low_stock"
                  ? "warning"
                  : "secondary"
            }
          >
            {stockStatusLabel(product.stock_status)}
          </Badge>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-steel group-hover:text-primary">
          {product.product_name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.short_description}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          SKU: {product.sku}
        </p>
      </div>
    </Link>
  );
}
