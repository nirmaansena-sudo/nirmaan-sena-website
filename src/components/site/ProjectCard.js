import Link from 'next/link';
import Img from './Img';
import { ArrowUpRight } from './Icons';
import { categoryLabel } from '@/lib/site';
import { formatArea } from '@/lib/format';

export default function ProjectCard({ project, sizes = '(max-width: 800px) 100vw, 50vw', priority = false, style, reveal = true }) {
  const facts = [formatArea(project.area), project.duration].filter(Boolean).join(' · ');
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="pcard"
      style={style}
      data-reveal={reveal ? '' : undefined}
    >
      <div className="frame">
        <span className="pcard-arrow" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
        <Img src={project.cover?.url} alt={project.cover?.caption || project.title} sizes={sizes} priority={priority} />
      </div>
      <div className="pcard-meta">
        <span className="label pcard-kicker">
          {categoryLabel(project.category)} — {[project.location, project.city].filter(Boolean).join(', ')}
        </span>
        <h3 className="pcard-title">
          <span>{project.title}</span>
        </h3>
        {facts ? <span className="pcard-facts">{facts}</span> : null}
      </div>
    </Link>
  );
}
