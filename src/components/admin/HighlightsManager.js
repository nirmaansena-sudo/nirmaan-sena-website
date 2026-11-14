'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useToast } from './Toast';
import { HIGHLIGHT_PLACEMENTS } from '@/lib/highlights';
import { imageUrl } from '@/lib/media';
import { categoryLabel } from '@/lib/site';

const asSlots = (settings) => Object.fromEntries(HIGHLIGHT_PLACEMENTS.map(({ key, limit }) => [key, Array.from({ length: limit }, (_, index) => settings[key]?.[index] || '')]));
const compact = (settings) => Object.fromEntries(HIGHLIGHT_PLACEMENTS.map(({ key }) => [key, settings[key].filter(Boolean)]));

export default function HighlightsManager({ projects, initialSettings, initiallyConfigured }) {
  const router = useRouter();
  const [selections, setSelections] = useState(() => asSlots(initialSettings));
  const [saved, setSaved] = useState(() => asSlots(initialSettings));
  const [configured, setConfigured] = useState(initiallyConfigured);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, show] = useToast();
  const dirty = JSON.stringify(selections) !== JSON.stringify(saved);
  const published = projects.filter((project) => project.published);
  const byId = new Map(projects.map((project) => [project.id, project]));
  const used = new Set(Object.values(selections).flat().filter(Boolean));

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const leave = (event) => {
      if (!dirty || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target.closest?.('a[href], button[data-leave-admin]');
      if (!target || target.target === '_blank' || target.hasAttribute('download')) return;
      if (target.tagName === 'A') {
        const destination = new URL(target.href, window.location.href);
        if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      }
      if (!window.confirm('You have unsaved highlight changes. Leave without saving?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', leave, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', leave, true);
    };
  }, [dirty]);

  function choose(key, index, id) {
    setSelections((current) => ({ ...current, [key]: current[key].map((value, position) => position === index ? id : value) }));
    setErrors((current) => ({ ...current, [key]: '' }));
  }

  function move(key, index, delta) {
    setSelections((current) => {
      const slots = [...current[key]];
      [slots[index], slots[index + delta]] = [slots[index + delta], slots[index]];
      return { ...current, [key]: slots };
    });
  }

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrors({});
    try {
      const { settings } = await api('/api/admin/highlights', { method: 'PUT', body: { settings: compact(selections) } });
      const next = asSlots(settings);
      setSaved(next);
      setSelections(next);
      setConfigured(true);
      show('Highlights saved. Your selections are now live on the website.');
      router.refresh();
    } catch (error) {
      setErrors(error.errors || {});
      show(error.message, 'error');
      // Refresh publication status if a project changed in another dashboard tab.
      if (error.errors) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="highlights-manager">
      <div className="adm-head">
        <div>
          <p className="highlights-kicker">Website curation</p>
          <h1>Project highlights</h1>
          <p>Choose the work that takes centre stage. Each area has its own selection.</p>
        </div>
        <div className="adm-actions">
          <Link className="ab" href="/admin">Manage projects</Link>
          <button className="ab ab-primary" type="submit" disabled={saving || (configured && !dirty)}>
            {saving ? 'Saving…' : 'Save highlights'}
          </button>
        </div>
      </div>

      <div className="highlights-overview">
        <div><strong>{HIGHLIGHT_PLACEMENTS.length}</strong><span>Highlight areas</span></div>
        <div><strong>{used.size}</strong><span>Selected projects</span></div>
        <div><strong>{published.length}</strong><span>Published projects</span></div>
        <p>Choose “No project” to leave an area empty. Only published projects appear on the website.</p>
      </div>

      {!configured ? <p className="notice">Your current featured projects have been carried over. Save once to manage every highlight independently of the project list order.</p> : null}
      {!published.length ? <p className="notice">Publish a project with a cover photo in <Link href="/admin">Projects</Link> to make it available here.</p> : null}
      {errors.settings ? <p className="err-text" role="alert">{errors.settings}</p> : null}

      <fieldset disabled={saving} className="highlights-fields">
        {HIGHLIGHT_PLACEMENTS.map(({ key, title, description, limit, href }, areaIndex) => (
          <section className="highlight-area" key={key} aria-labelledby={`highlight-${key}`}>
            <div className="highlight-area-head">
              <span className="highlight-number">0{areaIndex + 1}</span>
              <div>
                <h2 id={`highlight-${key}`}>{title}</h2>
                <p>{description}</p>
              </div>
              <a href={href} target="_blank" rel="noopener noreferrer" className="highlight-preview-link">View page ↗</a>
            </div>
            {errors[key] ? <p className="err-text" id={`error-${key}`} role="alert">{errors[key]}</p> : null}
            <div className={`highlight-slots ${limit > 1 ? 'highlight-slots-multiple' : ''}`}>
              {selections[key].map((id, index) => {
                const project = byId.get(id);
                const unavailable = id && !project?.published;
                return (
                  <div className="highlight-slot" key={`${key}-${index}`}>
                    <div className={`highlight-image${!project?.cover?.url ? ' is-empty' : ''}`}>
                      {project?.cover?.url ? <img src={imageUrl(project.cover.url, 720)} alt={project.title} loading="lazy" /> : <span>{id ? 'Project unavailable' : 'No project selected'}</span>}
                      <span className="highlight-position">{limit > 1 ? `Position 0${index + 1}` : 'Project spotlight'}</span>
                    </div>
                    <div className="highlight-slot-body">
                      <label htmlFor={`${key}-${index}`}>{limit > 1 ? `Project ${index + 1}` : 'Selected project'}</label>
                      <select id={`${key}-${index}`} className="in" value={id} onChange={(event) => choose(key, index, event.target.value)} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `error-${key}` : undefined}>
                        <option value="">No project — hide this placement</option>
                        {unavailable ? <option value={id}>{project ? `${project.title} (draft)` : 'Removed project — choose another'}</option> : null}
                        {published.map((option) => <option key={option.id} value={option.id} disabled={option.id !== id && selections[key].includes(option.id)}>{option.title}</option>)}
                      </select>
                      {unavailable ? <p className="highlight-unavailable">This project is hidden from the website. Remove it or choose a published project before saving.</p> : project ? <p className="highlight-project-meta">{categoryLabel(project.category)} · {[project.location, project.city].filter(Boolean).join(', ')}</p> : <p className="highlight-project-meta">This area will stay empty until you select a project.</p>}
                      <div className="highlight-slot-actions">
                        {project ? <Link href={`/admin/projects/${project.id}`}>Edit project ↗</Link> : <span />}
                        {limit > 1 ? <div className="adm-actions">
                          <button type="button" className="ab ab-sm ab-icon" disabled={index === 0} onClick={() => move(key, index, -1)} aria-label={`Move project ${index + 1} earlier`}>←</button>
                          <button type="button" className="ab ab-sm ab-icon" disabled={index === limit - 1} onClick={() => move(key, index, 1)} aria-label={`Move project ${index + 1} later`}>→</button>
                        </div> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </fieldset>

      <div className="highlight-savebar">
        <p role="status">{saving ? 'Saving your selections…' : dirty ? 'You have unsaved changes.' : configured ? 'All highlight selections are saved.' : 'Save to activate your independent selections.'}</p>
        <div className="adm-actions">
          <button type="button" className="ab" disabled={!dirty || saving} onClick={() => { setSelections(saved); setErrors({}); }}>Discard changes</button>
          <button type="submit" className="ab ab-primary" disabled={saving || (configured && !dirty)}>{saving ? 'Saving…' : 'Save highlights'}</button>
        </div>
      </div>
      {toast}
    </form>
  );
}
