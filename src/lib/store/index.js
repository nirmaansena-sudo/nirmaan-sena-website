import { fileStore } from './file.js';

let instance = null;

/** Returns the active data store: MongoDB when MONGODB_URI is set, otherwise the local file store. */
export async function getStore() {
  if (instance) return instance;
  if (process.env.MONGODB_URI) {
    const { mongoStore } = await import('./mongo.js');
    instance = mongoStore();
  } else {
    instance = fileStore();
  }
  return instance;
}

export const storeKind = () => (process.env.MONGODB_URI ? 'mongo' : 'file');
