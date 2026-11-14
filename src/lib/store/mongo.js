// MongoDB store (production). Uses MONGODB_URI and MONGODB_DB.

import crypto from 'node:crypto';
import { MongoClient } from 'mongodb';
import { seedProjects } from '../seed.js';

const g = globalThis;

function getDb() {
  if (!g.__nsMongoDb) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    g.__nsMongoDb = client
      .connect()
      .then(async (c) => {
        const db = c.db(process.env.MONGODB_DB || 'nirmaansena');
        await Promise.all([
          db.collection('projects').createIndex({ slug: 1 }, { unique: true }),
          db.collection('projects').createIndex({ published: 1, order: 1 }),
          db.collection('enquiries').createIndex({ createdAt: -1 }),
        ]).catch((err) => console.warn('[mongo] index setup skipped:', err.message));
        return db;
      })
      .catch((err) => {
        g.__nsMongoDb = null;
        throw err;
      });
  }
  return g.__nsMongoDb;
}

const out = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
};

const now = () => new Date().toISOString();

export function mongoStore() {
  const col = async (name) => (await getDb()).collection(name);

  return {
    kind: 'mongo',

    async getHighlights() {
      const settings = await (await col('settings')).findOne({ _id: 'project-highlights' });
      return settings?.placements ?? null;
    },
    async saveHighlights(settings) {
      await (await col('settings')).updateOne(
        { _id: 'project-highlights' },
        { $set: { placements: settings, updatedAt: now() } },
        { upsert: true }
      );
      return settings;
    },

    async listProjects({ includeDrafts = false } = {}) {
      const c = await col('projects');
      const docs = await c.find(includeDrafts ? {} : { published: true }).sort({ order: 1, createdAt: -1 }).toArray();
      return docs.map(out);
    },
    async getProject(id) {
      return out(await (await col('projects')).findOne({ _id: id }));
    },
    async getProjectBySlug(slug) {
      return out(await (await col('projects')).findOne({ slug }));
    },
    async slugTaken(slug, exceptId) {
      const doc = await (await col('projects')).findOne({ slug, _id: { $ne: exceptId || '' } }, { projection: { _id: 1 } });
      return Boolean(doc);
    },
    async createProject(data) {
      const c = await col('projects');
      const first = await c.find({}, { projection: { order: 1 } }).sort({ order: 1 }).limit(1).toArray();
      const order = Math.min(0, first[0]?.order ?? 0) - 1;
      const doc = { ...data, _id: crypto.randomUUID(), order, createdAt: now(), updatedAt: now() };
      await c.insertOne(doc);
      return out(doc);
    },
    async updateProject(id, data) {
      const c = await col('projects');
      const { id: _ignore, _id, ...rest } = data;
      const res = await c.updateOne({ _id: id }, { $set: { ...rest, updatedAt: now() } });
      if (!res.matchedCount) return null;
      return out(await c.findOne({ _id: id }));
    },
    async deleteProject(id) {
      const res = await (await col('projects')).deleteOne({ _id: id });
      return res.deletedCount > 0;
    },
    async reorderProjects(ids) {
      if (!ids.length) return true;
      await (await col('projects')).bulkWrite(
        ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } }))
      );
      return true;
    },
    async countProjects() {
      return (await col('projects')).countDocuments();
    },
    async importSeed() {
      const c = await col('projects');
      const existing = new Set((await c.find({}, { projection: { slug: 1 } }).toArray()).map((d) => d.slug));
      const add = seedProjects()
        .filter((p) => !existing.has(p.slug))
        .map(({ id, ...p }) => ({ ...p, _id: id }));
      if (add.length) await c.insertMany(add);
      return add.length;
    },

    async createEnquiry(data) {
      const doc = { ...data, _id: crypto.randomUUID(), status: 'new', note: '', createdAt: now(), updatedAt: now() };
      await (await col('enquiries')).insertOne(doc);
      return out(doc);
    },
    async listEnquiries() {
      const docs = await (await col('enquiries')).find({}).sort({ createdAt: -1 }).limit(500).toArray();
      return docs.map(out);
    },
    async updateEnquiry(id, patch) {
      const c = await col('enquiries');
      await c.updateOne({ _id: id }, { $set: { ...patch, updatedAt: now() } });
      return out(await c.findOne({ _id: id }));
    },
    async deleteEnquiry(id) {
      const res = await (await col('enquiries')).deleteOne({ _id: id });
      return res.deletedCount > 0;
    },
  };
}
