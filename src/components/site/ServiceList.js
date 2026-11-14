import Link from 'next/link';
import { ArrowRight } from './Icons';

/** Home page service tiles: three across on desktop, two on tablets, one on phones. */
export default function ServiceList({ services }) {
  return (
    <div className="svc-list">
      {services.map((s, i) => (
        <Link key={s.slug} href={`/services#${s.slug}`} className="svc-row" data-reveal="" style={{ '--d': `${i * 60}ms` }}>
          <span className="svc-num">{s.number}</span>
          <h3 className="svc-title">{s.title}</h3>
          <p className="svc-desc">{s.short}</p>
          <span className="svc-go" aria-hidden="true">
            <ArrowRight />
          </span>
        </Link>
      ))}
    </div>
  );
}
