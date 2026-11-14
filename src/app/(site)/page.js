import Link from 'next/link';
import Img from '@/components/site/Img';
import CountUp from '@/components/site/CountUp';
import ProjectCard from '@/components/site/ProjectCard';
import ServiceList from '@/components/site/ServiceList';
import BrandMarquee from '@/components/site/BrandMarquee';
import { CtaBand, SectionHead } from '@/components/site/Blocks';
import { ProcessSection, StandardsSection } from '@/components/site/Sections';
import { ArrowRight, ArrowUpRight } from '@/components/site/Icons';
import { getProjectHighlights, getPublishedProjects } from '@/lib/projects';
import { categoryLabel, materialBrands, principles, services, site, stats } from '@/lib/site';

export const revalidate = 300;
export const metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const [projects, highlights] = await Promise.all([getPublishedProjects(), getProjectHighlights()]);
  const hero = highlights.homeHero[0];
  const featured = highlights.homeSelected;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'GeneralContractor', name: site.legalName,
    alternateName: site.name, url: site.url, telephone: site.phone.replace(/\s/g, ''), email: site.email,
    image: `${site.url}/og.png`,
    address: { '@type': 'PostalAddress', streetAddress: site.address.line1, addressLocality: 'Jaipur', addressRegion: 'Rajasthan', postalCode: '302012', addressCountry: 'IN' },
    areaServed: 'Jaipur', openingHours: 'Mo-Su 08:00-18:00',
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="home-hero">
        <div className="container">
          <div className="home-hero-top" data-reveal="fade">
            <span className="label">Architecture · Construction · Interiors</span>
            <span className="label home-location">Jaipur, Rajasthan <span aria-hidden="true">↗</span></span>
          </div>
          <div className="home-hero-heading">
            <h1 data-reveal="lines">
              <span className="line"><span>Considered spaces.</span></span>
              <span className="line"><span><em>Beautifully built.</em></span></span>
            </h1>
            <div className="home-hero-intro" data-reveal="" style={{ '--d': '160ms' }}>
              <p>From the first drawing to the final detail. Architecture, construction and interiors, brought together by one accountable team.</p>
              <Link className="link-arrow" href="/projects">Explore our work <ArrowUpRight size={17} /></Link>
            </div>
          </div>
          {hero ? (
            <figure className="home-hero-project">
              <Link className="frame home-hero-photo" href={`/projects/${hero.slug}`} aria-label={`Explore ${hero.title}`}>
                <Img src={hero.cover?.url} alt={hero.cover?.caption || hero.title} sizes="100vw" priority />
                <span className="home-photo-link" aria-hidden="true"><ArrowUpRight size={26} /></span>
              </Link>
              <figcaption className="home-hero-caption">
                <Link href={`/projects/${hero.slug}`} className="home-project-title">{hero.title} <ArrowUpRight size={15} /></Link>
                <span className="label">{categoryLabel(hero.category)} <span aria-hidden="true">/</span> {[hero.location, hero.city].filter(Boolean).join(', ')}</span>
              </figcaption>
            </figure>
          ) : null}
          <div className="home-signature"><span>Neev se nirmaan tak.</span><span className="label">From foundation to finish</span></div>
        </div>
      </section>

      <section className="stats-band" aria-label="Nirmaan Sena in numbers">
        <div className="container stats">
          {stats.map((s, i) => (
            <div className="stat" key={s.label} data-reveal="" style={{ '--d': `${i * 70}ms` }}>
              <span className="stat-value"><CountUp value={s.value} /></span><span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section home-philosophy">
        <div className="container grid statement">
          <span className="label" data-reveal="">01 / The Nirmaan Sena approach</span>
          <div className="statement-body">
            <h2 className="display-2" data-reveal="">Thoughtful design.<br /><em>Grounded in engineering.</em></h2>
            <p className="home-statement-copy" data-reveal="">A home to settle into. A café to return to. A workplace that works beautifully. We bring your vision to life with the care of a design studio and the precision of an engineering team.</p>
            <Link className="link-arrow" href="/about" data-reveal="">Meet Nirmaan Sena <ArrowUpRight size={17} /></Link>
            <ul className="statement-points">
              {principles.map((p, i) => (
                <li key={p.title} data-reveal="" style={{ '--d': `${i * 70}ms` }}><h3>{p.title}</h3><p>{p.body}</p></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {featured.length ? (
        <section className="section home-selected" id="selected-work">
          <div className="container">
            <SectionHead index="02" label="Selected work" title={<>Spaces with<br /><em>a story to tell.</em></>}>
              <p>Homes, cafés and workplaces. A selection of projects shaped around the people who use them.</p>
              <Link className="link-arrow" href="/projects">View all projects <sup>{String(projects.length).padStart(2, '0')}</sup> <ArrowUpRight size={17} /></Link>
            </SectionHead>
            <div className={`home-projects home-projects-${featured.length}`}>
              {featured.map((project, i) => <ProjectCard key={project.id} project={project} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" style={{ '--d': `${i * 90}ms` }} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section home-services">
        <div className="container">
          <SectionHead index="03" label="Our expertise" title={<>Every detail.<br /><em>One considered whole.</em></>}>
            <p>From a complete turnkey build to the specialist work that makes a space your own.</p>
            <Link className="link-arrow" href="/services">Discover our services <ArrowRight size={17} /></Link>
          </SectionHead>
          <ServiceList services={services} />
        </div>
      </section>
      <ProcessSection index="04" />
      <StandardsSection index="05" />
      <section className="section-tight home-materials">
        <div className="container">
          <p className="label">A considered palette. A trusted foundation.</p>
          <p className="home-materials-note">Materials we procure and install</p>
          <BrandMarquee brands={materialBrands} />
        </div>
      </section>
      <CtaBand title={<>Your next chapter,<br /><em>beautifully built.</em></>} text="Tell us what you have in mind. We’ll start with a conversation, a site visit and a clear plan for the way forward." />
    </>
  );
}
