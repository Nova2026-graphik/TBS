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
  Equipment,
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
    intro:
      'Complete floor fit-outs: desks, ergonomic chairs, cabinets, pedestals and reception counters. We cost, deliver and assemble on site.',
    imageAlt: 'Meeting chairs lined up in a bright room',
    families: ['Desks & tables', 'Seating', 'Storage', 'Reception', 'Lounge sets'],
  },
  {
    title: 'IT equipment',
    description: 'Workstations, laptops, printers, networking, consumables and maintenance.',
    intro:
      'Workstations, laptops, printers and copiers, networking and UPS units, consumables. Installation, setup and an optional maintenance contract.',
    families: ['Workstations', 'Printing', 'Displays'],
  },
  {
    title: 'Hospital & laboratory equipment',
    description:
      'Medical furniture, instruments, reagents and consumables for clinics and laboratories.',
    intro:
      'Medical furniture, diagnostic instruments, reagents and consumables for clinics, laboratories and health centres.',
    families: ['Laboratory', 'Medical devices', 'Consumables'],
  },
  {
    title: 'Vehicles & fleet',
    description: 'Service vehicles, vans, machinery, spare parts and fleet follow-up.',
    intro:
      'Utility and passenger vehicles, pick-ups and spare parts, for companies, NGOs and public bodies.',
    imageAlt: 'Toyota Hilux double-cab pick-up on a track',
    families: ['Vehicles', 'Parts'],
  },
  {
    title: 'Tools & workshop equipment',
    description:
      'Tool cases and kits, electrical measurement, cutting, welding, ladders and working-at-height equipment.',
    intro:
      'Hand and power tools, measuring instruments and workshop fit-out, for maintenance teams and site crews.',
    imageAlt: 'Hand-tool set laid out flat',
  },
  {
    title: 'Access control & security',
    description:
      'Barriers, badges, controllers and biometric time clocks, indoor and outdoor video surveillance.',
    intro:
      'Access control, video surveillance, barriers and safety equipment for premises, sites and public buildings.',
    imageAlt: 'Surveillance cameras on a pole',
    families: ['Access control', 'Video surveillance', 'Safety equipment'],
  },
  {
    title: 'Chemicals & reagents',
    description:
      'Laboratory reagents, water treatment products and chemicals of analytical or food grade.',
    intro:
      'Laboratory reagents, solvents and industrial chemicals, supplied with their safety data sheets.',
    imageAlt: 'Labelled laboratory reagent bottles',
  },
  {
    title: 'Photovoltaic systems',
    description:
      'Panels, hybrid inverters, charge regulators, batteries and converters for off-grid or grid-backup sites.',
    intro:
      'Panels, inverters, batteries and mounting kits — sizing, supply and installation of solar systems.',
    imageAlt: 'Photovoltaic panels installed on a roof',
  },
  {
    title: 'Generator sets',
    description:
      'Diesel and petrol sets, canopied or open frame, and self-contained welding units.',
    intro: 'Generating sets and welding units, supplied, installed and commissioned.',
  },
  {
    title: 'Teaching equipment',
    description:
      'Renewable-energy training benches for technical colleges, training centres and universities.',
    intro: 'Teaching benches and training equipment for technical schools and vocational centres.',
  },
  {
    title: 'Connection equipment',
    description:
      'Water meters, fittings and pressure reducers for service connections and sub-metering.',
    intro:
      'Connection accessories for water and electricity networks: fittings, meters and meter boxes.',
  },
  {
    title: 'Electrical equipment',
    description: 'Enclosures, modular boards and residual-current protection devices.',
    intro: 'Electrical equipment for low-voltage installations and distribution boards.',
  },
  {
    title: 'Handling equipment',
    description: 'Forklifts and manual or electric pallet trucks, for warehouse and loading bay.',
    intro: 'Pallet trucks, stackers and handling equipment for warehouses and storage areas.',
  },
  {
    title: 'Reception equipment rental',
    description:
      'Furniture, tableware, linen, décor, sound and lighting — delivered and installed.',
    intro:
      'Furniture, tableware, linen, décor, sound and lighting, tents and structures — delivered, set up and collected.',
    imageAlt: 'Reception hall set up under chandeliers',
    families: [
      'Furniture',
      'Tableware',
      'Linen',
      'Décor',
      'Sound & lighting',
      'Tents & structures',
    ],
  },
  {
    title: 'Event management & coordination',
    description: 'Staging, floor plans, supplier coordination and presence on the day.',
    intro:
      'Coordination of your event from planning to strike: schedule, suppliers, on-the-day supervision.',
    imageAlt: 'Cocktail table set before guests arrive',
    families: ['Before the event', 'On the day', 'After the event'],
  },
  {
    title: 'Studies & advisory services',
    description:
      'Technical studies, organisational consulting, training and client-side project support.',
    intro:
      'Studies, advisory work, training and project support — for public bodies, NGOs and companies.',
    imageAlt: 'Study documents and plans on a working table',
    families: ['Studies', 'Advisory', 'Training', 'Project support & tenders'],
    exampleNote:
      'Sample services — the site does not yet display a settled catalogue for this field.',
  },
  {
    title: 'Farming & agri-industry',
    description: 'Inputs, small equipment, processing machinery and support for cooperatives.',
    intro:
      'Inputs, agricultural equipment, processing units and support for value chains and cooperatives.',
    imageAlt: 'Cultivated field at daybreak',
    families: ['Inputs', 'Equipment', 'Processing', 'Value chains & cooperatives'],
    exampleNote: 'Sample references and illustrative photographs (Pixabay, free licence).',
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

/** Catalogue references — cf. `content.ts`. */
export const equipment: Equipment[] = traduire(fr.equipment, [
  // ── mobilier-bureau ───────────────────────────────────────────
  {
    name: 'Wooden bookcase cabinet',
    description: 'Tall storage for files and books, to stand behind an executive desk.',
    specs: ['H 180 × W 90 × D 45 cm', 'Wood'],
    family: 'Storage',
  },
  {
    name: 'Wooden cabinet with hinged doors',
    description: 'Closed cabinet for current records, in an office or meeting room.',
    specs: ['H 180 × W 80 × D 45 cm', 'Hinged doors'],
    family: 'Storage',
  },
  {
    name: 'Cabinet with transparent sliding doors',
    description:
      'Tall cabinet with glazed sliding doors: contents stay visible without blocking the aisle.',
    specs: ['Sliding doors', 'Tall model'],
    family: 'Storage',
  },
  {
    name: 'ATLAS reception desk',
    description:
      'Reception station for a corporate or public-sector lobby, with a visitor counter.',
    specs: ['Reception station'],
    family: 'Reception',
  },
  {
    name: 'Straight desk, panel range',
    description: 'Straight worktop on panel legs, for fitting out an open floor in series.',
    specs: ['Straight top', 'Panel legs'],
    family: 'Desks & tables',
  },
  {
    name: 'Solano individual desk with return and pedestal',
    description: 'Complete manager workstation: main top, side return and storage pedestal.',
    specs: ['Side return', 'Pedestal included'],
    family: 'Desks & tables',
  },
  {
    name: 'Mobile desk pedestal',
    description: 'Three-drawer mobile pedestal, to slide under the worktop.',
    specs: ['3 drawers', 'On castors'],
    family: 'Storage',
  },
  {
    name: 'Reversible convertible corner sofa',
    description:
      'Convertible waiting-area seating; the corner mounts left or right to suit the room.',
    specs: ['4 seats', 'Convertible', 'Reversible corner'],
    family: 'Lounge sets',
  },
  {
    name: 'MAMAIA 3-seater sofa',
    description: 'Velvet reception sofa for a waiting area or executive lounge.',
    specs: ['3 seats', '177 × 92 × 78 cm', 'Velvet'],
    family: 'Lounge sets',
  },
  {
    name: 'Office reception sofa',
    description: 'Comfortable seating for a waiting area, alongside a reception desk.',
    specs: ['Waiting area'],
    family: 'Reception',
  },
  {
    name: 'Leather executive chair',
    description: 'High-back executive chair, leather upholstery.',
    specs: ['High back', 'Leather'],
    family: 'Seating',
  },
  {
    name: 'Dallas visitor chair',
    description: 'Visitor chair with mesh back and sled base, stackable along a wall.',
    specs: ['Mesh back', 'Sled base'],
    family: 'Seating',
  },
  {
    name: 'Conference hall seating',
    description: 'Fixed seating for an auditorium, training room or screening room.',
    specs: ['Fitted hall'],
    family: 'Seating',
  },
  {
    name: 'Complete 5-piece lounge set',
    description: 'Lounge set for an executive office or waiting room.',
    specs: ['5 pieces', 'Black / walnut'],
    family: 'Lounge sets',
  },
  {
    name: 'Complete 6-piece lounge set',
    description: 'Larger lounge set, for a lobby or reception area.',
    specs: ['6 pieces', 'White pine / brown oak'],
    family: 'Lounge sets',
  },
  {
    name: 'Woven resin garden set',
    description: 'Outdoor set for a company terrace or break area.',
    specs: ['Woven resin', 'White', 'Outdoor'],
    family: 'Lounge sets',
  },
  {
    name: 'Leather visitor chair',
    description: 'Leather side chair, to face an executive desk.',
    specs: ['Leather'],
    family: 'Seating',
  },
  {
    name: 'Conference table for 12',
    description: 'Meeting table for an executive committee or boardroom.',
    specs: ['Seats 12'],
    family: 'Desks & tables',
  },
  {
    name: 'Solid wood meeting table',
    description: 'Solid wood meeting table, for a committee room.',
    specs: ['Solid wood'],
    family: 'Desks & tables',
  },
  // ── informatique ──────────────────────────────────────────────
  {
    name: 'SpeechiTouch 65-inch interactive display',
    description: 'Touch display for a training or meeting room, with no dedicated computer.',
    specs: ['65 inches', '4K UHD', 'Android 8'],
    family: 'Displays',
  },
  {
    name: 'HP LaserJet Pro MFP M479fdw',
    description: 'Colour laser all-in-one for a department or small floor: print, copy, scan, fax.',
    specs: ['Colour laser', 'Duplex', 'Wi-Fi'],
    family: 'Printing',
  },
  {
    name: 'HP ProBook 450 G8',
    description: 'Business laptop for a mobile office workstation.',
    specs: ['Core i7-1165G7', '8 GB', '512 GB SSD'],
    family: 'Workstations',
  },
  {
    name: 'HP Spectre x360',
    description: 'Premium convertible laptop, for executives and travel.',
    specs: ['Core i7-1065G7', '16 GB', '1 TB SSD', 'Convertible'],
    family: 'Workstations',
  },
  // ── sante-laboratoire ─────────────────────────────────────────
  {
    name: 'EA-2000B electrolyte analyser',
    description: 'Blood electrolyte measurement in a medical analysis laboratory.',
    specs: ['Electrolytes'],
    family: 'Laboratory',
  },
  {
    name: 'Automatic coagulation analyser',
    description: 'Haemostasis analyser for a hospital or community laboratory.',
    specs: ['Automatic', 'Haemostasis'],
    family: 'Laboratory',
  },
  {
    name: 'Immunochromatographic analyser',
    description: 'Reader for rapid immunochromatographic tests.',
    specs: ['Rapid tests'],
    family: 'Laboratory',
  },
  {
    name: 'High-filtration protective masks',
    description: 'Respiratory protection for care and laboratory staff.',
    specs: ['High filtration'],
    family: 'Consumables',
  },
  {
    name: 'EDAN C3(A)/C6(A) video colposcope',
    description: 'Video colposcope for gynaecological consultation.',
    specs: ['Video', 'EDAN'],
    family: 'Medical devices',
  },
  {
    name: 'Diamedica Baby CPAP oxygen concentrator',
    description: 'Neonatal respiratory support with continuous positive airway pressure.',
    specs: ['Neonatal', 'CPAP'],
    family: 'Medical devices',
  },
  {
    name: 'HANNA HI 9835 conductivity meter',
    description: 'Conductivity, TDS and salinity measurement, in the lab or in the field.',
    specs: ['Conductivity', 'TDS', 'Salinity'],
    family: 'Laboratory',
  },
  {
    name: 'Colson Cardi 6 multichannel ECG',
    description: 'Multichannel touchscreen electrocardiograph for practice and hospital ward.',
    specs: ['Multichannel', 'Touchscreen'],
    family: 'Medical devices',
  },
  {
    name: 'Newborn phototherapy lamp',
    description: 'Treatment of newborn jaundice in a maternity unit.',
    specs: ['Neonatal', 'Phototherapy'],
    family: 'Medical devices',
  },
  {
    name: 'Automatic microplate washer 670',
    description: 'Automated microplate washing for ELISA workflows.',
    specs: ['Microplates', 'ELISA'],
    family: 'Laboratory',
  },
  {
    name: 'Celestron digital biological microscope',
    description: 'Microscope with digital output for laboratory and teaching use.',
    specs: ['Digital', 'Biological'],
    family: 'Laboratory',
  },
  {
    name: 'M-9000-E patient monitor',
    description: 'Vital-signs monitoring in theatre, intensive care or recovery.',
    specs: ['12.1 inches', 'Multiparameter'],
    family: 'Medical devices',
  },
  {
    name: 'ECG paper for Colson / Cardiette',
    description: 'Thermal consumable for electrocardiographs.',
    specs: ['Consumable', 'Thermal'],
    family: 'Consumables',
  },
  {
    name: 'Multiparameter pH meter',
    description: 'pH and related parameter control, in the laboratory or in water treatment.',
    specs: ['Multiparameter'],
    family: 'Laboratory',
  },
  {
    name: '280Z AA atomic absorption spectrometer',
    description: 'Trace metal measurement, for environmental or food analysis.',
    specs: ['Atomic absorption', 'Graphite furnace'],
    family: 'Laboratory',
  },
  {
    name: 'Heine Gamma GP sphygmomanometer',
    description: 'Clinical-grade manual blood-pressure monitor, for practice and ward.',
    specs: ['Manual', 'Clinical'],
    family: 'Medical devices',
  },
  {
    name: 'Thermoflash Pro LX-261E',
    description: 'Non-contact forehead thermometer, for reception and care areas.',
    specs: ['Non-contact', 'Infrared'],
    family: 'Medical devices',
  },
  // ── roulant ───────────────────────────────────────────────────
  {
    name: 'Toyota Fortuner turbo',
    description: 'Seven-seat SUV for field missions and team transport.',
    specs: ['7 seats', 'Turbo', '4×4'],
    family: 'Vehicles',
  },
  {
    name: 'Toyota Hilux 4×4 double cab',
    description: 'Double-cab pick-up, the reference workhorse for sites and upcountry projects.',
    specs: ['Double cab', '4×4', 'Pick-up'],
    family: 'Vehicles',
  },
  {
    name: 'Toyota Land Cruiser Prado',
    description: 'Rugged SUV for long missions and difficult tracks.',
    specs: ['4×4'],
    family: 'Vehicles',
  },
  {
    name: 'Toyota Rush',
    description: 'Compact crossover for urban service travel.',
    specs: ['Compact'],
    family: 'Vehicles',
  },
  {
    name: 'Toyota Hilux fuel filter housing',
    description: 'Complete housing with filter, for scheduled Hilux servicing.',
    specs: ['Toyota Hilux', 'Filter included'],
    family: 'Parts',
  },
  {
    name: 'Toyota Hilux fuel filter',
    description: 'Replacement filter for fleet servicing.',
    specs: ['Toyota Hilux'],
    family: 'Parts',
  },
  {
    name: '4×4 aluminium wheel',
    description: 'Aluminium wheel for off-road vehicles.',
    specs: ['Aluminium', '4×4'],
    family: 'Parts',
  },
  {
    name: 'Toyota Hilux pick-up tyres',
    description: 'Replacement tyres for pick-ups.',
    specs: ['Toyota Hilux'],
    family: 'Parts',
  },
  // ── outillage ─────────────────────────────────────────────────
  {
    name: '198-piece tool case',
    description: 'Complete repair kit for the workshop or on-site work.',
    specs: ['198 pieces'],
  },
  {
    name: 'Wall rack with 44 bins',
    description: 'Wall storage system with bins, for fasteners and small workshop parts.',
    specs: ['44 bins', '115 × 78 cm'],
  },
  {
    name: 'Empty 5-compartment tool box',
    description: 'Empty compartmented tool box, to fill according to the trade.',
    specs: ['5 compartments', 'Empty'],
  },
  {
    name: 'Service rope',
    description: 'Working rope for manoeuvring and light lifting.',
    specs: ['Working at height'],
  },
  {
    name: 'Ratchet cable cutter Ø 52 mm',
    description: 'Insulated cable cutter for live work, up to 52 mm diameter.',
    specs: ['Ø 52 mm', '1000 V insulated', 'Ratchet'],
  },
  {
    name: 'Two-section sliding ladder',
    description: 'Two-section ladder with rope mechanism, for work at height.',
    specs: ['2 sections', 'Rope mechanism'],
  },
  {
    name: 'Scheppach CSP2540 petrol pruner',
    description: 'Petrol pruner for grounds maintenance and line clearing.',
    specs: ['25 cm', '25 cc', 'Petrol'],
  },
  {
    name: 'Pole climbing irons',
    description: 'Lineman climbers for round or hexagonal poles.',
    specs: ['Round or hexagonal poles'],
  },
  {
    name: 'Phase sequence indicator',
    description: 'Checks phase rotation before commissioning.',
    specs: ['Three-phase'],
  },
  {
    name: '700 A TRMS clamp meter',
    description: 'True-RMS current measurement, up to 700 amperes.',
    specs: ['700 A', 'TRMS'],
  },
  {
    name: 'Welding set',
    description: 'Workshop welding set for repair and fabrication.',
    specs: ['Workshop'],
  },
  {
    name: 'Hacksaws',
    description: 'Hand saws for cutting sections and tubes.',
    specs: ['Metals'],
  },
  {
    name: 'Constructor metal cut-off saw',
    description: 'Bench cut-off saw for bars and sections.',
    specs: ['2300 W', 'Metals'],
  },
  {
    name: '6-inch cordless chainsaw',
    description: 'Battery garden chainsaw, supplied with two batteries and two chains.',
    specs: ['6 inches', '2 batteries', '2 chains'],
  },
  {
    name: 'Expert PRIMO maintenance case',
    description: 'Complete maintenance case, for a field technician.',
    specs: ['145 tools'],
  },
  {},
  {},
  // ── controle-acces ────────────────────────────────────────────
  {
    name: 'MAXIMA ULTRA 68 access barrier',
    description: 'Rising barrier for a site entrance, corporate or public-sector car park.',
    specs: ['Rising barrier'],
    family: 'Access control',
  },
  {
    name: 'TERRA 180 access barrier',
    description: 'Rising barrier for a wide opening and sustained traffic.',
    specs: ['Rising barrier', 'Wide opening'],
    family: 'Access control',
  },
  {
    name: 'PVC magnetic-stripe badge cards',
    description: 'Customisable access badges, the consumable of the control system.',
    specs: ['PVC', 'Magnetic stripe'],
    family: 'Access control',
  },
  {
    name: 'inBIO 160/260/460 access controller',
    description: 'Access management controller, one to four doors depending on model.',
    specs: ['1 to 4 doors', 'Biometrics'],
    family: 'Access control',
  },
  {
    name: 'Fail-safe electric strike',
    description: 'Fail-safe strike: the door releases if power is lost.',
    specs: ['Fail-safe'],
    family: 'Access control',
  },
  {
    name: 'ZKTeco K40 biometric time clock',
    description: 'Fingerprint time clock for attendance management.',
    specs: ['Fingerprint', 'Attendance'],
    family: 'Access control',
  },
  {
    name: 'TimeMoto TM-828 SC time clock',
    description: 'Clocking terminal for a mid-sized workforce, with tracking software.',
    specs: ['Attendance'],
    family: 'Access control',
  },
  {
    name: '4 MP indoor dome camera',
    description: 'Indoor surveillance camera, discreet and vandal-resistant.',
    specs: ['4 MP', 'Indoor', 'Dome'],
    family: 'Video surveillance',
  },
  {
    name: '4 MP outdoor bullet camera',
    description: 'Full HD+ outdoor surveillance camera, for perimeter and car park.',
    specs: ['4 MP', 'Full HD+', 'Outdoor'],
    family: 'Video surveillance',
  },
  {
    family: 'Safety equipment',
  },
  {
    family: 'Safety equipment',
  },
  {
    family: 'Safety equipment',
  },
  // ── chimie-reactifs ───────────────────────────────────────────
  {
    name: '2-Propanol',
    description: 'Laboratory and technical cleaning solvent.',
    specs: ['Solvent'],
  },
  {
    name: 'Ethyl acetate',
    description: 'Extraction and chromatography solvent.',
    specs: ['99.8 %+'],
  },
  {
    name: 'Propionic acid',
    description: 'Pure organic acid, for laboratory and preservation use.',
    specs: ['99.5 %+', 'Pure'],
  },
  {
    name: 'Succinic acid',
    description: 'Food-grade organic acid.',
    specs: ['99.5 %+', 'Food grade'],
  },
  {
    name: 'Sulfuric acid 98 %',
    description: 'Concentrated mineral acid for laboratory and industrial treatment.',
    specs: ['98 %'],
  },
  {
    name: 'Barium carbonate (BaCO₃)',
    description: 'High-purity salt for analysis and technical use.',
    specs: ['High purity'],
  },
  {
    name: 'Potassium carbonate',
    description: 'FCC food-grade salt, powder form.',
    specs: ['99.9 %+', 'FCC food grade', 'Powder'],
  },
  {
    name: 'Granular activated carbon',
    description: 'Filter medium for water treatment and dechlorination.',
    specs: ['Granular', 'Water treatment'],
  },
  {
    name: '1,10-phenanthroline hydrochloride',
    description: 'Reagent for colorimetric iron determination.',
    specs: ['Monohydrate', 'Reagent'],
  },
  {
    name: 'Magnesium sulfate heptahydrate',
    description: 'Food-grade salt, for laboratory and industrial use.',
    specs: ['99 %+', 'Food grade'],
  },
  // ── photovoltaique ────────────────────────────────────────────
  {
    name: '12 V / 18 Ah lead battery',
    description: 'Storage battery for a small off-grid installation or inverter.',
    specs: ['12 V / 18 Ah', '216 Wh', 'M5 terminals'],
  },
  {
    name: '12 V / 10 W solar charger',
    description: 'Trickle charge for a vehicle battery left standing.',
    specs: ['12 V', '10 W'],
  },
  {
    name: '12 V to 230 V converter',
    description: 'Runs mains appliances from a battery, with a USB outlet.',
    specs: ['300 W', 'USB 2.1 A'],
  },
  {
    name: '3500 W hybrid solar inverter',
    description: 'Hybrid inverter with MPPT regulator, remotely managed over a Wi-Fi module.',
    specs: ['3500 W', 'MPPT 12/24 V', 'Wi-Fi'],
  },
  {
    name: 'Flexible monocrystalline solar panel',
    description: 'Flexible panel to bond to a curved surface, for vehicles or light installations.',
    specs: ['100 W', 'Monocrystalline', 'ETFE/EVA'],
  },
  {
    name: '260 W portable solar panel',
    description: 'Transportable panel to power a site or a mission.',
    specs: ['260 W', 'Portable'],
  },
  {
    name: 'Solar charge regulator',
    description: 'Protects the battery against overcharge and deep discharge.',
    specs: ['Charge regulation'],
  },
  {
    name: 'Hybrid solar / wind voltage regulator',
    description: 'Regulation for an installation combining panels and a wind turbine.',
    specs: ['Hybrid solar / wind'],
  },
  {},
  // ── generateurs ───────────────────────────────────────────────
  {
    name: '180 A welding generator',
    description: 'Self-contained engine-driven welding set, for sites without mains power.',
    specs: ['180 A', 'Honda engine', '4.5 kVA'],
  },
  {
    name: 'Ayerbe canopied generator set',
    description: 'Canopied set for noise-sensitive sites: offices, clinics, hotels.',
    specs: ['40 kVA', 'Canopied', 'AY-1500-40-TX-LOMB'],
  },
  {
    name: 'GENELEC diesel generator set',
    description: 'Standby diesel set for a building or technical installation.',
    specs: ['Diesel'],
  },
  {
    name: 'KOHLER SDMO diesel generator set',
    description: 'Standby diesel set, professional range.',
    specs: ['Diesel', 'KOHLER SDMO'],
  },
  // ── didactiques ───────────────────────────────────────────────
  {
    name: 'Teaching solar plant',
    description: 'Training bench covering both cases: grid feed-in and off-grid.',
    specs: ['Grid feed-in', 'Off-grid'],
  },
  {
    name: 'Wind turbine simulator',
    description: 'Training bench for wind generation with grid feed-in.',
    specs: ['Grid feed-in'],
  },
  {
    name: 'Solar pumping station',
    description: 'Training bench for panel-powered pumping.',
    specs: ['Solar pumping'],
  },
  {
    name: 'Solar tracker with battery',
    description: 'Sun-tracking bench, with storage.',
    specs: ['Sun tracking', 'Battery'],
  },
  // ── branchement ───────────────────────────────────────────────
  {
    name: 'Universal DN15 sub-meter',
    description: 'Cold-water sub-metering by premises or by use.',
    specs: ['DN15', 'Cold water'],
  },
  {
    name: 'DN15 volumetric meter',
    description: 'Volumetric cold-water metering, accurate at low flow.',
    specs: ['DN15', 'Cold water', 'Volumetric'],
  },
  {
    name: 'Water meter fitting 25-33/42',
    description: 'Installation fitting for a water meter.',
    specs: ['25-33/42'],
  },
  {
    name: 'FF 3/4 pressure reducer',
    description: 'Stabilises the inlet pressure of an indoor network.',
    specs: ['FF 3/4'],
  },
  // ── electriques ───────────────────────────────────────────────
  {
    name: '13-module enclosure, 2 rows',
    description: 'Modular board for a plant room or small building.',
    specs: ['13 modules', '2 rows', 'Schneider Resi9'],
  },
  {
    name: '1P+N residual current breaker',
    description: 'Residual-current protection for a final circuit.',
    specs: ['1P+N', 'C 10 A', '4500 A breaking capacity'],
  },
  // ── manutention ───────────────────────────────────────────────
  {
    name: 'VMAX forklift',
    description: 'Forklift for warehouse and loading bay.',
    specs: ['Forklift'],
  },
  {
    name: 'Electric pallet truck',
    description: 'Power-assisted pallet truck, for sustained turnover.',
    specs: ['Electric'],
  },
  {
    name: '2.5 t manual pallet truck',
    description: 'Manual pallet truck for moving pallets.',
    specs: ['2.5 tonnes', 'Manual'],
  },
  // ── location-reception ────────────────────────────────────────
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Furniture',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Tableware',
  },
  {
    family: 'Linen',
  },
  {
    family: 'Linen',
  },
  {
    family: 'Linen',
  },
  {
    family: 'Linen',
  },
  {
    family: 'Linen',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Décor',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Sound & lighting',
  },
  {
    family: 'Tents & structures',
  },
  {
    family: 'Tents & structures',
  },
  {
    family: 'Tents & structures',
  },
  {
    family: 'Tents & structures',
  },
  {
    family: 'Tents & structures',
  },
  {
    family: 'Tents & structures',
  },
  // ── organisation ──────────────────────────────────────────────
  {
    family: 'Before the event',
  },
  {
    family: 'Before the event',
  },
  {
    family: 'On the day',
  },
  {
    family: 'On the day',
  },
  {
    family: 'On the day',
  },
  {
    family: 'On the day',
  },
  {
    family: 'On the day',
  },
  {
    family: 'After the event',
  },
  // ── etudes-prestations ────────────────────────────────────────
  {
    family: 'Studies',
  },
  {
    family: 'Studies',
  },
  {
    family: 'Studies',
  },
  {
    family: 'Studies',
  },
  {
    family: 'Advisory',
  },
  {
    family: 'Advisory',
  },
  {
    family: 'Advisory',
  },
  {
    family: 'Advisory',
  },
  {
    family: 'Training',
  },
  {
    family: 'Training',
  },
  {
    family: 'Training',
  },
  {
    family: 'Training',
  },
  {
    family: 'Project support & tenders',
  },
  {
    family: 'Project support & tenders',
  },
  {
    family: 'Project support & tenders',
  },
  {
    family: 'Project support & tenders',
  },
  {
    family: 'Project support & tenders',
  },
  // ── agro-industrie ────────────────────────────────────────────
  {
    family: 'Inputs',
  },
  {
    family: 'Inputs',
  },
  {
    family: 'Inputs',
  },
  {
    family: 'Inputs',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Equipment',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Processing',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
  {
    family: 'Value chains & cooperatives',
  },
])
