import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { errorJson, handle, json, requireAdmin } from '@/lib/api';
import { dataDir } from '@/lib/store/file';
import { sniffMediaType } from '@/lib/sniff';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 250 * 1024 * 1024;

// Local upload (used when Cloudinary is not configured). Files are kept in .data/uploads.
export const POST = handle(async (request) => {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  if (process.env.VERCEL) {
    return errorJson('Uploads need Cloudinary on this host. Add the CLOUDINARY_* settings.', 503);
  }
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BYTES + 1024 * 1024) return errorJson('File is larger than 250 MB.', 413);

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return errorJson('No file received.', 400);
  if (file.size > MAX_BYTES) return errorJson('File is larger than 250 MB.', 413);

  // Trust the file's actual bytes, not the name or the browser-reported type.
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = sniffMediaType(buffer);
  if (!detected) return errorJson('Use JPG, PNG, WebP, AVIF or GIF photos, or MP4/WebM/MOV videos.', 415);

  const month = new Date().toISOString().slice(0, 7);
  const name = `${crypto.randomUUID()}.${detected.ext}`;
  const dir = path.join(dataDir(), 'uploads', month);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer, { flag: 'wx' });

  return json({ ok: true, url: `/media/${month}/${name}`, type: detected.kind, bytes: buffer.length });
});
