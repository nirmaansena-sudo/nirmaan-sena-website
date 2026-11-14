// Starter projects, taken from the current nirmaansena.com.
// They load automatically in the local file store, and can be imported into
// MongoDB from the dashboard. Replace the photos with real site photography
// from the dashboard whenever you can.
//
// Note: on the old site several "different" photos of a project are the same
// picture, so only distinct photos are used here. The café photo also carries
// another studio's watermark in its corner — replace it with your own photo.

const G = 'https://lh3.googleusercontent.com/aida-public/';

const img = (id, width, height, caption = '') => ({
  id: id.slice(-10),
  type: 'image',
  url: G + id,
  width,
  height,
  caption,
  layout: 'auto',
});

const IMAGES = {
  brewtopiaFlagship: img(
    'AB6AXuCcs0E1HeSq93L0SeX4_GzSQLIj2mjx6kOrtFZcbBn1V1MklG7Hzb8MoZ7beuQ4Qtba7Y-FGweO82X2uQly4SBYIz6k6moG7-TZ1g8iD34k3xldg727h9VhOeISjZjdaE-2Ma6d1DPwwkpmZoRzk0i4BKTKq3RLdxFIWJrZOLRXG5Lx2deTZghe6naaRt47sJzmfzw64jDpbSCCnVOATCxuTifpQjqXPr3vyrioaSBPoZkEmAeSN9IEMxQWLFvJnl7kKAE',
    1280, 730, 'Café interior'
  ),
  platinumCover: img(
    'AB6AXuAzjNfBFde7GubcRNjmokI5w9NGcHhvI3fi1aJGMmxpasnEyzktuOC_p5UXItK_rheIUY7rYldq0uP0KErFXQQgZ4YQIp-I4T8VrMvvag-auUnx3RtRiPTPq2OkEcnpXbwMnS-BRQC_5TuQFKyLdVCKwhumoyRFsPd8AZGfhbAb6HbTNwnSCj9xAuuacVJTcNoY04XMon9tmCHYO2i_YWVKkQ3fvx7S2RsSuebvgzditdTEdC4Nrga3NDFiGsAocAFxQ6A',
    1280, 848, 'Bedroom with panelled wall'
  ),
  hqCover: img(
    'AB6AXuBGPFZkAP1gr22Hx62Nk5KXfWvxpOAcnDJTR-9ekk7qy2WOIfdzr7h_4CK8d--fW0UckWijtD1LpD6arQYznYlUP-5aGBdvaetO1LLMlm5wdzHyviERRl93smjQ4ZP8zbot44Dbv9f3KkDZK4U6yh8ATMGm8EHDukc0VzKvTWphz7EGazkiz-7kBQnpCvenDHLZq58y64xQ1ZJRyaDEho70yGYtpiJO-yWzXUDr8rtIlgCSmQnFX7hPCe2Y1jZJ7DVCtn0',
    1080, 668, 'Boardroom in emerald green marble'
  ),
  platinumDining: img(
    'AB6AXuDAoslzrrXNObd7ISGXNJvSrWrOgNj4eWVKhh8zxRKV7JjXgIaXzpUt5j2jbh_lEXbBj-FTGJGxt9ZIoC1WXLXz7iF9SM5L40m6mcO8fMc-6hwdO17R5WbTGum3rOKxCV3MIlp9NK9w3tcw1xlpSJGVNl7D-JpZYoylQmMG5ddDrQ45gafG6I3RbEg6ks3V0xaiNFmDfMkF6ZvyCJQzhcKK0SzjM6LkoLqFEOEydqiVAoVqmKUbqTajzILKp7BrEMHG1bk',
    1023, 1280, 'Dining area and teak partition'
  ),
  udbBedroom: img(
    'AB6AXuDWc2ReXnuEU6S61Q58rag_hoLRUtTlJ_uTpEn0xfpIVQ-tyeK5n0h_HRdst-7hZPC517BfDCvDNG2DAJnVgFuKEGYyoriB4R8J-RcBxQKqdOqLdgGTzzJ_jDvA84iDSTlsgWdT6S4zB9dsdOkTOZqJ2woXbL9MIZAetwhjwAm9K7w553V8M3yR6KKpwJ2j6b6K41cpkzcsN_C4rax36O9lyuHJuDZg3c9M9gu3tICbyO4x05iMxOUA832V_GBqu7z0CCY',
    1280, 720, 'Bedroom suite'
  ),
  udbKids: img(
    'AB6AXuBDBElNMm4Pb0hrDJM3rm7FxRDmNIz9EEQpXUzX5n3UMyVAe4ZOjfIQq22epBPMpecNXGNsiYKTm2-c_ufq_wvc63KmyddM_Dr353UV5nryDcPKzYZeq4SZY4sdfCGIbI1QC19MSTEicLtcL5BqnqHz9_g8XMKXLArBTSa4ZMSACFfN-ufetW74KSa_x8N75RPjZUT9dA1JuC_TDSh1yIfdOyVz1GxNM1BaeWoqjwP12ItFvIwe5VpeyOapg19cJk9Hk7k',
    1280, 720, 'Study desk and cabinetry'
  ),
};

const T0 = '2026-01-01T00:00:00.000Z';

export const seedProjects = () => [
  {
    id: 'seed-brewtopia',
    slug: 'brewtopia-cafe-mansarovar',
    title: 'Brewtopia Specialty Café & Roastery',
    category: 'hospitality',
    location: 'Shipra Path, Mansarovar',
    city: 'Jaipur',
    year: '',
    status: 'completed',
    area: 1850,
    duration: '45 days',
    client: 'Brewtopia',
    summary: 'A turnkey café and roastery fit-out with a spiral steel staircase, a curved terrazzo bar and fluted terracotta panelling.',
    description:
      'A turnkey fit-out for a specialty café and roastery on Shipra Path. The work began with a complete civil overhaul of the shell and a new acoustic mezzanine structure.\n\nThe interior is organised around a curved spiral steel staircase and a cast terrazzo bar, with fluted terracotta panelling and custom millwork throughout. Delivered in 45 days.',
    scope: ['Civil overhaul', 'Acoustic mezzanine', 'Custom millwork', 'Terrazzo bar', 'MEP'],
    specs: [
      { label: 'Built-up area', value: '1,850 sq ft' },
      { label: 'Feature wall', value: 'Fluted terracotta panelling' },
      { label: 'Bar', value: 'Cast terrazzo, curved' },
      { label: 'Staircase', value: 'Spiral, mild steel' },
      { label: 'Programme', value: '45 days, turnkey' },
    ],
    cover: IMAGES.brewtopiaFlagship,
    heroVideo: null,
    gallery: [],
    featured: true,
    published: true,
    order: 0,
    seoDescription: '',
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: 'seed-platinum',
    slug: 'platinum-residences-jagatpura',
    title: 'Platinum Residences',
    category: 'residential',
    location: 'Jagatpura',
    city: 'Jaipur',
    year: '',
    status: 'completed',
    area: 2650,
    duration: '48 days',
    client: '',
    summary: 'A 4 BHK turnkey interior with handcrafted teak panelling, an Italian marble dining area and custom brass partitions.',
    description:
      'A turnkey interior fit-out of a 4 BHK residence in Jagatpura, completed in 48 days.\n\nThe material palette is short and deliberate: handcrafted teak panelling, an Italian marble dining area and custom brass partitions.',
    scope: ['Interior fit-out', 'Teak panelling', 'Italian marble', 'Brass partitions', 'Lighting'],
    specs: [
      { label: 'Configuration', value: '4 BHK residence' },
      { label: 'Built-up area', value: '2,650 sq ft' },
      { label: 'Wall panelling', value: 'Handcrafted teak' },
      { label: 'Dining floor', value: 'Italian marble' },
      { label: 'Partitions', value: 'Custom brass frames' },
    ],
    cover: IMAGES.platinumCover,
    heroVideo: null,
    gallery: [IMAGES.platinumDining],
    featured: true,
    published: true,
    order: 1,
    seoDescription: '',
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: 'seed-hq',
    slug: 'executive-headquarters-c-scheme',
    title: 'Executive Headquarters',
    category: 'corporate',
    location: 'C-Scheme',
    city: 'Jaipur',
    year: '',
    status: 'completed',
    area: 2400,
    duration: '35 days',
    client: '',
    summary: 'A boardroom and MD cabin fit-out in book-matched emerald marble and birch acoustic panelling, with integrated MEP.',
    description:
      'A fit-out of the boardroom and MD cabins for a corporate headquarters in C-Scheme, completed in 35 days.\n\nThe boardroom is finished in book-matched emerald green marble, with birch acoustic wall panelling and fully integrated MEP services.',
    scope: ['Corporate fit-out', 'Book-matched marble', 'Acoustic panelling', 'Integrated MEP'],
    specs: [
      { label: 'Built-up area', value: '2,400 sq ft' },
      { label: 'Boardroom', value: 'Book-matched emerald green marble' },
      { label: 'Acoustics', value: 'Birch acoustic panelling' },
      { label: 'Services', value: 'Integrated MEP' },
      { label: 'Programme', value: '35 days' },
    ],
    cover: IMAGES.hqCover,
    heroVideo: null,
    gallery: [],
    featured: true,
    published: true,
    order: 2,
    seoDescription: '',
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: 'seed-udb-a101',
    slug: 'udb-harmony-a101-ajmer-road',
    title: 'Residence A-101, UDB Harmony',
    category: 'residential',
    location: 'Ajmer Road',
    city: 'Jaipur',
    year: '',
    status: 'completed',
    area: 1950,
    duration: '55 days',
    client: '',
    summary: 'A 3 BHK residence with a modern, minimal interior.',
    description: 'A 3 BHK residence on Ajmer Road with a modern, minimal interior, delivered in 55 days.',
    scope: ['Interior fit-out'],
    specs: [
      { label: 'Configuration', value: '3 BHK residence' },
      { label: 'Built-up area', value: '1,950 sq ft' },
      { label: 'Programme', value: '55 days' },
    ],
    cover: IMAGES.udbBedroom,
    heroVideo: null,
    gallery: [],
    featured: false,
    published: true,
    order: 3,
    seoDescription: '',
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: 'seed-udb-c602',
    slug: 'udb-harmony-c602-kids-suite',
    title: 'Kids’ Suite, C-602 UDB Harmony',
    category: 'millwork',
    location: 'Ajmer Road',
    city: 'Jaipur',
    year: '',
    status: 'completed',
    area: null,
    duration: '28 days',
    client: '',
    summary: 'A kids’ suite with a custom study desk and cabinetry.',
    description: 'A kids’ suite with a custom study desk and cabinetry, delivered in 28 days.',
    scope: ['Custom millwork', 'Study desk', 'Cabinetry'],
    specs: [
      { label: 'Scope', value: 'Study desk and cabinetry' },
      { label: 'Programme', value: '28 days' },
    ],
    cover: IMAGES.udbKids,
    heroVideo: null,
    gallery: [],
    featured: false,
    published: true,
    order: 4,
    seoDescription: '',
    createdAt: T0,
    updatedAt: T0,
  },
];
