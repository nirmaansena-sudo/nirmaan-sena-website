import { handle, json, requireAdmin } from '@/lib/api';
import { uploadSignature } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// Returns a short-lived Cloudinary signature so the browser can upload directly
// (fast, and no file-size limits from the web server). Falls back to local uploads.
export const POST = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const sig = uploadSignature('projects');
  if (!sig) return json({ ok: true, mode: 'local' });
  return json({ ok: true, mode: 'cloudinary', ...sig });
});
