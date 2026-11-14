import crypto from 'node:crypto';

export const SESSION_COOKIE = 'ns_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const isProd = () => process.env.NODE_ENV === 'production';

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= (isProd() ? 32 : 16)) return s;
  if (!isProd()) return 'local-development-secret-not-for-production';
  return null;
}

/**
 * The signing key is derived from AUTH_SECRET *and* the admin credentials,
 * so changing ADMIN_PASSWORD (or ADMIN_EMAIL) signs everyone out immediately.
 */
function signingKey() {
  const s = secret();
  if (!s) return null;
  return crypto
    .createHmac('sha256', s)
    .update(`ns-session-v1\n${(process.env.ADMIN_EMAIL || '').trim().toLowerCase()}\n${process.env.ADMIN_PASSWORD || ''}`)
    .digest();
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload, key) {
  return crypto.createHmac('sha256', key).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Returns a human-readable reason why admin login can't work yet, or null when it's ready. */
export function authProblem() {
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASSWORD;
  if (!email || !pass) return 'Add ADMIN_EMAIL and ADMIN_PASSWORD to the environment settings.';
  if (!secret()) return 'Add AUTH_SECRET (at least 32 random characters) to the environment settings.';
  if (isProd() && pass.length < 12) return 'ADMIN_PASSWORD must be at least 12 characters on the live site.';
  return null;
}

export const authConfigured = () => authProblem() === null;

export function checkCredentials(email, password) {
  if (!authConfigured()) return false;
  const emailOk = safeEqual(String(email || '').trim().toLowerCase(), process.env.ADMIN_EMAIL.trim().toLowerCase());
  const passOk = safeEqual(String(password || ''), process.env.ADMIN_PASSWORD);
  return emailOk && passOk;
}

export function createSessionToken(email, now = Date.now()) {
  const key = signingKey();
  if (!key) throw new Error('AUTH_SECRET is not set');
  const payload = b64url(JSON.stringify({ e: email, iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + MAX_AGE }));
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token, now = Date.now()) {
  const key = signingKey();
  if (!key || !token || typeof token !== 'string' || token.length > 1000) return null;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return null;
  if (!safeEqual(sig, sign(payload, key))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Math.floor(now / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(token) {
  const secure = isProd() ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export function clearSessionCookieHeader() {
  const secure = isProd() ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) {
      try {
        return decodeURIComponent(part.slice(i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function sessionFromRequest(request) {
  return verifySessionToken(readCookie(request, SESSION_COOKIE));
}

/**
 * Blocks cross-site requests to state-changing endpoints.
 * Browsers send Origin on POST/PUT/PATCH/DELETE; Sec-Fetch-Site is checked as a second signal.
 */
export function isSameOrigin(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
