import { getStore } from './store/index.js';
import { resolveHighlights } from './highlights.js';

/** Independently curated public placements; drafts/deleted records are always excluded. */
export async function getProjectHighlights() {
  const store = await getStore();
  const [projects, settings] = await Promise.all([store.listProjects(), store.getHighlights()]);
  return resolveHighlights(projects, settings);
}

/** Published projects, in dashboard order. */
export async function getPublishedProjects() {
  const store = await getStore();
  return store.listProjects();
}

export async function getFeaturedProjects(limit = 3) {
  const all = await getPublishedProjects();
  const featured = all.filter((p) => p.featured);
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getPublishedProject(slug) {
  const store = await getStore();
  const project = await store.getProjectBySlug(slug);
  return project && project.published ? project : null;
}

/** The project that follows `slug` in the published list (wraps around). */
export async function getNextProject(slug) {
  const all = await getPublishedProjects();
  if (all.length < 2) return null;
  const i = all.findIndex((p) => p.slug === slug);
  return all[(i + 1) % all.length];
}

/** Count of published projects per category key. */
export function countByCategory(projects) {
  return projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
}

