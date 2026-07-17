import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Page not found",
  description: "The page you requested could not be found on Nexvor Intl.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-semibold text-steel/20">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-steel">
        Page not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        The page you requested does not exist.
      </p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Return home
      </Link>
    </div>
  );
}
