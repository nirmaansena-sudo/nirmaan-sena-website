/** Independent, ordered project placements. Saved empty lists intentionally hide a placement. */
export const HIGHLIGHT_PLACEMENTS = [
  { key: 'homeHero', title: 'Home · hero', description: 'The opening photograph and project link on the home page.', limit: 1, href: '/' },
  { key: 'homeSelected', title: 'Home · selected work', description: 'Up to three projects, in the exact order you choose.', limit: 3, href: '/#selected-work' },
  { key: 'projectsSpotlight', title: 'Projects · spotlight', description: 'A featured project above the full project collection.', limit: 1, href: '/projects' },
  { key: 'aboutSpotlight', title: 'About · project story', description: 'A project that represents the studio and its approach.', limit: 1, href: '/about' },
  { key: 'servicesSpotlight', title: 'Services · featured project', description: 'A project that brings your services to life.', limit: 1, href: '/services' },
];

export const emptyHighlights = () => Object.fromEntries(HIGHLIGHT_PLACEMENTS.map(({ key }) => [key, []]));

/** Preserve the previous home-page choices until Highlights is saved for the first time. */
export function initialHighlights(projects, settings) {
  if (settings !== null && settings !== undefined) {
    return Object.fromEntries(HIGHLIGHT_PLACEMENTS.map(({ key, limit }) => [key, Array.isArray(settings[key]) ? settings[key].slice(0, limit) : []]));
  }
  const published = projects.filter((project) => project.published);
  const ordered = [...published.filter((project) => project.featured), ...published.filter((project) => !project.featured)];
  const ids = (list) => list.map((project) => project.id);
  return {
    homeHero: ids(ordered.slice(0, 1)),
    homeSelected: ids(ordered.length > 1 ? ordered.slice(1, 4) : ordered),
    projectsSpotlight: ids(ordered.slice(0, 1)),
    aboutSpotlight: ids(ordered.slice(1, 2).length ? ordered.slice(1, 2) : ordered.slice(0, 1)),
    servicesSpotlight: ids(ordered.slice(2, 3).length ? ordered.slice(2, 3) : ordered.slice(0, 1)),
  };
}

/** Resolve at read time so unpublished or deleted projects can never leak into public highlights. */
export function resolveHighlights(projects, settings) {
  const byId = new Map(projects.filter((project) => project.published).map((project) => [project.id, project]));
  const selections = initialHighlights(projects, settings);
  return Object.fromEntries(HIGHLIGHT_PLACEMENTS.map(({ key }) => [key, [...new Set(selections[key])].map((id) => byId.get(id)).filter(Boolean)]));
}

/** Validate the complete configuration before saving any placement. */
export function normalizeHighlights(input, projects) {
  const data = emptyHighlights();
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { data, errors: { settings: 'Choose the projects for each highlight area.' } };
  }
  const available = new Set(projects.filter((project) => project.published).map((project) => project.id));
  const keys = new Set(HIGHLIGHT_PLACEMENTS.map(({ key }) => key));
  if (Object.keys(input).some((key) => !keys.has(key))) errors.settings = 'Unknown highlight area. Reload the page and try again.';
  for (const { key, limit } of HIGHLIGHT_PLACEMENTS) {
    const ids = input[key];
    if (!Array.isArray(ids) || ids.length > limit) {
      errors[key] = `Choose up to ${limit} ${limit === 1 ? 'project' : 'projects'} for this area.`;
    } else if (ids.some((id) => typeof id !== 'string' || id.length > 100 || !available.has(id))) {
      errors[key] = 'A selected project is no longer published. Remove it or choose another project.';
    } else if (new Set(ids).size !== ids.length) {
      errors[key] = 'Choose each project only once within this area.';
    } else {
      data[key] = [...ids];
    }
  }
  return { data, errors };
}
