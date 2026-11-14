import Link from 'next/link';
import { CtaBand, RevealLines } from '@/components/site/Blocks';
import { ProcessSection } from '@/components/site/Sections';
import { ArrowRight } from '@/components/site/Icons';
import { services } from '@/lib/site';
import { getProjectHighlights } from '@/lib/projects';
import ProjectSpotlight from '@/components/site/ProjectSpotlight';

export const revalidate = 300;

export const metadata = {
  title: 'Services',
  description:
    'Turnkey construction, architecture and structural design, interiors, project management, labour and building materials in Jaipur.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const highlights = await getProjectHighlights();
  return (
    <>
      <section className="page-hero">
        <div className="container grid">
          <span className="label" data-reveal="fade">
            Services — 06
          </span>
          <RevealLines lines={['Services for', 'every stage.']} />
          <p className="lead" data-reveal="" style={{ '--d': '300ms' }}>
            Hire us for a complete turnkey build, or for the one part you need — drawings, supervision, a crew or materials.
          </p>
        </div>
      </section>

      <div className="container">
        <nav className="svc-index" aria-label="Services" data-reveal="">
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`}>
              <span>{s.number}</span>
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 'clamp(40px, 5vw, 72px)' }}>
        <div className="container">
          {services.map((s) => (
            <div id={s.slug} className="grid svc-detail" key={s.slug}>
              <span className="svc-num" data-reveal="">
                {s.number}
              </span>
              <div className="svc-detail-head" data-reveal="">
                <h2 className="display-3">{s.title}</h2>
                <p className="body-lg">{s.body}</p>
              </div>
              <div className="svc-detail-body" data-reveal="" style={{ '--d': '120ms' }}>
                <ul className="svc-includes">
                  {s.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <p className="svc-for">
                  <strong>Suited to</strong>
                  {s.forWhom}
                </p>
                <div>
                  <Link className="link-arrow" href={`/contact?service=${s.slug}`}>
                    Enquire about this service <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProjectSpotlight project={highlights.servicesSpotlight[0]} label="From expertise to experience" />
      <ProcessSection index="07" />
      <CtaBand />
    </>
  );
}
