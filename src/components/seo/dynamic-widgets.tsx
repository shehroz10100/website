"use client";

import dynamic from "next/dynamic";

export const InquiryFormDynamic = dynamic(
  () =>
    import("@/components/forms/inquiry-form").then((m) => m.InquiryForm),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-md bg-muted" aria-hidden />
    ),
  }
);
