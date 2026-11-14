import Link from 'next/link';
import Img from './Img';
import { ArrowUpRight } from './Icons';
import { categoryLabel } from '@/lib/site';
import { formatArea } from '@/lib/format';

/** A curated feature, independently selected in Admin → Highlights. */
export default function ProjectSpotlight({ project, label = 'Project in focus' }) {
  if (!project) return null;
  return (
    <section className="project-spotlight container" aria-label={label}>
      <Link href={`/projects/${project.slug}`} className="frame spotlight-image" data-reveal="mask" aria-label={`View ${project.title}`}>
        <Img src={project.cover?.url} alt={project.cover?.caption || project.title} sizes="(max-width: 800px) 100vw, 58vw" />
      </Link>
      <div className="spotlight-copy" data-reveal="">
        <span className="label">{label}</span>
        <span className="spotlight-category label">{categoryLabel(project.category)}</span>
        <h2 className="display-2"><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2>
        {project.summary ? <p>{project.summary}</p> : null}
        <span className="spotlight-facts">{[project.location || project.city, formatArea(project.area), project.duration].filter(Boolean).join(' · ')}</span>
        <Link href={`/projects/${project.slug}`} className="link-arrow">Discover the project <ArrowUpRight size={17} /></Link>
      </div>
    </section>
  );
}
