'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { api, useToast } from './Toast';
import { categoryLabel } from '@/lib/site';
import { imageUrl } from '@/lib/media';
import { formatDate } from '@/lib/format';

export default function ProjectsTable({ initialProjects, stats, highlightedIds = [] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();
  const counts = {
    total: projects.length,
    published: projects.filter((p) => p.published).length,
    featured: projects.filter((p) => highlightedIds.includes(p.id) && p.published).length,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => `${p.title} ${p.location} ${categoryLabel(p.category)}`.toLowerCase().includes(q));
  }, [projects, query]);

  async function saveOrder(next) {
    setProjects(next);
    try {
      await api('/api/admin/projects/reorder', { method: 'POST', body: { ids: next.map((p) => p.id) } });
      show('Order saved — the website now shows projects in this order.');
    } catch (err) {
      show(err.message, 'error');
    }
  }

  function move(id, delta) {
    const i = projects.findIndex((p) => p.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next);
  }

  function onDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const next = [...projects];
    const from = next.findIndex((p) => p.id === dragId);
    const [item] = next.splice(from, 1);
    const to = next.findIndex((p) => p.id === targetId);
    next.splice(to, 0, item);
    setDragId(null);
    setOverId(null);
    saveOrder(next);
  }

  async function toggle(p, key) {
    try {
      const { project } = await api(`/api/admin/projects/${p.id}`, { method: 'PATCH', body: { [key]: !p[key] } });
      setProjects((list) => list.map((x) => (x.id === p.id ? project : x)));
      show(project.published ? 'Published on the website.' : 'Moved to drafts and hidden from highlights.');
      router.refresh();
    } catch (err) {
      show(err.message, 'error');
    }
  }

  async function importStarter() {
    setBusy(true);
    try {
      const { added } = await api('/api/admin/projects/import', { method: 'POST' });
      show(added ? `Imported ${added} starter projects.` : 'Starter projects are already here.');
      router.refresh();
      const { projects: list } = await api('/api/admin/projects');
      setProjects(list);
    } catch (err) {
      show(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Projects</h1>
          <p>Drag rows to arrange the project collection. Choose home-page and other featured projects in Highlights.</p>
        </div>
        <div className="adm-actions">
          <input className="in" style={{ width: 220 }} placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Link className="ab" href="/admin/highlights">Manage highlights</Link>
          <Link className="ab ab-primary" href="/admin/projects/new">
            + New project
          </Link>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span>Projects</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="stat-card">
          <span>Published</span>
          <strong>{counts.published}</strong>
        </div>
        <div className="stat-card">
          <span>Highlighted</span>
          <strong>{counts.featured}</strong>
        </div>
        <div className="stat-card">
          <span>New enquiries</span>
          <strong>{stats.newEnquiries}</strong>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Add your first project, or import the five projects from your previous website to start with.</p>
          <div className="adm-actions">
            <Link className="ab ab-primary" href="/admin/projects/new">
              + New project
            </Link>
            <button className="ab" type="button" onClick={importStarter} disabled={busy}>
              {busy ? 'Importing…' : 'Import starter projects'}
            </button>
          </div>
        </div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} aria-label="Order" />
              <th style={{ width: 90 }}>Cover</th>
              <th>Project</th>
              <th className="hide-sm">Status</th>
              <th className="hide-sm">Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                draggable={!query}
                onDragStart={(e) => {
                  setDragId(p.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverId(p.id);
                }}
                onDragLeave={() => setOverId((o) => (o === p.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(p.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`${dragId === p.id ? 'dragging' : ''} ${overId === p.id && dragId !== p.id ? 'drop-target' : ''}`}
              >
                <td>
                  <span className="drag-handle" title="Drag to reorder" aria-hidden="true">
                    ⋮⋮
                  </span>
                </td>
                <td>
                  {p.cover?.url ? <img className="p-thumb" src={imageUrl(p.cover.url, 200)} alt="" loading="lazy" /> : <span className="p-thumb" />}
                </td>
                <td>
                  <Link href={`/admin/projects/${p.id}`} className="p-title">
                    {p.title}
                  </Link>
                  <div className="p-sub">
                    {categoryLabel(p.category)} · {[p.location, p.city].filter(Boolean).join(', ')} · {(p.gallery || []).length} media
                  </div>
                </td>
                <td className="hide-sm">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.published ? <span className="badge badge-green">Published</span> : <span className="badge badge-muted">Draft</span>}
                    {highlightedIds.includes(p.id) && p.published ? <span className="badge badge-amber">Highlighted</span> : null}
                  </div>
                </td>
                <td className="hide-sm" style={{ fontSize: 13, color: 'var(--text-2)' }} suppressHydrationWarning>
                  {formatDate(p.updatedAt)}
                </td>
                <td>
                  <div className="row-actions">
                    {!query ? (
                      <>
                        <button className="ab ab-sm ab-icon" type="button" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label="Move up">
                          ↑
                        </button>
                        <button
                          className="ab ab-sm ab-icon"
                          type="button"
                          onClick={() => move(p.id, 1)}
                          disabled={i === filtered.length - 1}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </>
                    ) : null}
                    <button className="ab ab-sm hide-sm" type="button" onClick={() => toggle(p, 'published')}>
                      {p.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link className="ab ab-sm ab-dark" href={`/admin/projects/${p.id}`}>
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {toast}
    </>
  );
}
