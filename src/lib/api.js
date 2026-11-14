import { isSameOrigin, sessionFromRequest } from './auth.js';

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export const errorJson = (message, status = 400, extra = {}) => json({ ok: false, error: message, ...extra }, status);

const httpError = (message, status) => Object.assign(new Error(message), { status });

/** Returns an error Response if the request is not from a signed-in admin, otherwise null. */
export function requireAdmin(request, { mutating = false } = {}) {
  if (mutating && !isSameOrigin(request)) return errorJson('Request blocked.', 403);
  if (!sessionFromRequest(request)) return errorJson('Please sign in again.', 401);
  return null;
}

/**
 * Reads a JSON body. Only `application/json` is accepted, which also stops
 * cross-site HTML forms (they can't send that content type without CORS).
 */
export async function readJson(request, limit = 1_000_000) {
  const type = (request.headers.get('content-type') || '').toLowerCase();
  if (!type.startsWith('application/json')) throw httpError('Unsupported request.', 415);
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > limit) throw httpError('Request is too large.', 413);
  const text = await request.text();
  if (text.length > limit) throw httpError('Request is too large.', 413);
  try {
    const value = text ? JSON.parse(text) : {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object');
    return value;
  } catch {
    throw httpError('Invalid request.', 400);
  }
}

/** Wraps a route handler so unexpected errors become clean JSON responses. */
export function handle(fn) {
  return async (request, ctx) => {
    try {
      return await fn(request, ctx);
    } catch (err) {
      const status = err?.status || 500;
      if (status >= 500) console.error('[api]', err);
      return errorJson(status >= 500 ? err?.publicMessage || 'Something went wrong. Please try again.' : err.message, status);
    }
  };
}

// Small in-memory rate limiter. It works per server instance, so on serverless
// hosting it slows attackers down rather than stopping them completely.
const buckets = new Map();
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Client IP as reported by the hosting proxy (Vercel and most proxies set x-real-ip). */
export function clientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'local'
  ).slice(0, 64);
}
