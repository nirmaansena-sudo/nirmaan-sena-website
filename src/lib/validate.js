import { categories } from './site.js';

export function slugify(input = '') {
  return String(input)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

// Media may only come from where the dashboard puts it: Cloudinary, this
// server's /media/ folder, Google-hosted starter images, or YouTube links.
const MEDIA_HOSTS = /^https:\/\/(res\.cloudinary\.com|[a-z0-9-]+\.googleusercontent\.com)\/[^\s"'<>]+$/i;
const LOCAL_MEDIA = /^\/media\/[A-Za-z0-9._/-]+$/;
const YOUTUBE = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s"'<>]+$/i;

export function isAllowedMediaUrl(url, type = 'image') {
  if (typeof url !== 'string' || url.length > 1000) return false;
  if (type === 'youtube') return YOUTUBE.test(url);
  return MEDIA_HOSTS.test(url) || (LOCAL_MEDIA.test(url) && !url.includes('..'));
}

function media(item) {
  if (!item || typeof item !== 'object') return null;
  const type = ['image', 'video', 'youtube'].includes(item.type) ? item.type : 'image';
  if (!isAllowedMediaUrl(item.url, type)) return null;
  return {
    id: str(item.id, 40) || Math.random().toString(36).slice(2, 12),
    type,
    url: item.url.trim().slice(0, 1000),
    poster: isAllowedMediaUrl(item.poster, 'image') ? item.poster.trim() : '',
    width: num(item.width) || 0,
    height: num(item.height) || 0,
    caption: str(item.caption, 200),
    layout: item.layout === 'full' ? 'full' : 'auto',
  };
}

/**
 * Cleans project input from the dashboard. Returns { data, errors }.
 * Only whitelisted fields are kept.
 */
export function normalizeProject(input = {}) {
  const errors = {};
  const title = str(input.title, 140);
  if (title.length < 2) errors.title = 'Add a project title.';

  const slug = slugify(input.slug || title);
  if (!slug) errors.slug = 'Add a URL name using letters or numbers.';

  const category = categories.some((c) => c.key === input.category) ? input.category : categories[0].key;

  const gallery = Array.isArray(input.gallery) ? input.gallery.map(media).filter(Boolean).slice(0, 200) : [];
  const cover = media(input.cover);
  const heroVideo = media(input.heroVideo);

  const data = {
    title,
    slug,
    category,
    location: str(input.location, 120),
    city: str(input.city, 60) || 'Jaipur',
    year: str(String(input.year ?? ''), 4).replace(/[^0-9]/g, ''),
    status: input.status === 'ongoing' ? 'ongoing' : 'completed',
    area: num(input.area),
    duration: str(input.duration, 40),
    client: str(input.client, 120),
    summary: str(input.summary, 320),
    description: str(input.description, 8000),
    scope: (Array.isArray(input.scope) ? input.scope : String(input.scope || '').split(','))
      .map((s) => str(s, 60))
      .filter(Boolean)
      .slice(0, 12),
    specs: (Array.isArray(input.specs) ? input.specs : [])
      .map((r) => ({ label: str(r?.label, 60), value: str(r?.value, 160) }))
      .filter((r) => r.label && r.value)
      .slice(0, 30),
    cover: cover && cover.type === 'image' ? cover : gallery.find((g) => g.type === 'image') || null,
    heroVideo: heroVideo && heroVideo.type !== 'image' ? heroVideo : null,
    gallery,
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    seoDescription: str(input.seoDescription, 300),
  };

  if (data.published && !data.cover) errors.cover = 'Add a cover photo before publishing.';

  return { data, errors };
}

/** Validates a public enquiry. Returns { data, errors }. */
export function normalizeEnquiry(input = {}) {
  const errors = {};
  const name = str(input.name, 80);
  if (name.length < 2) errors.name = 'Please enter your name.';

  const digits = String(input.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) errors.phone = 'Enter a 10-digit Indian mobile number.';

  const wDigits = String(input.whatsapp || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  const whatsapp = wDigits ? (/^[6-9]\d{9}$/.test(wDigits) ? wDigits : null) : digits;
  if (whatsapp === null) errors.whatsapp = 'Enter a valid WhatsApp number or leave it blank.';

  const email = str(input.email, 120);
  if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email)) errors.email = 'Check the email address.';

  const data = {
    name,
    phone: digits,
    whatsapp: whatsapp || digits,
    email,
    locality: str(input.locality, 80),
    services: (Array.isArray(input.services) ? input.services : []).map((s) => str(s, 80)).filter(Boolean).slice(0, 10),
    projectType: str(input.projectType, 80),
    area: str(String(input.area ?? ''), 20),
    timeline: str(input.timeline, 60),
    message: str(input.message, 2000),
    source: str(input.source, 120) || 'website',
  };
  return { data, errors };
}
