import { errorJson, handle, json, readJson, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';
import { normalizeProject } from '@/lib/validate';
import { refreshSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request, { params }) => {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const project = await (await getStore()).getProject(id);
  return project ? json({ ok: true, project }) : errorJson('Project not found.', 404);
});

export const PUT = handle(async (request, { params }) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const { data, errors } = normalizeProject(await readJson(request));
  if (Object.keys(errors).length) return errorJson('Please fix the highlighted fields.', 422, { errors });
  const store = await getStore();
  if (await store.slugTaken(data.slug, id)) {
    return errorJson('Another project already uses this URL name.', 409, { errors: { slug: 'Choose a different URL name.' } });
  }
  const project = await store.updateProject(id, data);
  if (!project) return errorJson('Project not found.', 404);
  refreshSite();
  return json({ ok: true, project });
});

export const PATCH = handle(async (request, { params }) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  const patch = {};
  if (typeof body.published === 'boolean') patch.published = body.published;
  if (typeof body.featured === 'boolean') patch.featured = body.featured;
  const store = await getStore();
  if (patch.published) {
    const current = await store.getProject(id);
    if (current && !current.cover) return errorJson('Add a cover photo before publishing.', 422);
  }
  const project = await store.updateProject(id, patch);
  if (!project) return errorJson('Project not found.', 404);
  refreshSite();
  return json({ ok: true, project });
});

export const DELETE = handle(async (request, { params }) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const ok = await (await getStore()).deleteProject(id);
  if (!ok) return errorJson('Project not found.', 404);
  refreshSite();
  return json({ ok: true });
});
