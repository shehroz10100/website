import { slugify } from "@/lib/utils";

export type ParsedPdfProductFields = {
  productName: string;
  size: string;
  sku: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  material: string;
  finish: string;
  certifications: string;
  specifications: string;
  metaTitle: string;
  metaDescription: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
};

function pageLines(raw: string): string[] {
  return raw
    .split(/\n+|(?<=\.)\s+|(?<=:)\s+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((l) => !/^(page\s*)?\d+(\s*\/\s*\d+)?$/i.test(l))
    .filter((l) => !/nexvor|catalog|www\.|https?:\/\//i.test(l));
}

/** Extract size like 14cm, 18 cm, 5mm, 140 mm, 5.5", Size: 16cm */
export function extractSize(raw: string): string {
  const labeled =
    raw.match(
      /(?:size|length|lenght|dim(?:ension)?s?)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:cm|mm|in|inch|inches|"|'))/i
    )?.[1] ||
    raw.match(
      /\b([0-9]+(?:\.[0-9]+)?\s*(?:cm|mm))\b/i
    )?.[1] ||
    raw.match(/\b([0-9]+(?:\.[0-9]+)?\s*(?:in|inch|inches))\b/i)?.[1] ||
    raw.match(/\b([0-9]+(?:\.[0-9]+)?\s*["'])\b/)?.[1];

  if (!labeled) return "";
  return labeled.replace(/\s+/g, "").replace(/inches?/i, "in");
}

export function extractSkuFromText(raw: string, pageNumber: number): string {
  const fromLabel =
    raw.match(
      /(?:\bsku\b|\bart\.?\s*no\.?\b|\bref\.?\b|\bcode\b|\bitem\s*#?\b)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9._\-\/]{1,40})/i
    )?.[1] || "";

  if (fromLabel) {
    return fromLabel.replace(/[^A-Za-z0-9._\-]/g, "").slice(0, 64);
  }

  return `NXV-${String(pageNumber).padStart(4, "0")}`;
}

export function cleanProductName(raw: string, size?: string): string {
  const lines = pageLines(raw);
  const sizeNorm = size?.toLowerCase().replace(/\s+/g, "") || "";

  // Prefer a clear instrument-style phrase from the full text
  const instrumentMatch = raw.match(
    /\b([A-Z][A-Za-z0-9\/\-]*(?:\s+[A-Za-z0-9\/\-]+){1,8})\b/
  );

  const candidates = [
    ...(instrumentMatch ? [instrumentMatch[1]] : []),
    ...lines.slice(0, 8),
  ]
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => {
      const compact = l.toLowerCase().replace(/\s+/g, "");
      if (sizeNorm && compact === sizeNorm) return false;
      if (/^(size|length|sku|ref|code|material|finish)\b/i.test(l)) return false;
      if (/^[0-9]+(?:\.[0-9]+)?\s*(?:cm|mm|in|"|')$/i.test(l)) return false;
      if (l.length < 3 || l.length > 120) return false;
      return true;
    })
    .sort((a, b) => b.length - a.length);

  if (!candidates.length) return "";
  return candidates[0].slice(0, 200);
}

function inferMaterial(raw: string, name: string): string {
  const blob = `${raw}\n${name}`.toLowerCase();
  if (/titanium/.test(blob)) return "Titanium";
  if (/tungsten|tc insert|carbide/.test(blob)) return "German stainless steel with TC inserts";
  if (/german\s*stainless|aisi\s*420|420\s*ss|ss\s*420/.test(blob)) {
    return "German stainless steel (AISI 420)";
  }
  if (/stainless|steel|ss\b/.test(blob)) return "German stainless steel";
  return "German stainless steel";
}

function inferFinish(raw: string): string {
  const blob = raw.toLowerCase();
  if (/gold\s*plated|gold\s*coat/.test(blob)) return "Gold-plated";
  if (/black\s*coat|black\s*oxide|DLC/i.test(blob)) return "Black coated";
  if (/satin/.test(blob)) return "Satin finish";
  if (/mirror|polished/.test(blob)) return "Mirror polished";
  if (/matte/.test(blob)) return "Matte finish";
  return "Satin finish";
}

function inferCertifications(raw: string): string {
  const found = new Set<string>();
  if (/iso\s*13485/i.test(raw)) found.add("ISO 13485");
  if (/\bCE\b/.test(raw) || /ce\s*mark/i.test(raw)) found.add("CE");
  if (/fda/i.test(raw)) found.add("FDA");
  if (!found.size) {
    found.add("ISO 13485");
    found.add("CE");
  }
  return [...found].join(", ");
}

export function buildProductFieldsFromPdfPage(
  rawText: string,
  pageNumber: number,
  categoryName?: string
): ParsedPdfProductFields {
  const size = extractSize(rawText);
  const productName =
    cleanProductName(rawText, size) || `Product page ${pageNumber}`;
  const sku = extractSkuFromText(rawText, pageNumber);
  const baseSlug = slugify(
    size ? `${productName}-${size}` : productName
  ) || `product-${pageNumber}`;

  const material = inferMaterial(rawText, productName);
  const finish = inferFinish(rawText);
  const certifications = inferCertifications(rawText);
  const categoryLabel = categoryName?.trim() || "surgical";

  const sizePhrase = size ? ` (${size})` : "";
  const shortDescription =
    `${productName}${sizePhrase} — precision ${categoryLabel.toLowerCase()} instrument in ${material.toLowerCase()}, designed for clinical reliability and sterilization durability.`.slice(
      0,
      500
    );

  const fullDescription = [
    `${productName}${sizePhrase} is a precision surgical instrument manufactured for hospitals, distributors, and OEM partners.`,
    size
      ? `Catalog size: ${size}.`
      : "Refer to the product image and specifications for dimensions.",
    `Material: ${material}. Finish: ${finish}.`,
    `Produced under certified quality systems (${certifications}) for consistent SKUs and dependable B2B supply.`,
  ].join(" ");

  const specs: string[] = [];
  if (size) specs.push(`Size: ${size}`);
  specs.push(`Material: ${material}`);
  specs.push(`Finish: ${finish}`);
  specs.push("Sterilization: Autoclavable");
  specs.push("Application: Surgical / clinical use");

  const metaTitle = `${productName}${size ? ` ${size}` : ""}`.slice(0, 70);
  const metaDescription = shortDescription.slice(0, 160);

  return {
    productName,
    size,
    sku,
    slug: baseSlug.slice(0, 200),
    shortDescription,
    fullDescription: fullDescription.slice(0, 10000),
    material,
    finish,
    certifications,
    specifications: specs.join("\n"),
    metaTitle,
    metaDescription,
    stockStatus: "in_stock",
  };
}
