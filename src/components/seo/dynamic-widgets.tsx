"use client";

import dynamic from "next/dynamic";

export const InquiryFormDynamic = dynamic(
  () =>
    import("@/components/forms/inquiry-form").then((m) => m.InquiryForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-md bg-muted" aria-hidden />
    ),
  }
);

export const ProductImageGalleryDynamic = dynamic(
  () =>
    import("@/components/products/product-image-gallery").then(
      (m) => m.ProductImageGallery
    ),
  {
    loading: () => (
      <div className="aspect-square animate-pulse bg-muted" aria-hidden />
    ),
  }
);
