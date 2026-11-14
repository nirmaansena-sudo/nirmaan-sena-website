import { site } from '@/lib/site';

export const metadata = { title: 'Terms', robots: { index: true } };

// Plain-language starting point. Have it reviewed before relying on it.
export default function TermsPage() {
  return (
    <section className="section">
      <div className="container grid">
        <div className="legal">
          <span className="label">Legal</span>
          <h1 className="display-2" style={{ margin: '16px 0 32px' }}>
            Terms of use
          </h1>
          <p>By using this website you agree to these terms.</p>
          <h2>Information on this site</h2>
          <p>
            Project photographs, descriptions and figures are provided for general information. Prices, timelines and specifications for your project
            are set only in a written quotation (BOQ) and agreement signed by both parties.
          </p>
          <h2>Enquiries</h2>
          <p>Submitting an enquiry does not create a contract. We will contact you to understand your requirement and visit the site where needed.</p>
          <h2>Content</h2>
          <p>All text, photographs and designs on this site belong to {site.legalName} or are used with permission, and may not be reused without consent.</p>
          <h2>Contact</h2>
          <p>
            Questions about these terms: <a className="text-link" href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
