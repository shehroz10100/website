import {
  CANONICAL_SURGICAL_CATEGORIES,
  keywordSuggestCategory,
  normalizeCategoryName,
} from "@/lib/surgical-categories";
import { slugify } from "@/lib/utils";

export type EnrichInput = {
  productName: string;
  imageUrl?: string;
  size?: string;
  pageNumber?: number;
};

export type EnrichResult = {
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
  confidence: "high" | "medium" | "low";
  source: "ai" | "keyword";
};

function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function isAiCategorizationConfigured() {
  return hasOpenAiKey();
}

function buildKeywordEnrichment(item: EnrichInput): EnrichResult {
  const categoryName = keywordSuggestCategory(
    `${item.productName} ${item.size || ""}`
  );
  const productName =
    item.productName?.trim() ||
    `Surgical instrument ${item.pageNumber || ""}`.trim();
  const size = item.size || "";
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
    `Material: ${material}. Finish: ${finish}. Certified quality (${certifications}).`,
  ]
    .filter(Boolean)
    .join(" ");

  const specs = [
    size ? `Size: ${size}` : null,
    `Material: ${material}`,
    `Finish: ${finish}`,
    `Specialty: ${categoryName}`,
    "Sterilization: Autoclavable",
  ]
    .filter(Boolean)
    .join("\n");

  const page = item.pageNumber || 1;
  const slugBase = slugify(size ? `${productName}-${size}` : productName) || `instrument-${page}`;

  return {
    productName,
    size,
    categoryName,
    shortDescription,
    fullDescription,
    material,
    finish,
    certifications,
    specifications: specs,
    metaTitle: `${productName}${size ? ` ${size}` : ""}`.slice(0, 70),
    metaDescription: shortDescription.slice(0, 160),
    sku: `NXV-${String(page).padStart(4, "0")}`,
    slug: slugBase.slice(0, 200),
    confidence: "low",
    source: "keyword",
  };
}

async function enrichWithOpenAi(item: EnrichInput): Promise<EnrichResult> {
  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const list = CANONICAL_SURGICAL_CATEGORIES.join(", ");
  const fallback = buildKeywordEnrichment(item);

  if (!item.imageUrl || !/^https?:\/\//i.test(item.imageUrl)) {
    return fallback;
  }

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } }
  > = [
    {
      type: "text",
      text: `You are an expert surgical instrument cataloger for a B2B medical manufacturer.

Analyze the PRODUCT IMAGE carefully (and any visible labels/text on the page).
PDF text extraction may be wrong or generic like "Product page 12" — TRUST THE IMAGE.

Known PDF text (may be incomplete/wrong):
- Name hint: ${item.productName || "(none)"}
- Size hint: ${item.size || "(none)"}
- Page: ${item.pageNumber ?? "?"}

Tasks:
1. Identify the instrument from the photo.
2. Write a clear commercial product name (e.g. "Mayo Hegar Needle Holder", "Bone Rongeur Straight").
3. Extract size if visible (14cm, 18cm, 5mm, etc.) or empty string.
4. Assign ONE specialty category from this exact list:
${list}
   Use visual cues carefully:
   - McGee / alligator / ear forceps / otology → ENT & Microsurgery
   - Dental extraction forceps / elevators / molars → Dental & Oral
   - Bone rongeurs / osteotomes / chisels → Orthopedic
   - DeBakey / vascular clamps → Cardiovascular
   - Laparoscopic graspers / trocars → Laparoscopic
   - Common OR needle holders / mayo / metzenbaum / hemostats → General Surgery
   Do NOT default everything to General Surgery. Pick the best specialty from the image.
5. Write short + full product descriptions for a B2B catalog.
6. Infer material/finish when possible (default German stainless steel / satin).

Respond ONLY with JSON:
{
  "productName": "string",
  "size": "string",
  "categoryName": "exact list name",
  "shortDescription": "string max 400 chars",
  "fullDescription": "string 2-4 sentences",
  "material": "string",
  "finish": "string",
  "certifications": "ISO 13485, CE",
  "specifications": "Size: ...\\nMaterial: ...\\nFinish: ...\\nSpecialty: ...\\nSterilization: Autoclavable",
  "confidence": "high" | "medium" | "low"
}`,
    },
    {
      type: "image_url",
      image_url: { url: item.imageUrl, detail: "high" },
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CATEGORY_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You identify surgical instruments from catalog photos and produce accurate catalog JSON. Never invent unrelated products. Prefer image evidence over bad PDF text.",
        },
        { role: "user", content },
      ],
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content || "{}";
  let parsed: Record<string, string> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  const productName = String(parsed.productName || fallback.productName)
    .trim()
    .slice(0, 200);
  const size = String(parsed.size || fallback.size || "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 40);
  const categoryName = normalizeCategoryName(
    parsed.categoryName || fallback.categoryName
  );
  const material =
    String(parsed.material || fallback.material).trim().slice(0, 200) ||
    fallback.material;
  const finish =
    String(parsed.finish || fallback.finish).trim().slice(0, 200) ||
    fallback.finish;
  const certifications =
    String(parsed.certifications || fallback.certifications)
      .trim()
      .slice(0, 500) || fallback.certifications;
  const shortDescription = String(
    parsed.shortDescription || fallback.shortDescription
  )
    .trim()
    .slice(0, 500);
  const fullDescription = String(
    parsed.fullDescription || fallback.fullDescription
  )
    .trim()
    .slice(0, 10000);
  let specifications = String(parsed.specifications || "").trim();
  if (!specifications) {
    specifications = [
      size ? `Size: ${size}` : null,
      `Material: ${material}`,
      `Finish: ${finish}`,
      `Specialty: ${categoryName}`,
      "Sterilization: Autoclavable",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const page = item.pageNumber || 1;
  const slug =
    slugify(size ? `${productName}-${size}` : productName) ||
    `instrument-${page}`;

  const confidence =
    parsed.confidence === "high" ||
    parsed.confidence === "medium" ||
    parsed.confidence === "low"
      ? parsed.confidence
      : "medium";

  // Reject obviously bad AI names that just echo "Product page"
  const badName = /^product\s*page\s*\d+$/i.test(productName);
  return {
    productName: badName ? fallback.productName : productName,
    size,
    categoryName,
    shortDescription,
    fullDescription,
    material,
    finish,
    certifications,
    specifications,
    metaTitle: `${badName ? fallback.productName : productName}${size ? ` ${size}` : ""}`.slice(
      0,
      70
    ),
    metaDescription: shortDescription.slice(0, 160),
    sku: `NXV-${String(page).padStart(4, "0")}`,
    slug: slug.slice(0, 200),
    confidence,
    source: "ai",
  };
}

export async function enrichProductFromImage(
  item: EnrichInput
): Promise<EnrichResult> {
  const fallback = buildKeywordEnrichment(item);
  if (!hasOpenAiKey()) return fallback;

  try {
    return await enrichWithOpenAi(item);
  } catch (e) {
    console.error(
      "[ai-enrich]",
      item.pageNumber,
      item.productName,
      e instanceof Error ? e.message : e
    );
    // Re-throw so the batch action can surface API failures instead of silently
    // dumping everything into General Surgery via keywords.
    throw e;
  }
}

export async function enrichProductsFromImages(
  items: EnrichInput[],
  concurrency = 3
): Promise<{ results: EnrichResult[]; errors: string[] }> {
  const results: EnrichResult[] = new Array(items.length);
  const errors: string[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = await enrichProductFromImage(items[current]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI enrichment failed";
        errors.push(`Page ${items[current].pageNumber}: ${msg}`);
        results[current] = buildKeywordEnrichment(items[current]);
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, Math.max(1, items.length)) },
      () => worker()
    )
  );
  return { results, errors };
}

/** @deprecated use enrichProductsFromImages */
export async function classifyProductCategories(
  items: Array<{ productName: string; imageUrl?: string; size?: string }>,
  concurrency = 3
) {
  const { results } = await enrichProductsFromImages(
    items.map((i) => ({
      productName: i.productName,
      imageUrl: i.imageUrl,
      size: i.size,
    })),
    concurrency
  );
  return results.map((e) => ({
    categoryName: e.categoryName,
    confidence: e.confidence,
    source: e.source,
  }));
}

export async function classifyProductCategory(item: EnrichInput) {
  const e = await enrichProductFromImage(item);
  return {
    categoryName: e.categoryName,
    confidence: e.confidence,
    source: e.source,
  };
}
