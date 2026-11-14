import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { dataDir } from '@/lib/store/file';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MIME = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

// Serves locally uploaded media, with HTTP range support for video seeking.
export async function GET(request, { params }) {
  const parts = (await params).path || [];
  if (parts.some((p) => !/^[a-zA-Z0-9._-]+$/.test(p) || p.startsWith('.'))) {
    return new Response('Not found', { status: 404 });
  }
  const root = path.join(dataDir(), 'uploads');
  const file = path.join(root, ...parts);
  if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });

  let stat;
  try {
    stat = await fsp.stat(file);
    if (!stat.isFile()) throw new Error('not a file');
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const type = MIME[path.extname(file).slice(1).toLowerCase()] || 'application/octet-stream';
  const headers = {
    'content-type': type,
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=31536000, immutable',
    'content-disposition': 'inline',
    'content-security-policy': "default-src 'none'; img-src 'self'; media-src 'self'; sandbox",
    'x-content-type-options': 'nosniff',
  };

  const range = request.headers.get('range');
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m) {
    let start = m[1] === '' ? stat.size - Number(m[2]) : Number(m[1]);
    let end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : stat.size - 1;
    if (start < 0) start = 0;
    if (end >= stat.size) end = stat.size - 1;
    if (start > end) {
      return new Response(null, { status: 416, headers: { 'content-range': `bytes */${stat.size}` } });
    }
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end }));
    return new Response(stream, {
      status: 206,
      headers: { ...headers, 'content-range': `bytes ${start}-${end}/${stat.size}`, 'content-length': String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(fs.createReadStream(file));
  return new Response(stream, { headers: { ...headers, 'content-length': String(stat.size) } });
}
