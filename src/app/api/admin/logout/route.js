import { clearSessionCookieHeader } from '@/lib/auth';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookieHeader() });
}
