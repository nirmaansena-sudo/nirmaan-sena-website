// Detects a media file's real type from its first bytes ("magic numbers").
// Returns { ext, kind } for allowed photo/video formats, otherwise null.

const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b);
const ascii = (buf, start, end) => String.fromCharCode(...buf.subarray(start, end));

export function sniffMediaType(buf) {
  if (!buf || buf.length < 12) return null;
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { ext: 'jpg', kind: 'image' };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: 'png', kind: 'image' };
  if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return { ext: 'gif', kind: 'image' };
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return { ext: 'webp', kind: 'image' };
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return { ext: 'webm', kind: 'video' };
  if (ascii(buf, 4, 8) === 'ftyp') {
    const brand = ascii(buf, 8, 12);
    if (brand === 'avif' || brand === 'avis') return { ext: 'avif', kind: 'image' };
    if (brand === 'qt  ') return { ext: 'mov', kind: 'video' };
    if (/^(isom|iso2|iso4|iso5|iso6|mp41|mp42|avc1|M4V |M4VP|MSNV|dash|3gp4|3gp5)$/.test(brand)) return { ext: 'mp4', kind: 'video' };
  }
  return null;
}
