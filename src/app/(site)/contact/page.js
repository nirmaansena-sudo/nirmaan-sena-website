import EnquiryForm from '@/components/site/EnquiryForm';
import { RevealLines } from '@/components/site/Blocks';
import { ArrowUpRight } from '@/components/site/Icons';
import { site, whatsappLink } from '@/lib/site';

export const metadata = {
  title: 'Contact',
  description: `Start a project with Nirmaan Sena. Call ${site.phone}, message us on WhatsApp, or request a site visit in Jaipur.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container grid">
          <span className="label" data-reveal="fade">
            Contact
          </span>
          <RevealLines lines={['Tell us about', 'your project.']} />
          <p className="lead" data-reveal="" style={{ '--d': '300ms' }}>
            Share a few details and a site engineer will call you back the same working day. Prefer to talk now? Call or WhatsApp us.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid contact-grid">
          <aside className="contact-info" data-reveal="">
            <div className="contact-block">
              <span className="label">Call</span>
              <a className="contact-big text-link" href={site.phoneHref}>
                {site.phone}
              </a>
            </div>
            <div className="contact-block">
              <span className="label">WhatsApp</span>
              <a className="link-arrow" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp <ArrowUpRight />
              </a>
            </div>
            <div className="contact-block">
              <span className="label">Email</span>
              <a className="text-link" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
            <div className="contact-block">
              <span className="label">Office</span>
              <p>
                {site.address.line1}
                <br />
                {site.address.line2}
              </p>
              <p className="muted" style={{ marginTop: 6, fontSize: '0.9375rem' }}>
                {site.hours}
              </p>
            </div>
            <iframe
              className="map-frame"
              title="Nirmaan Sena office on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&output=embed`}
            />
          </aside>
          <div className="contact-form-wrap" data-reveal="" style={{ '--d': '120ms' }}>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
