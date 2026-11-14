import { errorJson, handle, json, readJson, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';
import { refreshSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { ids } = await readJson(request);
  if (!Array.isArray(ids) || !ids.every((x) => typeof x === 'string')) return errorJson('Invalid order.', 400);
  await (await getStore()).reorderProjects(ids.slice(0, 1000));
  refreshSite();
  return json({ ok: true });
});
