import { handle, json, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';
import { refreshSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

// Imports the starter projects (from the old website) into the database.
export const POST = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const added = await (await getStore()).importSeed();
  refreshSite();
  return json({ ok: true, added });
});
