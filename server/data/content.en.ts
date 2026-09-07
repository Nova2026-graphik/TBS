/**
 * Contenu éditorial en anglais.
 *
 * Le fichier ne reprend que **ce qui se lit** : titres, accroches,
 * descriptions, étiquettes. Tout le reste — identifiants, slugs, couleurs,
 * chemins d'images, ordre d'affichage, comptes de références — est repris tel
 * quel du contenu français. Deux raisons à cela : une valeur non textuelle
 * dupliquée finit toujours par diverger, et le filtrage de la galerie comme la
 * sélection de branche passent par ces identifiants — ils ne doivent pas
 * changer d'une langue à l'autre, sous peine de casser `?branche=` et
 * `?filtre=`.
 *
 * Ce que la traduction ne touche pas non plus : les noms propres. « TBS
 * Events » reste « TBS Events » ; en revanche « TBS Équipements » devient
 * « TBS Equipment », la branche étant nommée par son métier et non par une
 * marque déposée.
 */
import type {
  Branch,
  Domain,
  FaqItem,
  GalleryItem,
  RentalCategory,
  ServiceBlock,
  Testimonial,
} from '../../shared/types'
import * as fr from './content'

/** Reprend l'entrée française et n'en remplace que les champs traduits. */
function traduire<T>(source: readonly T[], textes: Partial<T>[]): T[] {
  return source.map((entree, i) => ({ ...entree, ...(textes[i] ?? {}) }))
}

export const branches: Branch[] = traduire(fr.branches, [
  {
    name: 'TBS Equipment',
    tagline: 'Supply of materials & equipment',
    description:
      'Office furniture and equipment, IT, hospital and laboratory equipment, vehicles: we supply, deliver and install for companies, public bodies and NGOs.',
    imageAlt: 'Office floor fitted out by TBS Equipment',
    tags: ['Office', 'IT', 'Health & lab', 'Vehicles'],
  },
  {
    name: 'TBS Events',
    tagline: 'Reception equipment rental & event management',
    description:
      'Furniture, tableware, décor, sound and lighting: we equip, install and collect for weddings, ceremonies, private receptions and corporate events, from 20 to 2,000 guests.',
    imageAlt: 'Reception hall set up by TBS Events',
    tags: ['Weddings', 'Ceremonies', 'Corporate', 'Turnkey'],
  },
  {
    name: 'TBS Studies & Consulting',
    tagline: 'Studies & advisory services',
    description:
      'Technical and feasibility studies, organisational consulting, training, client-side project support and tender file preparation.',
    imageAlt: 'TBS Studies & Consulting working session',
    tags: ['Studies', 'Consulting', 'Training', 'Project support'],
  },
  {
    name: 'TBS Agri-business',
    tagline: 'Farming & agri-industry',
    description:
      'Inputs, small farming equipment and processing machinery. We support cooperatives, farms and agri-industrial development projects.',
    imageAlt: 'Farm supported by TBS Agri-business',
    tags: ['Inputs', 'Equipment', 'Processing', 'Cooperatives'],
  },
])

export const rentalCategories: RentalCategory[] = traduire(fr.rentalCategories, [
  { name: 'Furniture', imageAlt: 'Reception chairs and tables' },
  { name: 'Tableware', imageAlt: 'Plates, glasses and cutlery laid out' },
  { name: 'Linen', imageAlt: 'Tablecloths, chair covers and napkins' },
  { name: 'Décor', imageAlt: 'Candelabras, vases and aisle runners' },
  { name: 'Sound & light', imageAlt: 'LED dance floor and evening lighting' },
  { name: 'Marquees & structures', imageAlt: 'Marquees, structures and reception flooring' },
])

export const domains: Domain[] = traduire(fr.domains, [
  {
    title: 'Office furniture & equipment',
    description: 'Desks, chairs, cabinets, reception counters and complete floor fit-outs.',
  },
  {
    title: 'IT equipment',
    description: 'Workstations, laptops, printers, networking, consumables and maintenance.',
  },
  {
    title: 'Hospital & laboratory equipment',
    description: 'Medical furniture, instruments, reagents and consumables for clinics and laboratories.',
  },
  {
    title: 'Vehicles & fleet',
    description: 'Service vehicles, vans, machinery, spare parts and fleet follow-up.',
  },
  {
    title: 'Reception equipment rental',
    description: 'Furniture, tableware, linen, décor, sound and lighting — delivered and installed.',
  },
  {
    title: 'Event management & coordination',
    description: 'Staging, floor plans, supplier coordination and presence on the day.',
  },
  {
    title: 'Studies & advisory services',
    description: 'Technical studies, organisational consulting, training and client-side project support.',
  },
  {
    title: 'Farming & agri-industry',
    description: 'Inputs, small equipment, processing machinery and support for cooperatives.',
  },
])

export const serviceBlocks: ServiceBlock[] = traduire(fr.serviceBlocks, [
  {
    eyebrow: '01 — Office',
    title: 'Office furniture & equipment',
    description:
      'Complete floor fit-outs: desks, ergonomic chairs, cabinets, pedestals and reception counters. We quote, deliver and assemble on site.',
    tags: ['Desks', 'Seating', 'Storage', 'Reception'],
    imageAlt: 'Fitted offices — furniture and workstations',
  },
  {
    eyebrow: '02 — IT',
    title: 'IT equipment',
    description:
      'Desktops and laptops, printers and copiers, networking and UPS units, consumables. Installation, configuration and an optional maintenance contract.',
    tags: ['Workstations', 'Printing', 'Networking', 'Consumables'],
    imageAlt: 'IT equipment — workstations delivered',
  },
  {
    eyebrow: '03 — Health & laboratory',
    title: 'Hospital & laboratory equipment',
    description:
      'Medical furniture, diagnostic instruments, glassware, reagents and consumables for clinics, practices and laboratories. Tracked delivery and scheduled restocking.',
    tags: ['Medical furniture', 'Instruments', 'Reagents', 'Consumables'],
    imageAlt: 'Equipped laboratory — instruments and consumables',
  },
  {
    eyebrow: '04 — Vehicles',
    title: 'Vehicles & fleet',
    description:
      'Service vehicles and vans, machinery, spare parts and tyres. We support the renewal and upkeep of corporate and institutional fleets.',
    tags: ['Vehicles', 'Vans', 'Parts', 'Fleet follow-up'],
    imageAlt: 'Fleet — service vehicles',
  },
  {
    eyebrow: '01 — Furniture',
    title: 'Chairs, tables, lounge',
    description:
      'Napoleon and banquet chairs, round tables for 8 to 12 covers, poseur tables, mobile bars, sofas and poufs for lounge areas. Matching covers and seat pads.',
    tags: ['Banquet chairs', 'Round tables', 'Lounge', 'Bars'],
    imageAlt: 'Reception furniture — chairs and tables installed',
  },
  {
    eyebrow: '02 — Tableware',
    title: 'Crockery, glassware, linen',
    description:
      'Plates and cutlery in complete ranges, stemware, tumblers, champagne buckets. Tablecloths, runners and napkins washed and pressed for every rental.',
    tags: ['Plates', 'Glassware', 'Cutlery', 'Linen'],
    imageAlt: 'Tableware — place setting, close-up',
  },
  {
    eyebrow: '03 — Décor',
    title: 'Staging & décor',
    description:
      'Candelabras, vases, drapes, arches, aisle runners and posts. We build a coherent visual direction, from the guests’ arrival to the back of the stage.',
    tags: ['Candelabras', 'Drapes', 'Aisle runners'],
    imageAlt: 'Décor — hall staging',
  },
  {
    eyebrow: '04 — Technical',
    title: 'Sound, light & LED floor',
    description:
      'Sound calibrated to the room, microphones, ambient lighting, illuminated dance floor and generator. A technician stays at the desk all evening.',
    tags: ['Sound', 'Lighting', 'LED floor', 'Generator'],
    imageAlt: 'Technical — LED floor and evening lighting',
  },
  {
    eyebrow: '01 — Studies',
    title: 'Technical & feasibility studies',
    description:
      'Assessments, technical and economic studies, sizing and costing. We produce deliverables your funders and partners can use directly.',
    tags: ['Assessment', 'Feasibility', 'Sizing', 'Costing'],
    imageAlt: 'Working session — study and consulting',
  },
  {
    eyebrow: '02 — Consulting & training',
    title: 'Organisational consulting & training',
    description:
      'Support in structuring teams, procedures and management tools, and staff training on site or in the classroom.',
    tags: ['Organisation', 'Procedures', 'Training', 'Coaching'],
    imageAlt: 'Training and organisational consulting',
  },
  {
    eyebrow: '01 — Inputs & equipment',
    title: 'Farming & inputs',
    description:
      'Seeds, fertiliser, treatment products and small farming equipment. We supply farms, cooperatives and development projects, with season-long follow-up.',
    tags: ['Seeds', 'Fertiliser', 'Treatment', 'Tools'],
    imageAlt: 'Farm — inputs and crops',
  },
  {
    eyebrow: '02 — Agri-industry',
    title: 'Processing & agri-industry',
    description:
      'Processing and packaging machinery, storage and drying equipment. We support local production units as they scale up.',
    tags: ['Processing', 'Packaging', 'Storage', 'Drying'],
    imageAlt: 'Agri-industrial processing unit',
  },
])

export const galleryItems: GalleryItem[] = traduire(fr.galleryItems, [
  { title: 'Adjovi wedding — 620 guests', imageAlt: 'Wedding — overall view of the hall' },
  { title: 'Tableware — ivory range', imageAlt: 'Glassware and cutlery, close-up' },
  { title: 'Annual seminar — 180 seats', imageAlt: 'Seminar — conference layout' },
  { title: 'Official ceremony', imageAlt: 'Official ceremony — platform and seating' },
  { title: 'Drinks reception — garden', imageAlt: 'Drinks reception in a garden' },
  { title: 'Gala dinner — 400 covers', imageAlt: 'Gala dinner — laid tables' },
  { title: 'Centrepiece — dry season', imageAlt: 'Table centrepiece, close-up' },
  { title: 'White party — Baguida', imageAlt: 'Evening reception in white' },
  { title: 'Christening — 200-seat marquee', imageAlt: 'Christening under a marquee' },
  { title: 'IT equipment — 40 workstations', imageAlt: 'Workstations delivered and installed' },
  { title: 'Office fit-out — Lomé head office', imageAlt: 'Fitted offices' },
  { title: 'Sika wedding — 380 guests', imageAlt: 'Wedding in white and gold' },
  { title: 'Traditional ceremony — 500 seats', imageAlt: 'Traditional ceremony — hall set up' },
  { title: 'Annual gala — 300 covers', imageAlt: 'Gala evening — reception hall' },
  { title: 'Place setting — gold range', imageAlt: 'Place setting in gold, close-up' },
  { title: 'Wedding blessing — 250 seats', imageAlt: 'Marquee set up for a blessing' },
  { title: 'Drinks reception — Baguida', imageAlt: 'Cocktail reception' },
  { title: 'Launch party — LED floor', imageAlt: 'Evening party — LED dance floor' },
  { title: 'Stage design — draped backdrop', imageAlt: 'Stage design with draped backdrop' },
  { title: 'Linen — table runners', imageAlt: 'Tablecloths and runners' },
  { title: 'Analysis laboratory — equipment delivered', imageAlt: 'Laboratory equipment in place' },
  { title: 'Service fleet — 6 vehicles', imageAlt: 'Service vehicles lined up' },
  { title: 'Farming project — small equipment', imageAlt: 'Small farming equipment' },
])

export const testimonials: Testimonial[] = traduire(fr.testimonials, [
  {
    quote:
      'Six hundred guests, a hall transformed overnight. On the morning of the wedding everything was in place, and nobody saw the team work.',
    context: 'Wedding, Agôè',
  },
  {
    quote:
      'We have trusted TBS with our annual galas for four years. Clear quote, spotless equipment, nothing left for us to sort out.',
    author: 'Communications department',
    context: 'Lomé',
  },
  {
    quote:
      'I had changed the floor plan three times. They took it all in their stride, and the dance floor was the highlight of the night.',
    context: 'Birthday, Baguida',
  },
])

export const faqItems: FaqItem[] = traduire(fr.faqItems, [
  {
    question: 'How far in advance should we book?',
    answer:
      'Two to four weeks for a wedding or a large reception, especially in the dry season. For urgent requests, call us: we check stock availability straight away.',
  },
  {
    question: 'Are delivery and set-up included?',
    answer:
      'Delivery is included within Greater Lomé above a certain rental value. Set-up and installation are costed according to the volume and the layout of the hall, and always shown on the quote.',
  },
  {
    question: 'Do you work outside Lomé?',
    answer:
      'Yes, anywhere in Togo. A transport charge is added according to distance and volume; we work it out at the first conversation.',
  },
  {
    question: 'Does the crockery have to be returned washed?',
    answer:
      'No. Return the equipment cleared, and we take care of the washing: every piece goes back out inspected and clean for the next rental.',
  },
  {
    question: 'What happens if something is broken?',
    answer:
      'A deposit is provided for in the contract. Broken or missing items are charged at the replacement rate stated in advance on the quote — no surprises after the event.',
  },
  {
    question: 'Can we visit the warehouse before choosing?',
    answer:
      'Of course. Our warehouses in Agôè-Démakpoè can be visited Monday to Saturday by appointment: you see the chairs, the tableware ranges and the linen in person before confirming.',
  },
  {
    group: 'TBS Equipment, Studies & Agri-business',
    question: 'Do you respond to public tenders?',
    answer:
      'Yes, across all four divisions. TBS Distribution S.A.R.L takes part in public and private consultations and tenders: administrative file up to date, technical and financial offer, standardised invoices and verifiable references.',
  },
  {
    group: 'TBS Equipment, Studies & Agri-business',
    question: 'What are the lead times for a supply order?',
    answer:
      'Items in stock ship within 48 hours. For equipment to be imported, allow two to six weeks depending on the nature of the goods; the lead time is committed to in the offer and tracked through to commissioning.',
  },
])
