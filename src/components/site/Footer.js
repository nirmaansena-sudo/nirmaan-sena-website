import Link from 'next/link';
import { Brand } from './Logo';
import { nav, services, site, whatsappLink } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid footer-cols">
          <div className="footer-brand">
            <Brand stacked />
            <p>
              Turnkey construction, architecture and interiors in Jaipur — run by engineers, built by verified trades.
            </p>
            <div>
              <Link href="/contact" className="link-arrow">
                Start a project
              </Link>
            </div>
          </div>
          <div className="footer-col footer-col-wide">
            <h3>Office</h3>
            <p>
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
            <p style={{ marginTop: 12 }}>{site.hours}</p>
          </div>
          <div className="footer-col">
            <h3>Contact</h3>
            <ul>
              <li>
                <a className="text-link" href={site.phoneHref}>
                  {site.phone}
                </a>
              </li>
              <li>
                <a className="text-link" href={`mailto:${site.email}`}>
                  Email us
                </a>
              </li>
              <li>
                <a className="text-link" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Services</h3>
            <ul>
              {services.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link className="text-link" href={`/services#${s.slug}`}>
                    {s.title.replace(/ \(.+\)$/, '').replace(' & Structural Design', '')}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="text-link" href="/services">
                  All services
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link className="text-link" href={n.href}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <svg className="footer-word" viewBox="0 0 1000 145" aria-hidden="true" focusable="false">
        <text x="0" y="112" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor" fontSize="150">
          Nirmaan Sena
        </text>
      </svg>

      <div className="container footer-bottom">
        <span>
          © {year} {site.legalName}
          {site.credentials?.cin ? ` · CIN ${site.credentials.cin}` : ''}
          {site.credentials?.gstin ? ` · GSTIN ${site.credentials.gstin}` : ''}
        </span>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
