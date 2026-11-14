import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { emptyHighlights, initialHighlights, normalizeHighlights, resolveHighlights } from '../src/lib/highlights.js';
import { fileStore } from '../src/lib/store/file.js';

const projects = [
  { id: 'first', published: true, featured: false },
  { id: 'second', published: true, featured: true },
  { id: 'draft', published: false, featured: true },
  { id: 'third', published: true, featured: false },
  { id: 'fourth', published: true, featured: true },
];

test('first-use highlights retain the old home featured ordering and exclude drafts', () => {
  const settings = initialHighlights(projects, null);
  assert.deepEqual(settings.homeHero, ['second']);
  assert.deepEqual(settings.homeSelected, ['fourth', 'first', 'third']);
  assert.ok(!Object.values(settings).flat().includes('draft'));
  assert.deepEqual(initialHighlights([], null), emptyHighlights());
  assert.deepEqual(initialHighlights([projects[0]], null).homeSelected, ['first']);
});

test('explicit placement order is independent and empty areas never fall back', () => {
  const settings = { ...emptyHighlights(), homeHero: ['third'], homeSelected: ['first', 'second'], aboutSpotlight: ['second'] };
  const resolved = resolveHighlights(projects, settings);
  assert.equal(resolved.homeHero[0].id, 'third');
  assert.deepEqual(resolved.homeSelected.map((project) => project.id), ['first', 'second']);
  assert.deepEqual(resolved.projectsSpotlight, []);
  assert.deepEqual(resolved.servicesSpotlight, []);
  assert.deepEqual(resolveHighlights(projects, emptyHighlights()), emptyHighlights());
  assert.equal(resolveHighlights([...projects].reverse(), settings).homeHero[0].id, 'third');
});

test('drafts, deleted projects and repeated IDs are filtered when reading stored highlights', () => {
  const settings = { ...emptyHighlights(), homeHero: ['draft'], homeSelected: ['first', 'deleted', 'first'], aboutSpotlight: ['deleted'] };
  const resolved = resolveHighlights(projects, settings);
  assert.deepEqual(resolved.homeHero, []);
  assert.deepEqual(resolved.aboutSpotlight, []);
  assert.deepEqual(resolved.homeSelected.map((project) => project.id), ['first']);
});

test('highlight validation rejects malformed, oversized, missing, duplicate and unpublished selections', () => {
  for (const input of [null, [], 'x']) assert.ok(normalizeHighlights(input, projects).errors.settings);
  assert.ok(normalizeHighlights({}, projects).errors.homeHero);
  assert.ok(normalizeHighlights({ ...emptyHighlights(), arbitrary: [] }, projects).errors.settings);
  assert.ok(normalizeHighlights({ ...emptyHighlights(), homeHero: ['first', 'second'] }, projects).errors.homeHero);
  assert.ok(normalizeHighlights({ ...emptyHighlights(), homeSelected: ['first', 'first'] }, projects).errors.homeSelected);
  for (const id of ['draft', 'deleted', 42, {}]) {
    assert.ok(normalizeHighlights({ ...emptyHighlights(), homeHero: [id] }, projects).errors.homeHero);
  }
  const valid = { ...emptyHighlights(), homeHero: ['first'], homeSelected: ['second', 'third'], aboutSpotlight: ['first'] };
  assert.deepEqual(normalizeHighlights(valid, projects), { data: valid, errors: {} });
  assert.deepEqual(normalizeHighlights(emptyHighlights(), []), { data: emptyHighlights(), errors: {} });
});

test('file-store highlights survive reloads and other writes; unpublish/delete cannot leak to public placements', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ns-highlights-'));
  const previousDataDir = process.env.DATA_DIR;
  process.env.DATA_DIR = directory;
  try {
    const store = fileStore();
    assert.equal(await store.getHighlights(), null);
    const all = await store.listProjects();
    const first = all[0];
    const second = all[1];
    const settings = { ...emptyHighlights(), homeHero: [first.id], homeSelected: [second.id, first.id] };
    await Promise.all([store.saveHighlights(settings), store.createEnquiry({ name: 'QA' })]);
    assert.deepEqual(await fileStore().getHighlights(), settings);
    assert.equal((await store.listEnquiries()).length, 1);
    await store.reorderProjects(all.map((project) => project.id).reverse());
    assert.deepEqual(await store.getHighlights(), settings);
    await store.updateProject(first.id, { published: false });
    assert.deepEqual(resolveHighlights(await store.listProjects({ includeDrafts: true }), await store.getHighlights()).homeHero, []);
    await store.deleteProject(second.id);
    assert.deepEqual(resolveHighlights(await store.listProjects(), await store.getHighlights()).homeSelected, []);
    await store.updateProject(first.id, { published: true });
    const republished = resolveHighlights(await store.listProjects(), await store.getHighlights());
    assert.equal(republished.homeHero[0].id, first.id, 'republishing restores its saved placement');
    assert.deepEqual(republished.homeSelected.map((project) => project.id), [first.id], 'deleted selections remain hidden');
    await store.saveHighlights(emptyHighlights());
    assert.deepEqual(await fileStore().getHighlights(), emptyHighlights());
    assert.deepEqual(resolveHighlights(await store.listProjects(), await store.getHighlights()), emptyHighlights());
  } finally {
    if (previousDataDir === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previousDataDir;
    await fs.rm(directory, { recursive: true, force: true });
  }
});
