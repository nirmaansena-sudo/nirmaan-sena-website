// Security-focused tests. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sniffMediaType } from '../src/lib/sniff.js';
import { csvCell, toCsv } from '../src/lib/csv.js';
import { isAllowedMediaUrl, normalizeEnquiry, normalizeProject } from '../src/lib/validate.js';
import { signParams, uploadSignature, ALLOWED_FORMATS } from '../src/lib/cloudinary.js';

process.env.ADMIN_EMAIL = 'owner@nirmaansena.com';
process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.AUTH_SECRET = 'x'.repeat(40);
const auth = await import('../src/lib/auth.js');
const api = await import('../src/lib/api.js');

test('changing the admin password signs out existing sessions', () => {
  const token = auth.createSessionToken('owner@nirmaansena.com');
  assert.ok(auth.verifySessionToken(token));
  process.env.ADMIN_PASSWORD = 'a completely new password';
  assert.equal(auth.verifySessionToken(token), null);
  process.env.ADMIN_PASSWORD = 'correct horse battery staple';
  assert.ok(auth.verifySessionToken(token));
});

test('credentials are checked exactly (email case-insensitive)', () => {
  assert.ok(auth.checkCredentials('OWNER@nirmaansena.com', 'correct horse battery staple'));
  assert.ok(!auth.checkCredentials('owner@nirmaansena.com', 'correct horse battery staplE'));
  assert.ok(!auth.checkCredentials('other@nirmaansena.com', 'correct horse battery staple'));
  assert.ok(!auth.checkCredentials('', ''));
});

test('weak production settings are refused', () => {
  const env = { ...process.env };
  process.env.NODE_ENV = 'production';
  process.env.ADMIN_PASSWORD = 'short';
  assert.match(auth.authProblem(), /12 characters/);
  process.env.ADMIN_PASSWORD = 'a-long-enough-password';
  process.env.AUTH_SECRET = 'too-short-secret';
  assert.match(auth.authProblem(), /AUTH_SECRET/);
  Object.assign(process.env, env);
  process.env.NODE_ENV = env.NODE_ENV ?? 'test';
  if (env.NODE_ENV === undefined) delete process.env.NODE_ENV;
});

test('tampered or malformed tokens are rejected', () => {
  const t = auth.createSessionToken('owner@nirmaansena.com');
  const [p, s] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ e: 'x', exp: 9999999999 })).toString('base64url');
  assert.equal(auth.verifySessionToken(`${forged}.${s}`), null);
  assert.equal(auth.verifySessionToken(`${p}.${s}.extra`), null);
  assert.equal(auth.verifySessionToken('a'.repeat(5000)), null);
});

test('cross-site requests are blocked for admin changes', () => {
  const req = (headers) => new Request('https://nirmaansena.com/api/admin/projects', { method: 'POST', headers });
  assert.ok(auth.isSameOrigin(req({ host: 'nirmaansena.com', origin: 'https://nirmaansena.com', 'sec-fetch-site': 'same-origin' })));
  assert.ok(!auth.isSameOrigin(req({ host: 'nirmaansena.com', origin: 'https://evil.example' })));
  assert.ok(!auth.isSameOrigin(req({ host: 'nirmaansena.com', 'sec-fetch-site': 'cross-site' })));
});

test('API only accepts JSON bodies', async () => {
  const form = new Request('https://x/api', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{"a":1}' });
  await assert.rejects(api.readJson(form), (e) => e.status === 415);
  const big = new Request('https://x/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: 'x'.repeat(50) }) });
  await assert.rejects(api.readJson(big, 20), (e) => e.status === 413);
  const arr = new Request('https://x/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '[1,2]' });
  await assert.rejects(api.readJson(arr), (e) => e.status === 400);
  const ok = new Request('https://x/api', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: '{"a":1}' });
  assert.deepEqual(await api.readJson(ok), { a: 1 });
});

test('uploads are identified by their bytes, not their name', () => {
  const pad = (arr) => Buffer.concat([Buffer.from(arr), Buffer.alloc(16)]);
  assert.deepEqual(sniffMediaType(pad([0xff, 0xd8, 0xff, 0xe0])), { ext: 'jpg', kind: 'image' });
  assert.deepEqual(sniffMediaType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), { ext: 'png', kind: 'image' });
  assert.deepEqual(sniffMediaType(Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1')), { ext: 'webp', kind: 'image' });
  assert.deepEqual(sniffMediaType(Buffer.from('\x00\x00\x00\x18ftypmp42\x00\x00', 'latin1')), { ext: 'mp4', kind: 'video' });
  assert.deepEqual(sniffMediaType(Buffer.from('\x00\x00\x00\x14ftypqt  \x00\x00', 'latin1')), { ext: 'mov', kind: 'video' });
  assert.equal(sniffMediaType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null);
  assert.equal(sniffMediaType(Buffer.from('<html><body>hi</body></html>      ')), null);
  assert.equal(sniffMediaType(Buffer.from('%PDF-1.7 ..........')), null);
});

test('CSV export neutralises spreadsheet formulas', () => {
  assert.equal(csvCell('=HYPERLINK("http://evil","click")'), `"'=HYPERLINK(""http://evil"",""click"")"`);
  assert.equal(csvCell('+91 98290'), `"'+91 98290"`);
  assert.equal(csvCell('-2+3'), `"'-2+3"`);
  assert.equal(csvCell('@SUM(A1)'), `"'@SUM(A1)"`);
  assert.equal(csvCell('Ravi Sharma'), '"Ravi Sharma"');
  assert.equal(csvCell(['Turnkey', 'PMC']), '"Turnkey; PMC"');
  assert.match(toCsv([{ name: 'A', phone: '9829012345' }], ['name', 'phone']), /^name,phone\r\n"A","9829012345"$/);
});

test('media URLs are limited to trusted hosts', () => {
  assert.ok(isAllowedMediaUrl('https://res.cloudinary.com/demo/image/upload/v1/a.jpg'));
  assert.ok(isAllowedMediaUrl('https://lh3.googleusercontent.com/aida-public/ABC'));
  assert.ok(isAllowedMediaUrl('/media/2026-11/abc.jpg'));
  assert.ok(isAllowedMediaUrl('https://youtu.be/dQw4w9WgXcQ', 'youtube'));
  assert.ok(!isAllowedMediaUrl('https://evil.example/tracker.gif'));
  assert.ok(!isAllowedMediaUrl('javascript:alert(1)'));
  assert.ok(!isAllowedMediaUrl('/media/../.env'));
  assert.ok(!isAllowedMediaUrl('https://res.cloudinary.com/x" onerror="alert(1)'));
  assert.ok(!isAllowedMediaUrl('https://evil.example/watch?v=x', 'youtube'));
  const { data } = normalizeProject({ title: 'T', gallery: [{ type: 'image', url: 'https://evil.example/a.jpg' }] });
  assert.equal(data.gallery.length, 0);
});

test('enquiry email cannot smuggle mail headers', () => {
  assert.ok(normalizeEnquiry({ name: 'Ravi', phone: '9829012345', email: 'ravi@example.com?bcc=x@y.com' }).errors.email);
  assert.ok(!normalizeEnquiry({ name: 'Ravi', phone: '9829012345', email: 'ravi.s+site@example.co.in' }).errors.email);
});

test('Cloudinary signature restricts formats and cannot be altered', () => {
  process.env.CLOUDINARY_CLOUD_NAME = 'demo';
  process.env.CLOUDINARY_API_KEY = 'key';
  process.env.CLOUDINARY_API_SECRET = 'secret';
  const sig = uploadSignature('projects', 1_700_000_000_000);
  assert.equal(sig.allowed_formats, ALLOWED_FORMATS);
  assert.ok(!/svg|pdf|html|js/.test(ALLOWED_FORMATS));
  const expected = signParams({ allowed_formats: ALLOWED_FORMATS, folder: sig.folder, timestamp: sig.timestamp }, 'secret');
  assert.equal(sig.signature, expected);
  assert.notEqual(signParams({ allowed_formats: 'svg', folder: sig.folder, timestamp: sig.timestamp }, 'secret'), sig.signature);
});

test('security headers are configured', async () => {
  const { default: config } = await import('../next.config.mjs');
  const [all] = await config.headers();
  const get = (k) => all.headers.find((h) => h.key === k)?.value || '';
  const csp = get('Content-Security-Policy');
  for (const part of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", 'https://res.cloudinary.com', 'https://api.cloudinary.com', 'https://www.youtube-nocookie.com']) {
    assert.ok(csp.includes(part), part);
  }
  assert.equal(get('X-Content-Type-Options'), 'nosniff');
  assert.equal(get('X-Frame-Options'), 'DENY');
  assert.ok(get('Permissions-Policy').includes('camera=()'));
});
