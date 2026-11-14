import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdminSession } from '@/lib/session';
import { authProblem } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await getAdminSession()) redirect('/admin');
  return <LoginForm problem={authProblem()} />;
}
