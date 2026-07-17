-- Seed sample categories and products for development

insert into public.categories (name, slug, description, image) values
  (
    'General Surgery',
    'general-surgery',
    'Forceps, retractors, scissors, and clamps engineered for open surgical procedures.',
    null
  ),
  (
    'Orthopedic',
    'orthopedic',
    'Bone-cutting instruments, elevators, and fixation tools for orthopedic teams.',
    null
  ),
  (
    'Cardiovascular',
    'cardiovascular',
    'Precision vascular clamps, needle holders, and cardiac retractors.',
    null
  ),
  (
    'ENT & Microsurgery',
    'ent-microsurgery',
    'Fine-tip microsurgical instruments for ENT and delicate tissue work.',
    null
  ),
  (
    'Laparoscopic',
    'laparoscopic',
    'Minimally invasive graspers, dissectors, and trocar accessories.',
    null
  ),
  (
    'Dental & Oral',
    'dental-oral',
    'Extraction forceps, elevators, and oral surgery instruments.',
    null
  )
on conflict (slug) do nothing;

insert into public.products (
  category_id,
  product_name,
  slug,
  sku,
  short_description,
  full_description,
  specifications,
  material,
  finish,
  certifications,
  product_images,
  featured,
  stock_status,
  meta_title,
  meta_description
)
select
  c.id,
  v.product_name,
  v.slug,
  v.sku,
  v.short_description,
  v.full_description,
  v.specifications::jsonb,
  v.material,
  v.finish,
  v.certifications,
  '{}',
  v.featured,
  v.stock_status,
  v.meta_title,
  v.meta_description
from (
  values
    (
      'general-surgery',
      'Mayo Hegar Needle Holder 14cm',
      'mayo-hegar-needle-holder-14cm',
      'VX-NH-MH-14',
      'Ratcheted needle holder with tungsten carbide inserts for secure suture control.',
      'The Mayo Hegar Needle Holder is crafted for general and specialty surgery where reliable needle control is essential. Tungsten carbide inserts extend jaw life and maintain a firm grip on suture needles through repeated autoclave cycles.',
      '{"length":"14 cm","jaw":"Straight with TC inserts","ratchet":"3-step","sterilization":"Autoclavable"}',
      'German Stainless Steel 420',
      'Satin matte',
      array['ISO 13485','CE Mark','FDA Registered'],
      true,
      'in_stock',
      'Mayo Hegar Needle Holder 14cm | Nexvor Intl',
      'Buy Mayo Hegar needle holders with TC inserts. Autoclavable German stainless steel for surgical suites.'
    ),
    (
      'general-surgery',
      'Metzenbaum Scissors Curved 18cm',
      'metzenbaum-scissors-curved-18cm',
      'VX-SC-MZ-18C',
      'Fine tissue scissors with curved blades for precise dissection.',
      'Metzenbaum scissors designed for soft tissue dissection. Balanced handles reduce hand fatigue during prolonged procedures. Blades are precision-ground and maintain edge integrity after sterilization.',
      '{"length":"18 cm","blade":"Curved","tip":"Blunt/blunt","sterilization":"Autoclavable"}',
      'German Stainless Steel 420',
      'Mirror polish',
      array['ISO 13485','CE Mark'],
      true,
      'in_stock',
      'Metzenbaum Scissors Curved 18cm | Nexvor Intl',
      'Curved Metzenbaum scissors in German stainless steel for soft tissue dissection.'
    ),
    (
      'orthopedic',
      'Bone Rongeur Straight 18cm',
      'bone-rongeur-straight-18cm',
      'VX-OR-BR-18',
      'Heavy-duty rongeur for controlled bone removal in orthopedic procedures.',
      'A straight bone rongeur built for orthopedic and spinal applications. Double-action design multiplies cutting force while preserving control at the cutting tip.',
      '{"length":"18 cm","action":"Double","bite":"5 mm","sterilization":"Autoclavable"}',
      'Surgical Stainless Steel 440A',
      'Satin matte',
      array['ISO 13485','CE Mark','FDA Registered'],
      true,
      'in_stock',
      'Bone Rongeur Straight 18cm | Nexvor Intl',
      'Double-action bone rongeur for orthopedic bone removal. Autoclavable surgical steel.'
    ),
    (
      'cardiovascular',
      'DeBakey Vascular Clamp',
      'debakey-vascular-clamp',
      'VX-CV-DB-VC',
      'Atraumatic vascular clamp with DeBakey serrations for vessel occlusion.',
      'Designed for cardiovascular and vascular procedures requiring atraumatic vessel control. DeBakey-pattern serrations distribute pressure evenly along the vessel wall.',
      '{"length":"16 cm","jaw":"DeBakey serrated","curve":"Slightly angled","sterilization":"Autoclavable"}',
      'German Stainless Steel 316L',
      'Satin matte',
      array['ISO 13485','CE Mark','FDA Registered'],
      true,
      'made_to_order',
      'DeBakey Vascular Clamp | Nexvor Intl',
      'Atraumatic DeBakey vascular clamps for cardiovascular surgery.'
    ),
    (
      'ent-microsurgery',
      'Micro Needle Holder 12cm',
      'micro-needle-holder-12cm',
      'VX-MS-NH-12',
      'Lightweight microsurgical needle holder for ENT and ophthalmic work.',
      'A finely balanced micro needle holder suited for ENT and microsurgical suturing. Round handles support fingertip rotation for precise needle placement under magnification.',
      '{"length":"12 cm","handle":"Round","inserts":"TC","sterilization":"Autoclavable"}',
      'German Stainless Steel 420',
      'Satin matte',
      array['ISO 13485','CE Mark'],
      false,
      'in_stock',
      'Micro Needle Holder 12cm | Nexvor Intl',
      'Microsurgical needle holders with TC inserts for ENT procedures.'
    ),
    (
      'laparoscopic',
      'Laparoscopic Grasping Forceps 5mm',
      'laparoscopic-grasping-forceps-5mm',
      'VX-LP-GF-5',
      '5mm laparoscopic grasper with rotatable shaft and insulated handle.',
      'Reusable laparoscopic grasping forceps compatible with standard 5mm ports. Rotatable shaft and ergonomic handle support efficient tissue manipulation in MIS procedures.',
      '{"diameter":"5 mm","length":"33 cm","shaft":"Rotatable","insulation":"Yes","sterilization":"Autoclavable"}',
      'Surgical Stainless Steel + PEEK',
      'Insulated shaft',
      array['ISO 13485','CE Mark'],
      true,
      'in_stock',
      'Laparoscopic Grasping Forceps 5mm | Nexvor Intl',
      '5mm reusable laparoscopic grasping forceps for minimally invasive surgery.'
    ),
    (
      'dental-oral',
      'Extraction Forceps Upper Molars',
      'extraction-forceps-upper-molars',
      'VX-DN-EF-UM',
      'Anatomically contoured extraction forceps for maxillary molars.',
      'Upper molar extraction forceps with beak geometry matched to maxillary molar anatomy. Non-slip grip and balanced weight for controlled extractions.',
      '{"pattern":"Upper molars","beak":"Anatomical","handle":"English pattern","sterilization":"Autoclavable"}',
      'German Stainless Steel 420',
      'Mirror polish',
      array['ISO 13485','CE Mark'],
      false,
      'low_stock',
      'Extraction Forceps Upper Molars | Nexvor Intl',
      'Anatomical upper molar extraction forceps in German stainless steel.'
    ),
    (
      'general-surgery',
      'Allis Tissue Forceps 15cm',
      'allis-tissue-forceps-15cm',
      'VX-TF-AL-15',
      'Interlocking-tooth tissue forceps for firm grasp of fascia and tissue.',
      'Allis tissue forceps provide a secure hold on fascia and fibrous tissue. Precision-machined interlocking teeth and a reliable ratchet mechanism.',
      '{"length":"15 cm","teeth":"4x5","ratchet":"Yes","sterilization":"Autoclavable"}',
      'German Stainless Steel 420',
      'Satin matte',
      array['ISO 13485','CE Mark'],
      false,
      'in_stock',
      'Allis Tissue Forceps 15cm | Nexvor Intl',
      'Allis tissue forceps for secure fascial grasp in general surgery.'
    )
) as v(
  category_slug,
  product_name,
  slug,
  sku,
  short_description,
  full_description,
  specifications,
  material,
  finish,
  certifications,
  featured,
  stock_status,
  meta_title,
  meta_description
)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
