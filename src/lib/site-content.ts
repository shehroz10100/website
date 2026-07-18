import {
  Award,
  CheckCircle2,
  Cog,
  Factory,
  FlaskConical,
  Globe2,
  Microscope,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const siteContact = {
  email: "Hmian877@gmail.com",
  phone: "+92-3354071934",
  phoneHref: "tel:+923354071934",
  address: "Street#6 Masjid vali Fazalpura Sambrial, Sialkot",
  addressLines: [
    "Street#6 Masjid vali Fazalpura",
    "Sambrial, Sialkot",
  ],
} as const;

export const manufacturingSteps = [
  {
    step: "01",
    title: "Material selection",
    description:
      "Surgical-grade German stainless alloys are sourced and verified for composition, hardness, and corrosion resistance before production begins.",
    icon: FlaskConical,
  },
  {
    step: "02",
    title: "Precision machining",
    description:
      "CNC and traditional machining produce accurate jaw geometry, ratchet mechanisms, and balanced handles to clinical tolerances.",
    icon: Cog,
  },
  {
    step: "03",
    title: "Finishing & assembly",
    description:
      "Satin or mirror finishes are applied, inserts fitted where required, and instruments assembled under controlled conditions.",
    icon: Factory,
  },
  {
    step: "04",
    title: "Inspection & sterilization readiness",
    description:
      "Dimensional checks, functional tests, and surface inspections confirm each lot is ready for hospital sterilization cycles.",
    icon: Microscope,
  },
  {
    step: "05",
    title: "Packaging & dispatch",
    description:
      "Traceable packaging, documentation packs, and export logistics prepare instruments for global B2B delivery.",
    icon: Truck,
  },
];

export const qualityPillars = [
  {
    title: "Incoming material control",
    description:
      "Alloy certificates and hardness checks ensure every batch meets surgical stainless specifications.",
    icon: PackageCheck,
  },
  {
    title: "In-process inspection",
    description:
      "Critical dimensions and functional features are verified at defined manufacturing checkpoints.",
    icon: CheckCircle2,
  },
  {
    title: "Final release testing",
    description:
      "Finished instruments undergo visual, dimensional, and performance checks before shipment.",
    icon: ShieldCheck,
  },
  {
    title: "Traceability",
    description:
      "Lot records support recall readiness and documentation requests from hospitals and distributors.",
    icon: Microscope,
  },
];

export const certifications = [
  {
    name: "ISO 13485",
    detail:
      "Quality management system aligned with medical device manufacturing requirements.",
  },
  {
    name: "CE Mark",
    detail:
      "Conformity pathways supporting distribution into applicable European markets.",
  },
  {
    name: "FDA Registered Facility",
    detail:
      "Facility registration documentation available for US-bound procurement programs.",
  },
  {
    name: "Material Compliance",
    detail:
      "Surgical stainless grades selected for autoclave durability and clinical performance.",
  },
];

export const whyChooseUs = [
  {
    title: "Clinical-grade precision",
    text: "Instruments engineered for consistent feel, secure grip, and reliable performance in the OR.",
    icon: Award,
  },
  {
    title: "B2B-ready supply",
    text: "Volume pricing, private label options, and documentation packs for procurement teams.",
    icon: Globe2,
  },
  {
    title: "Certified quality systems",
    text: "ISO-aligned processes, CE pathways, and inspection protocols built into production.",
    icon: ShieldCheck,
  },
  {
    title: "Export logistics experience",
    text: "Coordinated shipping, lead-time clarity, and support for multi-country distributor networks.",
    icon: Truck,
  },
];

export const exportCountries = [
  "United States",
  "United Kingdom",
  "Germany",
  "United Arab Emirates",
  "Saudi Arabia",
  "South Africa",
  "Australia",
  "Canada",
  "Singapore",
  "Brazil",
  "Netherlands",
  "Malaysia",
];

export const testimonials = [
  {
    quote:
      "Nexvor delivered consistent SKUs across our hospital network with documentation that made onboarding straightforward.",
    name: "Elena Vargas",
    role: "Procurement Director, Regional Health System",
  },
  {
    quote:
      "Lead times were reliable and the private-label packaging matched our brand standards for distributor channels.",
    name: "James Okonkwo",
    role: "Managing Director, Surgical Supply Co.",
  },
  {
    quote:
      "The quality of the Metzenbaum and needle holder lines has been dependable through repeated sterilization cycles.",
    name: "Dr. Amira Hassan",
    role: "OR Materials Lead",
  },
];

/** Local attractive instrument photos used when a category has no CMS image */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  orthopedic: "/images/categories/orthopedic.jpg",
  "orthopedic-instruments": "/images/categories/orthopedic.jpg",
  "dental-oral": "/images/categories/dental-oral.jpg",
  cardiovascular: "/images/categories/cardiovascular.jpg",
  "ent-microsurgery": "/images/categories/ent-microsurgery.jpg",
  laparoscopic: "/images/categories/laparoscopic.jpg",
  gynecology: "/images/categories/gynecology.jpg",
  neurosurgery: "/images/categories/neurosurgery.jpg",
  "plastic-reconstructive": "/images/categories/plastic-reconstructive.jpg",
  urology: "/images/categories/urology.jpg",
  ophthalmology: "/images/categories/ophthalmology.jpg",
  "general-surgery": "/images/categories/general-surgery.jpg",
};

export const DEFAULT_CATEGORY_IMAGE = "/images/categories/fallback.jpg";
export const HERO_BACKGROUND_IMAGE = "/images/hero-instruments.jpg";
export const ABOUT_PANEL_IMAGE = "/images/about-instruments.jpg";

export function categoryDisplayImage(
  slug: string,
  cmsImage?: string | null
): string {
  if (cmsImage) return cmsImage;
  return CATEGORY_FALLBACK_IMAGES[slug] || DEFAULT_CATEGORY_IMAGE;
}
