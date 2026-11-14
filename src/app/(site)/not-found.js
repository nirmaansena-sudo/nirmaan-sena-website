import Link from 'next/link';
import { ArrowRight } from '@/components/site/Icons';

export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="label">Error 404</span>
      <h1 className="display-1">This page isn’t here.</h1>
      <p className="lead">The page may have moved, or the project may no longer be published.</p>
      <div className="hero-actions">
        <Link className="btn" href="/projects">
          See all projects <ArrowRight />
        </Link>
        <Link className="link-arrow" href="/">
          Back to home <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
