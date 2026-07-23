import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/database";
import { categoryDisplayImage } from "@/lib/site-content";
import { categoryDescription } from "@/lib/surgical-categories";

type Props = {
  category: Category;
};

export function CategoryCard({ category }: Props) {
  const imageSrc = categoryDisplayImage(
    category.slug,
    category.image,
    category.name
  );
  const description =
    category.description?.trim() || categoryDescription(category.name);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block aspect-[4/3] min-h-[220px] overflow-hidden text-white"
    >
      <Image
        src={imageSrc}
        alt={`${category.name} surgical instruments`}
        fill
        className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        quality={65}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-steel/95 via-steel/55 to-steel/20 transition duration-500 group-hover:from-steel/90 group-hover:via-steel/45" />
      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-6">
        <h3 className="font-display text-2xl font-semibold tracking-tight">
          {category.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/80">{description}</p>
        <span className="mt-4 text-sm font-medium text-white/95 transition group-hover:translate-x-1">
          View instruments →
        </span>
      </div>
    </Link>
  );
}
