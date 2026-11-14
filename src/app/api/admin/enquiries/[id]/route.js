import { errorJson, handle, json, readJson, requireAdmin } from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'contacted', 'site-visit', 'quoted', 'won', 'closed'];

export const PATCH = handle(async (request, { params }) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request, 10_000);
  const patch = {};
  if (STATUSES.includes(body.status)) patch.status = body.status;
  if (typeof body.note === 'string') patch.note = body.note.slice(0, 2000);
  const enquiry = await (await getStore()).updateEnquiry(id, patch);
  return enquiry ? json({ ok: true, enquiry }) : errorJson('Enquiry not found.', 404);
});

export const DELETE = handle(async (request, { params }) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const ok = await (await getStore()).deleteEnquiry(id);
  return ok ? json({ ok: true }) : errorJson('Enquiry not found.', 404);
});
