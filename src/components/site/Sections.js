import Link from 'next/link';
import { SectionHead } from './Blocks';
import { ArrowRight, Check } from './Icons';
import { processSteps, standards } from '@/lib/site';

export function ProcessSection({ index = '04' }) {
  return (
    <section className="section" id="process">
      <div className="container">
        <SectionHead index={index} label="How we work" title="Three steps. No surprises." />
        <div className="process-grid">
          {processSteps.map((s, i) => (
            <div className="process-step" key={s.number} data-reveal="" style={{ '--d': `${i * 160}ms` }}>
              <div className="process-num">{s.number}</div>
              <span className="label">{s.time}</span>
              <h3 className="display-3">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StandardsSection({ index = '05', withLink = true }) {
  return (
    <section className="section bg-stone" id="standards">
      <div className="container grid standards">
        <div className="standards-intro" data-reveal="">
          <span className="label">
            ({index}) Quality
          </span>
          <h2 className="display-2">What we check on every site.</h2>
          <p className="lead">
            Work follows IS 456 and sound site practice. Each check is logged with photos and shared with you on WhatsApp the same day.
          </p>
          {withLink ? (
            <Link className="link-arrow" href="/contact">
              Talk to a site engineer <ArrowRight />
            </Link>
          ) : null}
        </div>
        <ul className="standards-list">
          {standards.map((s, i) => (
            <li key={s.title} data-reveal="" style={{ '--d': `${(i % 2) * 100}ms` }}>
              <span className="tick">
                <Check />
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
