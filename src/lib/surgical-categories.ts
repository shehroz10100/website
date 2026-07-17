import { slugify } from "@/lib/utils";

/** Canonical surgical specialties used for AI + keyword classification */
export const CANONICAL_SURGICAL_CATEGORIES = [
  "Orthopedic",
  "Dental & Oral",
  "Cardiovascular",
  "ENT & Microsurgery",
  "Laparoscopic",
  "Gynecology",
  "Neurosurgery",
  "Plastic & Reconstructive",
  "Urology",
  "Ophthalmology",
  "General Surgery",
] as const;

export type CanonicalCategory = (typeof CANONICAL_SURGICAL_CATEGORIES)[number];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match specialty keywords without false positives.
 * Short tokens (e.g. "ent") must be whole words — otherwise "instrument"
 * incorrectly scores as ENT & Microsurgery.
 */
export function matchesSpecialtyKeyword(haystack: string, word: string): boolean {
  const w = word.toLowerCase().trim();
  if (!w) return false;
  const lower = haystack.toLowerCase();

  if (w.includes(" ")) return lower.includes(w);

  // Exact whole-word for short / ambiguous tokens
  if (w.length <= 4) {
    return new RegExp(`\\b${escapeRegExp(w)}\\b`, "i").test(lower);
  }

  // Longer stems: match word start (gynecolog → gynecology, microsurg → microsurgery)
  return new RegExp(`\\b${escapeRegExp(w)}`, "i").test(lower);
}

/** Specialty rules — General Surgery is last-resort when nothing else scores */
const KEYWORD_RULES: { category: CanonicalCategory; words: string[]; weight: number }[] = [
  {
    category: "Orthopedic",
    weight: 3,
    words: [
      "bone",
      "orthopedic",
      "orthopaedic",
      "rongeur",
      "osteotome",
      "bone rasp",
      "bone chisel",
      "bone cutter",
      "periosteal",
      "kerrison",
      "lambotte",
      "hohmann",
      "stille",
      "gigli",
      "bone plate",
      "bone screw",
      "reamer",
      "curette",
      "mallet",
      "wire cutter",
      "steinmann",
      "kirschner",
      "bone holding",
      "reduction forceps",
      "fragment forceps",
      "elevator bone",
    ],
  },
  {
    category: "Dental & Oral",
    weight: 3,
    words: [
      "dental",
      "extraction forceps",
      "molar",
      "premolar",
      "root tip",
      "periodontal",
      "luxator",
      "cryer",
      "cowhorn",
      "mouth gag",
      "dental elevator",
      "oral surgery",
      "wisdom tooth",
      "incisor",
      "elevator dental",
      "apical",
      "gingival",
      "hemostat dental",
      "tooth",
      "teeth",
    ],
  },
  {
    category: "Cardiovascular",
    weight: 3,
    words: [
      "vascular",
      "debakey",
      "de bakey",
      "cardiac",
      "bulldog",
      "cooley",
      "satinsky",
      "fogarty",
      "aortic",
      "potts",
      "castaneda",
      "rumel",
      "vascular clamp",
      "artery forceps",
      "coronary",
    ],
  },
  {
    category: "Laparoscopic",
    weight: 3,
    words: [
      "laparoscopic",
      "laparoscopy",
      "grasper",
      "trocar",
      "endoscopic",
      "endoscopy",
      "veress",
      "maryland",
      "hook electrode",
      "clip applier",
      "lap forceps",
      "cannula",
    ],
  },
  {
    category: "ENT & Microsurgery",
    weight: 3,
    words: [
      "ent",
      "microsurgery",
      "microsurg",
      "nasal",
      "otology",
      "otologic",
      "sinus",
      "laryngeal",
      "adenoid",
      "tonsil",
      "myringotomy",
      "septum",
      "septoplasty",
      "ear forceps",
      "nasal forceps",
      "nasal speculum",
      "mcgee",
      "alligator forceps",
      "hartmann forceps",
      "house forceps",
      "bellucci",
      "tympanic",
      "mastoid",
      "rhino",
      "antral",
    ],
  },
  {
    category: "Gynecology",
    weight: 3,
    words: [
      "gynecolog",
      "obstetric",
      "uterine",
      "cervical",
      "hysterect",
      "vaginal speculum",
      "tenaculum",
      "cervical dilator",
      "sims speculum",
      "graves speculum",
      "curette uterine",
    ],
  },
  {
    category: "Neurosurgery",
    weight: 3,
    words: [
      "neurosurg",
      "cranial",
      "craniotomy",
      "spinal",
      "dura",
      "aneurysm",
      "pituitary",
      "laminectomy",
      "microsurgical",
    ],
  },
  {
    category: "Plastic & Reconstructive",
    weight: 2,
    words: [
      "plastic surgery",
      "rhinoplasty",
      "blepharoplasty",
      "skin graft",
      "fascia",
      "dermabrasion",
    ],
  },
  {
    category: "Urology",
    weight: 3,
    words: [
      "urolog",
      "prostate",
      "urethral",
      "cystoscope",
      "bladder stone",
      "lithotomy",
      "catheter",
    ],
  },
  {
    category: "Ophthalmology",
    weight: 3,
    words: [
      "ophthalm",
      "corneal",
      "cataract",
      "eye speculum",
      "ocular",
      "keratome",
      "trephine",
      "iris forceps",
    ],
  },
  {
    category: "General Surgery",
    weight: 1,
    words: [
      "mayo hegar",
      "needle holder",
      "hemostat",
      "allis",
      "kelly",
      "kocher",
      "babcock",
      "towel clip",
      "scalpel handle",
      "metzenbaum",
      "mayo scissors",
      "retractor",
      "sponge forceps",
      "dressing forceps",
      "tissue forceps",
      "mosquito",
      "backhaus",
      "rochester",
      "olsen hegar",
      "pean",
      "crile",
    ],
  },
];

export function scoreCategories(
  text: string
): { category: CanonicalCategory; score: number }[] {
  const lower = text.toLowerCase();
  return KEYWORD_RULES.map((rule) => {
    let score = 0;
    for (const word of rule.words) {
      if (matchesSpecialtyKeyword(lower, word)) score += rule.weight;
    }
    return { category: rule.category, score };
  }).sort((a, b) => b.score - a.score);
}

export function keywordSuggestCategory(text: string): CanonicalCategory {
  const ranked = scoreCategories(text);
  const best = ranked[0];
  if (!best || best.score <= 0) return "General Surgery";
  return best.category;
}

export function categoryDescription(name: string): string {
  return `${name} surgical instruments for hospitals, distributors, and OEM partners. Precision stainless steel tools manufactured for clinical reliability.`;
}

export function normalizeCategoryName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const exact = CANONICAL_SURGICAL_CATEGORIES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  const partial = CANONICAL_SURGICAL_CATEGORIES.find(
    (c) =>
      trimmed.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(trimmed.toLowerCase())
  );
  return partial || trimmed;
}

export function categorySlugFromName(name: string): string {
  return slugify(name) || "specialty";
}
