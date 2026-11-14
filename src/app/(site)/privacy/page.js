import { site } from '@/lib/site';

export const metadata = { title: 'Privacy', robots: { index: true } };

// Plain-language starting point. Have it reviewed before relying on it.
export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container grid">
        <div className="legal">
          <span className="label">Legal</span>
          <h1 className="display-2" style={{ margin: '16px 0 32px' }}>
            Privacy policy
          </h1>
          <p>
            This policy explains what {site.legalName} (“Nirmaan Sena”, “we”) collects through this website and how it is used.
          </p>
          <h2>What we collect</h2>
          <ul>
            <li>Details you submit in the enquiry form: name, phone and WhatsApp number, email, area, project details and message.</li>
            <li>Basic technical data your browser sends, such as IP address and device type, used for security and to keep the site working.</li>
          </ul>
          <h2>How we use it</h2>
          <ul>
            <li>To call or message you about your enquiry, arrange a site visit and send quotations.</li>
            <li>To keep records of the work we carry out for you.</li>
          </ul>
          <p>We do not sell your personal information.</p>
          <h2>Sharing</h2>
          <p>
            Your details are shared only with our own staff and the service providers we use to run this website, store data and send messages, and only
            as far as needed for those purposes.
          </p>
          <h2>Your choices</h2>
          <p>
            You can ask us to correct or delete your details at any time by writing to <a className="text-link" href={`mailto:${site.email}`}>{site.email}</a>{' '}
            or calling {site.phone}.
          </p>
        </div>
      </div>
    </section>
  );
}
