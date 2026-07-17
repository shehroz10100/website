import { z } from "zod";

const noHtml = (label: string) =>
  z
    .string()
    .max(5000)
    .refine((v) => !/<[^>]*>/.test(v), {
      message: `${label} cannot contain HTML`,
    });

export const inquirySchema = z.object({
  customer_name: noHtml("Name")
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  company_name: noHtml("Company").max(160).optional().or(z.literal("")),
  email: z
    .string()
    .email("Enter a valid email address")
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  phone: z
    .string()
    .max(40)
    .regex(/^[0-9+\-().\s]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  country: noHtml("Country").max(80).optional().or(z.literal("")),
  message: noHtml("Message")
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message is too long"),
  product_id: z.string().uuid().optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const categorySchema = z.object({
  name: noHtml("Name").min(2, "Name is required").max(120),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: noHtml("Description").max(2000).optional().or(z.literal("")),
  image: z.union([z.string().url(), z.literal("")]).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  product_name: noHtml("Product name").min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  sku: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[A-Za-z0-9._\-]+$/, "Invalid SKU format"),
  category_id: z.string().uuid().optional().or(z.literal("")),
  short_description: noHtml("Short description").max(500).optional().or(z.literal("")),
  full_description: noHtml("Full description").max(10000).optional().or(z.literal("")),
  material: noHtml("Material").max(200).optional().or(z.literal("")),
  finish: noHtml("Finish").max(200).optional().or(z.literal("")),
  certifications: noHtml("Certifications").max(500).optional().or(z.literal("")),
  specifications: z.string().max(8000).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  stock_status: z.enum([
    "in_stock",
    "low_stock",
    "out_of_stock",
    "made_to_order",
  ]),
  meta_title: noHtml("Meta title").max(70).optional().or(z.literal("")),
  meta_description: noHtml("Meta description").max(160).optional().or(z.literal("")),
  product_images: z.array(z.union([z.string().url(), z.literal("")])).max(12).optional(),
  pdf_catalog: z.union([z.string().url(), z.literal("")]).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").max(254),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
