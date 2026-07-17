export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "made_to_order";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  product_name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  full_description: string | null;
  specifications: Record<string, string> | null;
  material: string | null;
  finish: string | null;
  certifications: string[] | null;
  product_images: string[] | null;
  pdf_catalog: string | null;
  featured: boolean;
  stock_status: StockStatus;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Inquiry = {
  id: string;
  customer_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  message: string;
  product_id: string | null;
  created_at: string;
};

export type InquiryWithProduct = Inquiry & {
  products: Pick<Product, "id" | "product_name" | "sku" | "slug"> | null;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          category_id?: string | null;
          product_name: string;
          slug: string;
          sku: string;
          short_description?: string | null;
          full_description?: string | null;
          specifications?: Record<string, string> | Json | null;
          material?: string | null;
          finish?: string | null;
          certifications?: string[] | null;
          product_images?: string[] | null;
          pdf_catalog?: string | null;
          featured?: boolean;
          stock_status?: StockStatus;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          product_name?: string;
          slug?: string;
          sku?: string;
          short_description?: string | null;
          full_description?: string | null;
          specifications?: Record<string, string> | Json | null;
          material?: string | null;
          finish?: string | null;
          certifications?: string[] | null;
          product_images?: string[] | null;
          pdf_catalog?: string | null;
          featured?: boolean;
          stock_status?: StockStatus;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: Inquiry;
        Insert: {
          id?: string;
          customer_name: string;
          company_name?: string | null;
          email: string;
          phone?: string | null;
          country?: string | null;
          message: string;
          product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          company_name?: string | null;
          email?: string;
          phone?: string | null;
          country?: string | null;
          message?: string;
          product_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
