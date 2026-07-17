import {
  keywordSuggestCategory,
  normalizeCategoryName,
  scoreCategories,
} from "@/lib/surgical-categories";
import { slugify } from "@/lib/utils";

export type OcrEnrichResult = {
  productName: string;
  size: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  material: string;
  finish: string;
  certifications: string;
  specifications: string;
  metaTitle: string;
  metaDescription: string;
  sku: string;
  slug: string;
  source: "ocr";
  rawText: string;
};

/** Known instrument names that appear on catalog plates (most specific first) */
const NAMED_INSTRUMENTS: { pattern: RegExp; name: string; category?: string }[] = [
  // ENT
  { pattern: /\bmcgee\b/i, name: "McGee Forceps", category: "ENT & Microsurgery" },
  { pattern: /\balligator\b/i, name: "Alligator Forceps", category: "ENT & Microsurgery" },
  { pattern: /\bbellucci\b/i, name: "Bellucci Scissors", category: "ENT & Microsurgery" },
  { pattern: /\bhartmann\b/i, name: "Hartmann Forceps", category: "ENT & Microsurgery" },
  { pattern: /\bhouse[- ](?:urban[- ])?(?:forceps|alligator)\b/i, name: "House Forceps", category: "ENT & Microsurgery" },
  { pattern: /\bhouse\s+alligator\b/i, name: "House Alligator Forceps", category: "ENT & Microsurgery" },
  { pattern: /\btroeltsch\b/i, name: "Troeltsch Forceps", category: "ENT & Microsurgery" },
  { pattern: /\bkillian\b/i, name: "Killian Speculum", category: "ENT & Microsurgery" },
  { pattern: /\bcottle\b/i, name: "Cottle Elevator", category: "ENT & Microsurgery" },
  // Cardiovascular
  { pattern: /\bde\s*bakey\b/i, name: "DeBakey Forceps", category: "Cardiovascular" },
  { pattern: /\bcooley\b/i, name: "Cooley Clamp", category: "Cardiovascular" },
  { pattern: /\bsatinsky\b/i, name: "Satinsky Clamp", category: "Cardiovascular" },
  { pattern: /\bbull\s*dog\b/i, name: "Bulldog Clamp", category: "Cardiovascular" },
  { pattern: /\bfogarty\b/i, name: "Fogarty Clamp", category: "Cardiovascular" },
  // Orthopedic
  { pattern: /\bkerrison\b/i, name: "Kerrison Rongeur", category: "Orthopedic" },
  { pattern: /\brongeur\b/i, name: "Bone Rongeur", category: "Orthopedic" },
  { pattern: /\bosteotome\b/i, name: "Osteotome", category: "Orthopedic" },
  { pattern: /\bperiosteal\b/i, name: "Periosteal Elevator", category: "Orthopedic" },
  { pattern: /\blambotte\b/i, name: "Lambotte Osteotome", category: "Orthopedic" },
  { pattern: /\bhohmann\b/i, name: "Hohmann Retractor", category: "Orthopedic" },
  { pattern: /\bgigli\b/i, name: "Gigli Saw", category: "Orthopedic" },
  // Dental
  { pattern: /\bluxator\b/i, name: "Dental Luxator", category: "Dental & Oral" },
  { pattern: /\bcowhorn\b/i, name: "Cowhorn Forceps", category: "Dental & Oral" },
  { pattern: /\bcryer\b/i, name: "Cryer Elevator", category: "Dental & Oral" },
  { pattern: /\bmolar\b/i, name: "Molar Extraction Forceps", category: "Dental & Oral" },
  { pattern: /\bextraction\s+forceps\b/i, name: "Extraction Forceps", category: "Dental & Oral" },
  { pattern: /\bdental\b/i, name: "Dental Instrument", category: "Dental & Oral" },
  // Laparoscopic
  { pattern: /\bveress\b/i, name: "Veress Needle", category: "Laparoscopic" },
  { pattern: /\btrocar\b/i, name: "Trocar", category: "Laparoscopic" },
  { pattern: /\bmaryland\b/i, name: "Maryland Dissector", category: "Laparoscopic" },
  { pattern: /\bgrasper\b/i, name: "Laparoscopic Grasper", category: "Laparoscopic" },
  // Gynecology
  { pattern: /\btenaculum\b/i, name: "Tenaculum", category: "Gynecology" },
  { pattern: /\bgraves\b/i, name: "Graves Speculum", category: "Gynecology" },
  { pattern: /\bsims\s+speculum\b/i, name: "Sims Speculum", category: "Gynecology" },
  { pattern: /\bvaginal\s+speculum\b/i, name: "Vaginal Speculum", category: "Gynecology" },
  // General surgery (common)
  { pattern: /\bmetzenbaum\b/i, name: "Metzenbaum Scissors", category: "General Surgery" },
  { pattern: /\bmayo\s*hegar\b/i, name: "Mayo Hegar Needle Holder", category: "General Surgery" },
  { pattern: /\bolsen\s*hegar\b/i, name: "Olsen Hegar Needle Holder", category: "General Surgery" },
  { pattern: /\bmayo\s*scissors\b/i, name: "Mayo Scissors", category: "General Surgery" },
  { pattern: /\ballis\b/i, name: "Allis Forceps", category: "General Surgery" },
  { pattern: /\bkelly\b/i, name: "Kelly Forceps", category: "General Surgery" },
  { pattern: /\bkocher\b/i, name: "Kocher Forceps", category: "General Surgery" },
  { pattern: /\bbabcock\b/i, name: "Babcock Forceps", category: "General Surgery" },
  { pattern: /\bmosquito\b/i, name: "Mosquito Forceps", category: "General Surgery" },
  { pattern: /\bneedle\s*holder\b/i, name: "Needle Holder", category: "General Surgery" },
];

function extractSize(text: string): string {
  const m =
    text.match(/\b(\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?\s*mm)\b/i)?.[1] ||
    text.match(/\b(\d+(?:[.,]\d+)?\s*mm)\b/i)?.[1] ||
    text.match(/\b(\d+(?:[.,]\d+)?\s*cm)\b/i)?.[1] ||
    text.match(/\b(\d{2,3})\s*mm\b/i)?.[0];
  return m ? m.replace(/\s+/g, " ").replace(",", ".") : "";
}

function extractCatalogCode(text: string): string {
  const m =
    text.match(/\b(\d{1,3}-\d{3,5}(?:-\d{1,3})?)\b/)?.[1] ||
    text.match(/\b([A-Z]{0,3}\d{2,5}[-/]\d{2,5})\b/)?.[1];
  return m || "";
}

function extractProductName(text: string, pageNumber: number): {
  name: string;
  categoryHint?: string;
} {
  for (const item of NAMED_INSTRUMENTS) {
    if (item.pattern.test(text)) {
      return { name: item.name, categoryHint: item.category };
    }
  }

  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 3 && l.length <= 80)
    .filter((l) => !/^(page|fig|figure|www|http)/i.test(l))
    .filter((l) => !/^\d+([./-]\d+)*$/.test(l));

  const titled = lines.find((l) => /[A-Za-z]{3,}/.test(l) && /[A-Z]/.test(l));
  if (titled && !/^product\s*page/i.test(titled)) {
    return { name: titled };
  }

  const lower = text.toLowerCase();
  const type =
    (/\bforceps\b/.test(lower) && "Forceps") ||
    (/\bscissors\b/.test(lower) && "Scissors") ||
    (/\bclamp\b/.test(lower) && "Clamp") ||
    (/\bretractor\b/.test(lower) && "Retractor") ||
    (/\bneedle\s*holder\b/.test(lower) && "Needle Holder") ||
    (/\brongeur\b/.test(lower) && "Rongeur") ||
    (/\belevator\b/.test(lower) && "Elevator") ||
    "Surgical Instrument";

  return { name: `${type} ${pageNumber}`.trim() };
}

function resolveCategory(
  ocrText: string,
  productName: string,
  catalogCode: string,
  categoryHint?: string
): string {
  const blob = `${productName} ${ocrText} ${catalogCode}`;
  const ranked = scoreCategories(blob);
  const best = ranked[0];
  const suggested = keywordSuggestCategory(blob);

  // Named-instrument hint wins only if keywords agree, or keywords found nothing useful
  if (categoryHint) {
    const hintScore =
      ranked.find((r) => r.category === normalizeCategoryName(categoryHint))
        ?.score || 0;
    if (!best || best.score <= 0 || hintScore >= best.score) {
      return normalizeCategoryName(categoryHint);
    }
  }

  return normalizeCategoryName(suggested);
}

export function enrichFromOcrText(
  rawText: string,
  pageNumber: number,
  existingName?: string
): OcrEnrichResult {
  const text = rawText.replace(/\s+/g, " ").trim();
  const size = extractSize(rawText);
  const catalogCode = extractCatalogCode(rawText);
  const { name: detectedName, categoryHint } = extractProductName(
    rawText,
    pageNumber
  );

  const productName =
    detectedName && !/^product\s*page/i.test(detectedName)
      ? detectedName
      : existingName && !/^product\s*page/i.test(existingName)
        ? existingName
        : detectedName || `Surgical Instrument ${pageNumber}`;

  const categoryName = resolveCategory(
    text,
    productName,
    catalogCode,
    categoryHint
  );

  const material = "German stainless steel";
  const finish = "Satin finish";
  const certifications = "ISO 13485, CE";
  const sizePhrase = size ? ` (${size})` : "";
  const shortDescription =
    `${productName}${sizePhrase} — precision ${categoryName.toLowerCase()} instrument in ${material.toLowerCase()}.`.slice(
      0,
      500
    );
  const fullDescription = [
    `${productName}${sizePhrase} is a precision ${categoryName.toLowerCase()} instrument for hospitals and distributors.`,
    size ? `Catalog size: ${size}.` : "",
    catalogCode ? `Catalog reference: ${catalogCode}.` : "",
    `Material: ${material}. Finish: ${finish}. Certified quality (${certifications}).`,
  ]
    .filter(Boolean)
    .join(" ");

  const specifications = [
    size ? `Size: ${size}` : null,
    catalogCode ? `Catalog code: ${catalogCode}` : null,
    `Material: ${material}`,
    `Finish: ${finish}`,
    `Specialty: ${categoryName}`,
    "Sterilization: Autoclavable",
  ]
    .filter(Boolean)
    .join("\n");

  const sku =
    catalogCode.replace(/[^A-Za-z0-9._\-]/g, "") ||
    `NXV-${String(pageNumber).padStart(4, "0")}`;
  const slug =
    slugify(size ? `${productName}-${size}` : productName) ||
    `instrument-${pageNumber}`;

  return {
    productName,
    size,
    categoryName,
    shortDescription,
    fullDescription,
    material,
    finish,
    certifications,
    specifications,
    metaTitle: `${productName}${size ? ` ${size}` : ""}`.slice(0, 70),
    metaDescription: shortDescription.slice(0, 160),
    sku: sku.slice(0, 64),
    slug: slug.slice(0, 200),
    source: "ocr",
    rawText: text.slice(0, 2000),
  };
}
