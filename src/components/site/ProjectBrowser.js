'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectCard from './ProjectCard';
import { categories } from '@/lib/site';

/** Filterable project index. The selected filter is kept in the URL (?type=…). */
export default function ProjectBrowser({ projects }) {
  return (
    <Suspense fallback={<ProjectBrowserView projects={projects} active="all" />}>
      <ProjectBrowserFromUrl projects={projects} />
    </Suspense>
  );
}

function ProjectBrowserFromUrl({ projects }) {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const active = categories.some((category) => category.key === type) ? type : 'all';
  return <ProjectBrowserView projects={projects} active={active} />;
}

function ProjectBrowserView({ projects, active }) {
  const counts = useMemo(() => {
    const c = {};
    for (const p of projects) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [projects]);

  const visible = active === 'all' ? projects : projects.filter((p) => p.category === active);
  const available = categories.filter((c) => counts[c.key]);

  const choose = (key) => {
    const url = new URL(window.location.href);
    if (key === 'all') url.searchParams.delete('type');
    else url.searchParams.set('type', key);
    window.history.replaceState(null, '', url);
  };

  return (
    <>
      <div className="filter-bar">
        <div className="container">
          <div className="filters" role="toolbar" aria-label="Filter projects">
            <button type="button" className="filter-btn" aria-pressed={active === 'all'} onClick={() => choose('all')}>
              All <sup>{projects.length}</sup>
            </button>
            {available.map((c) => (
              <button key={c.key} type="button" className="filter-btn" aria-pressed={active === c.key} onClick={() => choose(c.key)}>
                {c.label} <sup>{counts[c.key]}</sup>
              </button>
            ))}
          </div>
          <span className="label filter-count" aria-live="polite">
            {String(visible.length).padStart(2, '0')} {visible.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </div>

      <div className="container">
        <div className="grid project-grid" key={active}>
          {visible.length === 0 ? (
            <p className="empty">No projects in this category yet.</p>
          ) : (
            visible.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                reveal={false}
                priority={i < 2}
                sizes="(max-width: 800px) 100vw, 50vw"
                style={{ '--d': `${Math.min(i, 6) * 70}ms` }}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
