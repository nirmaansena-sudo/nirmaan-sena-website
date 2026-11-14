import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from './auth';

export async function getAdminSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Use at the top of dashboard pages: sends signed-out visitors to the login page. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
