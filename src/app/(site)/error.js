'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { site, whatsappLink } from '@/lib/site';

// Shown if a page fails to load (for example, the database is unreachable).
export default function SiteError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container not-found">
      <span className="label">Something went wrong</span>
      <h1 className="display-2">This page didn’t load properly.</h1>
      <p className="lead">
        Please try again in a moment. If you were trying to reach us, call {site.phone} or message us on WhatsApp.
      </p>
      <div className="hero-actions">
        <button type="button" className="btn" onClick={() => reset()}>
          Try again
        </button>
        <a className="link-arrow" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          WhatsApp us
        </a>
        <Link className="link-arrow" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
