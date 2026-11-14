// JSON-file store for local development (no database needed).
// Data lives in ./.data/store.json. Not for production on serverless hosts.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { seedProjects } from '../seed.js';

export function dataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), '.data');
}

const sortProjects = (a, b) => (a.order ?? 0) - (b.order ?? 0) || String(b.createdAt).localeCompare(String(a.createdAt));

export function fileStore() {
  const file = path.join(dataDir(), 'store.json');
  let queue = Promise.resolve();

  async function load() {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return { projects: seedProjects(), enquiries: [] };
      throw err;
    }
  }

  async function save(db) {
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(db, null, 2));
      await fs.rename(tmp, file);
    } catch (err) {
      const e = new Error('This server cannot save files. Add MONGODB_URI to store data in MongoDB.');
      e.status = 503;
      e.publicMessage = e.message;
      e.cause = err;
      throw e;
    }
  }

  // Serialise writes so concurrent requests don't overwrite each other.
  function mutate(fn) {
    const run = queue.then(async () => {
      const db = await load();
      const result = await fn(db);
      await save(db);
      return result;
    });
    queue = run.catch(() => {});
    return run;
  }

  const now = () => new Date().toISOString();

  return {
    kind: 'file',

    async getHighlights() {
      return (await load()).highlights ?? null;
    },
    saveHighlights(settings) {
      return mutate((db) => {
        db.highlights = settings;
        return settings;
      });
    },

    async listProjects({ includeDrafts = false } = {}) {
      const db = await load();
      return db.projects.filter((p) => includeDrafts || p.published).sort(sortProjects);
    },
    async getProject(id) {
      return (await load()).projects.find((p) => p.id === id) || null;
    },
    async getProjectBySlug(slug) {
      return (await load()).projects.find((p) => p.slug === slug) || null;
    },
    async slugTaken(slug, exceptId) {
      return (await load()).projects.some((p) => p.slug === slug && p.id !== exceptId);
    },
    createProject(data) {
      return mutate((db) => {
        const minOrder = db.projects.reduce((m, p) => Math.min(m, p.order ?? 0), 0);
        const project = { ...data, id: crypto.randomUUID(), order: minOrder - 1, createdAt: now(), updatedAt: now() };
        db.projects.push(project);
        return project;
      });
    },
    updateProject(id, data) {
      return mutate((db) => {
        const i = db.projects.findIndex((p) => p.id === id);
        if (i < 0) return null;
        db.projects[i] = { ...db.projects[i], ...data, id, updatedAt: now() };
        return db.projects[i];
      });
    },
    deleteProject(id) {
      return mutate((db) => {
        const before = db.projects.length;
        db.projects = db.projects.filter((p) => p.id !== id);
        return db.projects.length < before;
      });
    },
    reorderProjects(ids) {
      return mutate((db) => {
        ids.forEach((id, index) => {
          const p = db.projects.find((x) => x.id === id);
          if (p) p.order = index;
        });
        return true;
      });
    },
    async countProjects() {
      return (await load()).projects.length;
    },
    importSeed() {
      return mutate((db) => {
        const existing = new Set(db.projects.map((p) => p.slug));
        const add = seedProjects().filter((p) => !existing.has(p.slug));
        db.projects.push(...add);
        return add.length;
      });
    },

    createEnquiry(data) {
      return mutate((db) => {
        const enquiry = { ...data, id: crypto.randomUUID(), status: 'new', note: '', createdAt: now(), updatedAt: now() };
        db.enquiries.unshift(enquiry);
        return enquiry;
      });
    },
    async listEnquiries() {
      const db = await load();
      return [...db.enquiries].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    updateEnquiry(id, patch) {
      return mutate((db) => {
        const e = db.enquiries.find((x) => x.id === id);
        if (!e) return null;
        Object.assign(e, patch, { updatedAt: now() });
        return e;
      });
    },
    deleteEnquiry(id) {
      return mutate((db) => {
        const before = db.enquiries.length;
        db.enquiries = db.enquiries.filter((x) => x.id !== id);
        return db.enquiries.length < before;
      });
    },
  };
}
