import type { Metadata } from "next";
import Link from "next/link";
import { deleteInquiryAction } from "@/lib/actions";
import { getInquiries } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-steel">
        Inquiries
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quote requests from the contact and product forms
      </p>

      <div className="mt-8 space-y-4">
        {inquiries.length > 0 ? (
          inquiries.map((inq) => (
            <article
              key={inq.id}
              className="rounded-lg border bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="font-display text-lg font-semibold text-steel">
                    {inq.customer_name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[inq.company_name, inq.country].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-muted-foreground">
                    {formatDate(inq.created_at)}
                  </time>
                  <DeleteButton
                    id={inq.id}
                    label="inquiry"
                    onDelete={deleteInquiryAction}
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Email: </span>
                  <a
                    href={`mailto:${inq.email}`}
                    className="text-primary hover:underline"
                  >
                    {inq.email}
                  </a>
                </p>
                {inq.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone: </span>
                    {inq.phone}
                  </p>
                )}
                {inq.products && (
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Product: </span>
                    <Link
                      href={`/products/${inq.products.slug}`}
                      className="text-primary hover:underline"
                    >
                      {inq.products.product_name} ({inq.products.sku})
                    </Link>
                  </p>
                )}
              </div>
              <p className="mt-4 whitespace-pre-line rounded-md bg-muted/60 p-3 text-sm leading-relaxed">
                {inq.message}
              </p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border bg-white px-5 py-10 text-center text-sm text-muted-foreground">
            No inquiries yet.
          </p>
        )}
      </div>
    </div>
  );
}
