import { getPublishedProjects } from '@/lib/projects';
import { site } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap() {
  const base = site.url.replace(/\/$/, '');
  const pages = ['', '/projects', '/services', '/about', '/contact'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.8,
  }));
  let projects = [];
  try {
    projects = (await getPublishedProjects()).map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {}
  return [...pages, ...projects];
}
