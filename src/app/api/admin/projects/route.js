import { errorJson, handle, json, readJson, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';
import { normalizeProject } from '@/lib/validate';
import { refreshSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const store = await getStore();
  return json({ ok: true, projects: await store.listProjects({ includeDrafts: true }) });
});

export const POST = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { data, errors } = normalizeProject(await readJson(request));
  if (Object.keys(errors).length) return errorJson('Please fix the highlighted fields.', 422, { errors });
  const store = await getStore();
  if (await store.slugTaken(data.slug)) {
    return errorJson('Another project already uses this URL name.', 409, { errors: { slug: 'Choose a different URL name.' } });
  }
  const project = await store.createProject(data);
  refreshSite();
  return json({ ok: true, project }, 201);
});
