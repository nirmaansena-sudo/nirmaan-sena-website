import Link from 'next/link';
import { notFound } from 'next/navigation';
import Img from '@/components/site/Img';
import Parallax from '@/components/site/Parallax';
import AutoVideo from '@/components/site/AutoVideo';
import Gallery from '@/components/site/Gallery';
import YouTube from '@/components/site/YouTube';
import { RevealLines, SectionHead } from '@/components/site/Blocks';
import { ArrowRight } from '@/components/site/Icons';
import { getNextProject, getPublishedProject, getPublishedProjects } from '@/lib/projects';
import { categoryLabel } from '@/lib/site';
import { formatArea } from '@/lib/format';
import { imageUrl } from '@/lib/media';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return { title: 'Project not found' };
  const description = project.seoDescription || project.summary;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      images: project.cover?.url ? [{ url: imageUrl(project.cover.url, 1200) }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  const next = await getNextProject(slug);

  const status = project.status === 'ongoing' ? 'Under construction' : project.year ? `Completed ${project.year}` : 'Completed';
  const facts = [
    ['Location', [project.location, project.city].filter(Boolean).join(', ')],
    ['Typology', categoryLabel(project.category)],
    ['Area', formatArea(project.area)],
    ['Timeline', project.duration],
    ['Status', status],
    ['Client', project.client],
  ].filter(([, v]) => v);

  const paragraphs = String(project.description || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const heroVideo = project.heroVideo?.type === 'video' ? project.heroVideo : null;
  const walkthrough = project.heroVideo?.type === 'youtube' ? project.heroVideo : null;
  const gallery = project.gallery || [];
  let idx = 1;
  const nextIndex = () => String(++idx).padStart(2, '0');

  return (
    <article>
      <header className="project-head">
        <div className="container grid">
          <nav className="breadcrumbs label" aria-label="Breadcrumb" data-reveal="fade">
            <Link href="/projects" className="text-link">
              Projects
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={`/projects?type=${project.category}`} className="text-link">
              {categoryLabel(project.category)}
            </Link>
          </nav>
          <RevealLines lines={[project.title]} />
          {project.summary ? (
            <p className="lead" data-reveal="" style={{ '--d': '250ms' }}>
              {project.summary}
            </p>
          ) : null}
        </div>
      </header>

      <div className="project-hero" data-reveal="mask">
        <Parallax strength={0.1}>
          {heroVideo ? (
            <AutoVideo item={{ ...heroVideo, poster: heroVideo.poster || project.cover?.url }} label={project.title} />
          ) : (
            <Img src={project.cover?.url} alt={project.cover?.caption || project.title} sizes="100vw" priority />
          )}
        </Parallax>
      </div>

      <div className="container">
        <dl className="titleblock" style={{ '--cols': facts.length }} data-reveal="">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {paragraphs.length || project.scope?.length ? (
        <section className="section">
          <div className="container grid story">
            <div className="story-aside">
              <div className="sticky">
                <span className="label">(01) Overview</span>
              </div>
            </div>
            <div className="story-body">
              <div className="prose" data-reveal="">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {project.scope?.length ? (
                <div className="tags" data-reveal="" style={{ '--d': '120ms' }}>
                  {project.scope.map((s) => (
                    <span className="tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {gallery.length ? (
        <section className="section" style={{ paddingTop: paragraphs.length ? 0 : undefined }}>
          <div className="container">
            <SectionHead index={nextIndex()} label={`Gallery — ${String(gallery.length).padStart(2, '0')} frames`} />
            <Gallery items={gallery} title={project.title} />
          </div>
        </section>
      ) : null}

      {walkthrough ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHead index={nextIndex()} label="Walkthrough" />
            <div data-reveal="">
              <YouTube url={walkthrough.url} title={`${project.title} — walkthrough`} />
            </div>
          </div>
        </section>
      ) : null}

      {project.specs?.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container grid">
            <div className="story-aside" data-reveal="">
              <span className="label">({nextIndex()}) Specifications</span>
            </div>
            <dl className="specs-table" data-reveal="">
              {project.specs.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {next && next.slug !== project.slug ? (
        <Link href={`/projects/${next.slug}`} className="next-project">
          <div className="frame">
            <Img src={next.cover?.url} alt="" sizes="100vw" />
          </div>
          <div className="container next-project-inner">
            <span className="label">Next project — {categoryLabel(next.category)}</span>
            <div className="next-project-title">
              <h2 className="display-1">{next.title}</h2>
              <span className="go" aria-hidden="true">
                <ArrowRight size={22} />
              </span>
            </div>
          </div>
        </Link>
      ) : null}
    </article>
  );
}
