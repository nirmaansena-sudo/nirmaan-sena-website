// Central place for company details and page copy.
// Edit this file to change contact details, stats, services or process text.

export const site = {
  name: 'Nirmaan Sena',
  legalName: 'Nirmaan Sena Technologies Pvt. Ltd.',
  tagline: 'Neev se nirmaan tak',
  description:
    'Turnkey construction, architecture and interiors in Jaipur. Line-item BOQ in 24 hours, payments tied to inspected milestones, and verified trades on every site.',
  url: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) || 'https://nirmaansena.com',
  phone: '+91 78917 19291',
  phoneHref: 'tel:+917891719291',
  whatsapp: '917891719291',
  email: 'contact@nirmaansena.com',
  address: {
    line1: 'Govind Nagar Vistar, Gokulpura Kalwar Road',
    line2: 'Jhotwara, Jaipur, Rajasthan 302012',
    mapQuery: 'Govind Nagar Vistar, Gokulpura Kalwar Road, Jhotwara, Jaipur 302012',
  },
  hours: 'Mon – Sun, 8:00 am – 6:00 pm',
  // Company registration details. Each one is shown in the footer once filled in.
  credentials: {
    cin: '', // e.g. 'U45200RJ2024PTC000000'
    gstin: '', // e.g. '08AAAAA0000A1Z5'
  },
};

export const whatsappLink = (text = 'Hello Nirmaan Sena, I would like to discuss a project.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const nav = [
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Shown on the home page and the about page.
export const stats = [
  { value: '50+', label: 'Sites delivered across Jaipur' },
  { value: '500+', label: 'ID-verified tradespeople' },
  { value: '24 h', label: 'Site audit to line-item BOQ' },
  { value: '10 yr', label: 'Structural warranty on turnkey builds' },
];

// Project categories used for filters and the dashboard.
export const categories = [
  { key: 'residential', label: 'Residential' },
  { key: 'hospitality', label: 'Cafés & Hospitality' },
  { key: 'commercial', label: 'Commercial & Retail' },
  { key: 'corporate', label: 'Corporate Offices' },
  { key: 'construction', label: 'Turnkey Construction' },
  { key: 'millwork', label: 'Custom Millwork' },
];

export const categoryLabel = (key) => categories.find((c) => c.key === key)?.label || 'Project';

export const services = [
  {
    slug: 'turnkey-construction',
    number: '01',
    title: 'Turnkey Construction',
    short: 'Villas, commercial buildings and institutional campuses, from soil test to key handover.',
    body: 'One contract covers design coordination, civil work, MEP and finishes. We work from a fixed line-item BOQ, release payments only at inspected milestones and back the structure with a 10-year warranty.',
    includes: ['Soil test and structural design', 'RCC frame and masonry', 'Electrical, plumbing and drainage', 'Finishes and handover documents'],
    forWhom: 'New homes, floor additions, showrooms and institutional buildings',
  },
  {
    slug: 'architecture-design',
    number: '02',
    title: 'Architecture & Structural Design',
    short: 'JDA-compliant sanction drawings, 3D elevations, structural design and Vastu planning.',
    body: 'Our architects and structural engineers prepare drawings that can be approved and built without guesswork: working drawings, reinforcement details and a bill of quantities that matches them.',
    includes: ['Sanction drawings for JDA', 'Working and electrical drawings', '3D elevations and interior views', 'Structural design from soil data'],
    forWhom: 'Plot owners planning a new build or a major renovation',
  },
  {
    slug: 'interiors-specialised-works',
    number: '03',
    title: 'Interiors & Specialised Works',
    short: 'Painting, Italian marble, gypsum ceilings, UPVC windows, millwork and rooftop solar.',
    body: 'Itemised execution by specialist crews, priced per square foot or per unit. Each trade is supervised by a site engineer and signed off against the drawing before the next one starts.',
    includes: ['Premium paint systems', 'Marble laying and polishing', 'Gypsum and POP ceilings', 'UPVC windows, millwork and solar'],
    forWhom: 'Homes, offices, cafés and retail fit-outs',
  },
  {
    slug: 'project-management',
    number: '04',
    title: 'Project Management (PMC)',
    short: 'Independent engineers who audit your contractor, logged and reported daily.',
    body: 'Already have a contractor? Our engineers check the work on your behalf: reinforcement, concrete, curing and quantities, with photo logs and a written report at every stage.',
    includes: ['Rebar and shuttering checks', 'Slump and cube tests', 'Curing and quality logs', 'Bill verification'],
    forWhom: 'Owners who want an independent check on an ongoing project',
  },
  {
    slug: 'labour-trades',
    number: '05',
    title: 'Labour & Trades',
    short: 'Masons, carpenters, plumbers, electricians, tile layers, POP and welders.',
    body: 'ID-verified tradespeople supplied on daily wages or on contract, with a supervisor accountable for attendance, safety and quality.',
    includes: ['Masons and helpers', 'Carpenters and polishers', 'Plumbers and electricians', 'Tile layers, POP and welders'],
    forWhom: 'Contractors and owners who need reliable crews quickly',
  },
  {
    slug: 'building-materials',
    number: '06',
    title: 'Building Materials',
    short: 'Cement, TMT steel, bricks, Kota stone and CPVC at Jaipur depot rates.',
    body: 'Direct procurement from authorised dealers with a written rate sheet, delivery to site and quantities checked against the BOQ.',
    includes: ['UltraTech and Shree cement', 'Fe 550D TMT bars', 'Red clay bricks and Kota stone', 'CPVC and sanitary fittings'],
    forWhom: 'Builds of any size, with or without our construction team',
  },
];

export const processSteps = [
  {
    number: '01',
    title: 'Share your requirement',
    time: 'Day 0',
    body: 'Tell us about your plot or space, the work you need and your timeline. A site engineer calls you back the same working day.',
  },
  {
    number: '02',
    title: 'Site audit and BOQ',
    time: 'Within 24 hours',
    body: 'We visit, measure and check access, then send a line-item bill of quantities with fixed rates. No lump sums, no hidden margins.',
  },
  {
    number: '03',
    title: 'Build in inspected stages',
    time: 'Through handover',
    body: 'Payments are tied to milestones such as plinth, lintel, slab and plaster. Each stage is inspected, and you get daily photo updates on WhatsApp.',
  },
];

export const standards = [
  { title: 'Setting out', body: 'Soil report review, centre-line marking and level transfer before excavation begins.' },
  { title: 'Reinforcement', body: 'Bar diameter, spacing, cover blocks and lap lengths checked before every pour.' },
  { title: 'Concrete', body: 'Slump test on site, cube samples for strength and a written curing log.' },
  { title: 'Masonry & plaster', body: 'Line, level and plumb checks, with mortar ratios recorded for each batch.' },
  { title: 'Waterproofing', body: 'Ponding test on terraces and wet areas before any finish is laid.' },
  { title: 'Handover', body: 'Snag-list walk-through, as-built drawings and a written warranty document.' },
];

export const principles = [
  { title: 'Fixed, itemised pricing', body: 'Every quote is a line-item BOQ with unit rates you can check against the market.' },
  { title: 'Pay for inspected work', body: 'Money moves only when a milestone is complete and signed off by you and our engineer.' },
  { title: 'Verified people', body: 'Every tradesperson on site is ID-verified and works under a named supervisor.' },
  { title: 'Daily visibility', body: 'Photo logs on WhatsApp every working day, wherever you are.' },
];

// Brands and materials named on the current site. Edit to match what you actually stock.
export const materialBrands = [
  { name: 'UltraTech', logo: '/brand/materials/ultratech.png' },
  { name: 'Shree Cement', logo: '/brand/materials/shree-cement.jpg' },
  { name: 'Tata Tiscon', logo: '/brand/materials/tata-tiscon.webp' },
  { name: 'Kamdhenu', logo: '/brand/materials/kamdhenu.png' },
  { name: 'Asian Paints', logo: '/brand/materials/asian-paints.png' },
  // Original category illustrations; these three entries are materials, not company logos.
  { name: 'Kota Stone', logo: '/brand/materials/kota-stone.svg' },
  { name: 'Italian Marble', logo: '/brand/materials/italian-marble.svg' },
  { name: 'Fe 550D TMT', logo: '/brand/materials/fe-550d-tmt.svg' },
];

export const localities = [
  'Vaishali Nagar',
  'Mansarovar',
  'Jhotwara / Kalwar Road',
  'Jagatpura',
  'Malviya Nagar',
  'Raja Park / C-Scheme',
  'Ajmer Road / Bhankrota',
  'Vidhyadhar Nagar',
  'Sanganer / Tonk Road',
  'Other area in Jaipur',
  'Outside Jaipur',
];

export const projectTypes = [
  'New house or villa',
  'Floor addition or extension',
  'Apartment interior',
  'Commercial or showroom fit-out',
  'Café or restaurant',
  'Office',
  'Repair or waterproofing',
  'Other',
];

export const timelines = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Still planning'];
