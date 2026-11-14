'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoMark } from '@/components/site/Logo';

export default function AdminBar({ email, newEnquiries = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const isProjects = pathname === '/admin' || pathname.startsWith('/admin/projects');
  const isEnquiries = pathname.startsWith('/admin/enquiries');

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="adm-bar">
      <div className="adm-wrap">
        <Link href="/admin" className="adm-brand">
          <LogoMark />
          <span>
            NIRMAAN SENA <small>Dashboard</small>
          </span>
        </Link>
        <nav className="adm-nav" aria-label="Dashboard">
          <Link href="/admin" aria-current={isProjects ? 'page' : undefined}>
            Projects
          </Link>
          <Link href="/admin/highlights" aria-current={pathname.startsWith('/admin/highlights') ? 'page' : undefined}>
            Highlights
          </Link>
          <Link href="/admin/enquiries" aria-current={isEnquiries ? 'page' : undefined}>
            Enquiries {newEnquiries ? <span className="count">{newEnquiries}</span> : null}
          </Link>
        </nav>
        <div className="adm-bar-right">
          <a href="/" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
          <span className="hide-sm" title={email} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </span>
          <button type="button" onClick={logout} data-leave-admin>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
