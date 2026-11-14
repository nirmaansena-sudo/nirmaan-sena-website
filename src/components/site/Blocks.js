import Link from 'next/link';
import { ArrowRight, WhatsApp } from './Icons';
import { whatsappLink } from '@/lib/site';

/** "(01) Title" section header with a hairline rule. */
export function SectionHead({ index, label, title, children, as: Tag = 'h2' }) {
  return (
    <div className="grid section-head" data-reveal="">
      <span className="label">
        {index ? `(${index}) ` : ''}
        {label}
      </span>
      {title ? <Tag className="display-2 section-title">{title}</Tag> : null}
      {children ? <div className="section-aside">{children}</div> : null}
    </div>
  );
}

/** Headline split into lines that slide up on load. */
export function RevealLines({ lines, className = 'display-1', as: Tag = 'h1' }) {
  return (
    <Tag className={className} data-reveal="lines">
      {lines.map((l, i) => (
        <span className="line" key={i}>
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function CtaBand({ title = 'Get a site audit and a line-item BOQ within 24 hours.', text }) {
  return (
    <section className="cta-band">
      <div className="container grid">
        <h2 className="display-2" data-reveal="">
          {title}
        </h2>
        <div className="cta-actions" data-reveal="" style={{ '--d': '120ms' }}>
          <p>{text || 'Tell us about your plot or space. A site engineer will call you back the same working day.'}</p>
          <Link href="/contact" className="btn">
            Start a project <ArrowRight />
          </Link>
          <a className="link-arrow" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsApp size={16} /> Or message us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function WhatsAppFloat() {
  return (
    <a className="wa-float" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with Nirmaan Sena on WhatsApp">
      <WhatsApp />
    </a>
  );
}
