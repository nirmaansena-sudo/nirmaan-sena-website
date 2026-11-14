import { authProblem, checkCredentials, createSessionToken, isSameOrigin, sessionCookieHeader } from '@/lib/auth';
import { clientIp, errorJson, handle, json, rateLimit, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  if (!isSameOrigin(request)) return errorJson('Request blocked.', 403);
  const problem = authProblem();
  if (problem) return errorJson(`Admin login is not set up. ${problem}`, 503);
  if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return errorJson('Too many attempts. Try again in 15 minutes.', 429);
  }
  const { email, password } = await readJson(request, 5_000);
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 400));
    return errorJson('Email or password is incorrect.', 401);
  }
  const token = createSessionToken(String(email).trim().toLowerCase());
  return json({ ok: true }, 200, { 'set-cookie': sessionCookieHeader(token) });
});
