// Unit tests for the pure helpers. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

import { slugify, normalizeProject, normalizeEnquiry } from '../src/lib/validate.js';
import { imageUrl, imageSrcSet, videoPoster, youtubeId, isPortrait } from '../src/lib/media.js';
import { composeGallery } from '../src/lib/gallery.js';
import { signParams } from '../src/lib/cloudinary.js';
import { seedProjects } from '../src/lib/seed.js';

test('slugify', () => {
  assert.equal(slugify('Kids’ Suite, C-602 UDB Harmony'), 'kids-suite-c-602-udb-harmony');
  assert.equal(slugify('  Café — Mansarovar!! '), 'cafe-mansarovar');
});

test('normalizeProject requires a title and a cover to publish', () => {
  const { errors } = normalizeProject({ title: '', published: true });
  assert.ok(errors.title);
  assert.ok(errors.cover);
});

test('normalizeProject keeps whitelisted fields and falls back to first gallery image as cover', () => {
  const { data, errors } = normalizeProject({
    title: 'Sharma Residence',
    category: 'residential',
    area: '2,400',
    gallery: [{ type: 'image', url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg', width: 100, height: 80 }, { url: 'javascript:alert(1)' }],
    published: true,
    hacker: 'x',
  });
  assert.deepEqual(errors, {});
  assert.equal(data.slug, 'sharma-residence');
  assert.equal(data.area, 2400);
  assert.equal(data.gallery.length, 1);
  assert.equal(data.cover.url, data.gallery[0].url);
  assert.equal(data.hacker, undefined);
});

test('normalizeEnquiry normalises Indian numbers', () => {
  const ok = normalizeEnquiry({ name: 'Ravi', phone: '+91 98290 12345' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.data.phone, '9829012345');
  assert.equal(ok.data.whatsapp, '9829012345');
  const bad = normalizeEnquiry({ name: 'R', phone: '12345' });
  assert.ok(bad.errors.name && bad.errors.phone);
});

test('media URLs', () => {
  const c = 'https://res.cloudinary.com/demo/image/upload/v123/folder/a.jpg';
  assert.equal(imageUrl(c, 800), 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v123/folder/a.jpg');
  const g = 'https://lh3.googleusercontent.com/aida-public/ABC_def-123';
  assert.equal(imageUrl(g, 640), `${g}=w640`);
  assert.equal(imageUrl(`${g}=s0`, 640), `${g}=w640`);
  assert.equal(imageUrl('/media/2026-01/a.jpg', 640), '/media/2026-01/a.jpg');
  assert.equal(imageSrcSet('/media/a.jpg'), undefined);
  assert.match(imageSrcSet(c), /w_480.* 480w, .*w_2400.* 2400w$/);
  const v = { type: 'video', url: 'https://res.cloudinary.com/demo/video/upload/v1/clip.mp4' };
  assert.equal(videoPoster(v), 'https://res.cloudinary.com/demo/video/upload/so_0,f_jpg,q_auto,c_limit,w_1600/v1/clip.jpg');
  assert.equal(youtubeId('https://youtu.be/dQw4w9WgXcQ?t=3'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://example.com'), null);
});

test('composeGallery produces an editorial rhythm', () => {
  const L = (id) => ({ id, type: 'image', url: `u${id}`, width: 1600, height: 1000 });
  const P = (id) => ({ id, type: 'image', url: `u${id}`, width: 1000, height: 1400 });
  const rows = composeGallery([L(1), L(2), L(3), P(4), P(5), L(6), P(7), { id: 8, type: 'youtube', url: 'y' }, L(9)]);
  assert.deepEqual(
    rows.map((r) => r.kind),
    ['full', 'pair', 'pair', 'full', 'single', 'full', 'full']
  );
  const split = composeGallery([L(1), L(2), P(3), P(4), L(5)]);
  assert.deepEqual(split.map((r) => r.kind), ['full', 'split', 'split']);
  assert.equal(split[1].portraitIndex, 1);
  assert.equal(split[2].portraitIndex, 0);
  assert.ok(isPortrait(P(1)));
  // Every item appears exactly once, in order.
  assert.deepEqual(rows.flatMap((r) => r.items.map((i) => i.id)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(composeGallery([]), []);
});

test('Cloudinary signature matches the documented example', () => {
  const sig = signParams({ eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: 1315060510 }, 'abcd');
  assert.equal(sig, 'bfd09f95f331f558cbd1320e67aa8d488770583e');
});

test('session tokens sign, verify and expire', async () => {
  process.env.AUTH_SECRET = 'test-secret-that-is-long-enough';
  const { createSessionToken, verifySessionToken } = await import('../src/lib/auth.js');
  const t = createSessionToken('a@b.com', Date.UTC(2026, 0, 1));
  assert.equal(verifySessionToken(t, Date.UTC(2026, 0, 2)).e, 'a@b.com');
  assert.equal(verifySessionToken(t, Date.UTC(2026, 1, 1)), null);
  assert.equal(verifySessionToken(t.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a')), Date.UTC(2026, 0, 2)), null);
  assert.equal(verifySessionToken('garbage'), null);
});

test('seed data is valid', () => {
  for (const p of seedProjects()) {
    const { errors } = normalizeProject(p);
    assert.deepEqual(errors, {}, p.title);
    assert.ok(p.cover.width > 0);
  }
});

test('file store CRUD', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ns-store-'));
  process.env.DATA_DIR = dir;
  const { fileStore } = await import('../src/lib/store/file.js');
  const store = fileStore();
  assert.equal((await store.listProjects()).length, 5);
  const created = await store.createProject({ title: 'New', slug: 'new', published: true });
  const list = await store.listProjects();
  assert.equal(list[0].id, created.id, 'new projects go to the top');
  assert.ok(await store.slugTaken('new'));
  assert.ok(!(await store.slugTaken('new', created.id)));
  await store.updateProject(created.id, { title: 'Renamed' });
  assert.equal((await store.getProject(created.id)).title, 'Renamed');
  await store.reorderProjects(list.map((p) => p.id).reverse());
  assert.equal((await store.listProjects())[0].slug, list[list.length - 1].slug);
  assert.ok(await store.deleteProject(created.id));
  const e = await store.createEnquiry({ name: 'Ravi', phone: '9829012345' });
  assert.equal((await store.listEnquiries())[0].status, 'new');
  await store.updateEnquiry(e.id, { status: 'contacted' });
  assert.equal((await store.listEnquiries())[0].status, 'contacted');
  await Promise.all(Array.from({ length: 10 }, (_, i) => store.createEnquiry({ name: `N${i}`, phone: '9829012345' })));
  assert.equal((await store.listEnquiries()).length, 11, 'concurrent writes are not lost');
  await fs.rm(dir, { recursive: true, force: true });
});
