'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/site/Logo';

export default function LoginForm({ problem }) {
  const configured = !problem;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not sign in.');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <LogoMark />
        <div>
          <h1>Nirmaan Sena dashboard</h1>
          <p className="hint" style={{ marginTop: 6 }}>
            Sign in to manage projects and enquiries.
          </p>
        </div>
        {!configured ? (
          <p className="notice" style={{ margin: 0 }}>
            Login isn’t set up yet: {problem} Then restart the site.
          </p>
        ) : null}
        {error ? <p className="login-error">{error}</p> : null}
        <div className="af">
          <label htmlFor="l-email">Email</label>
          <input id="l-email" className="in" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="af">
          <label htmlFor="l-pass">Password</label>
          <input
            id="l-pass"
            className="in"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="ab ab-primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
