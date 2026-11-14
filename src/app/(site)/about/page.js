import ProjectSpotlight from '@/components/site/ProjectSpotlight';
import { CtaBand, RevealLines, SectionHead } from '@/components/site/Blocks';
import { ProcessSection, StandardsSection } from '@/components/site/Sections';
import { getProjectHighlights } from '@/lib/projects';
import { principles, site } from '@/lib/site';

export const revalidate = 300;

export const metadata = {
  title: 'About',
  description: 'Nirmaan Sena is an engineering-led construction company in Jaipur: fixed line-item pricing, milestone payments and verified trades.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const highlights = await getProjectHighlights();

  const facts = [
    ['Registered name', site.legalName],
    ['Office', `${site.address.line1}, ${site.address.line2}`],
    ['Working hours', site.hours],
    ['Phone', site.phone],
    ['Email', site.email],
    ['Service area', 'Jaipur, Rajasthan'],
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container grid">
          <span className="label" data-reveal="fade">
            About
          </span>
          <RevealLines lines={['Built by', 'engineers.']} />
          <p className="lead" data-reveal="" style={{ '--d': '300ms' }}>
            Nirmaan Sena — “an army of builders” — brings architects, site engineers, verified tradespeople and building materials together under
            one roof in Jaipur.
          </p>
        </div>
      </section>

      <ProjectSpotlight project={highlights.aboutSpotlight[0]} label="Our approach, in practice" />

      <section className="section">
        <div className="container grid statement">
          <span className="label" data-reveal="">
            (01) Why we exist
          </span>
          <div className="statement-body">
            <p className="display-3" data-reveal="">
              Most construction disputes start in the same three places: vague quotes, money paid ahead of work, and nobody checking quality on site.{' '}
              <em>Our process is built to remove all three.</em>
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead index="02" label="Principles" title="How we hold ourselves accountable." />
          <div className="principles">
            {principles.map((p, i) => (
              <div className="principle" key={p.title} data-reveal="" style={{ '--d': `${i * 100}ms` }}>
                <span className="label">0{i + 1}</span>
                <h3 className="h4">{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection index="03" />
      <StandardsSection index="04" withLink={false} />

      <section className="section">
        <div className="container grid">
          <div className="story-aside" data-reveal="">
            <span className="label">(05) Company</span>
          </div>
          <dl className="facts" data-reveal="">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
