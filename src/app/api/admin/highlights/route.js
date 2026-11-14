import { errorJson, handle, json, readJson, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';
import { initialHighlights, normalizeHighlights } from '@/lib/highlights';
import { refreshSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const store = await getStore();
  const [projects, settings] = await Promise.all([store.listProjects({ includeDrafts: true }), store.getHighlights()]);
  return json({ ok: true, settings: initialHighlights(projects, settings), configured: settings !== null });
});

export const PUT = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const input = await readJson(request, 12000);
  const store = await getStore();
  const projects = await store.listProjects();
  const { data, errors } = normalizeHighlights(input.settings, projects);
  if (Object.keys(errors).length) return errorJson('Please check your project selections.', 422, { errors });
  const settings = await store.saveHighlights(data);
  refreshSite();
  return json({ ok: true, settings });
});
