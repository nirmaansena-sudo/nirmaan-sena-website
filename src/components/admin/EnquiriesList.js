'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useToast } from './Toast';
import { formatDate } from '@/lib/format';
import { toCsv } from '@/lib/csv';

const STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'site-visit', label: 'Site visit' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'won', label: 'Won' },
  { key: 'closed', label: 'Closed' },
];
const label = (k) => STATUSES.find((s) => s.key === k)?.label || k;



export default function EnquiriesList({ initial }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(initial.find((e) => e.status === 'new')?.id || null);
  const [notes, setNotes] = useState({});
  const [toast, show] = useToast();

  const counts = useMemo(() => items.reduce((a, e) => ({ ...a, [e.status]: (a[e.status] || 0) + 1 }), {}), [items]);
  const visible = filter === 'all' ? items : items.filter((e) => e.status === filter);

  async function patch(id, body, msg) {
    try {
      const { enquiry } = await api(`/api/admin/enquiries/${id}`, { method: 'PATCH', body });
      setItems((list) => list.map((e) => (e.id === id ? enquiry : e)));
      if (msg) show(msg);
      router.refresh();
    } catch (err) {
      show(err.message, 'error');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this enquiry permanently?')) return;
    try {
      await api(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      setItems((list) => list.filter((e) => e.id !== id));
      show('Enquiry deleted.');
      router.refresh();
    } catch (err) {
      show(err.message, 'error');
    }
  }

  function exportCsv() {
    const blob = new Blob(['\ufeff' + toCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nirmaan-sena-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Enquiries</h1>
          <p>Requests sent from the website’s contact form.</p>
        </div>
        <div className="adm-actions">
          <button className="ab" type="button" onClick={exportCsv} disabled={!visible.length}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="tabs" role="toolbar" aria-label="Filter by status">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          All ({items.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s.key} type="button" aria-pressed={filter === s.key} onClick={() => setFilter(s.key)}>
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <h2>{items.length ? 'Nothing here' : 'No enquiries yet'}</h2>
          <p>New requests from the contact page will appear here.</p>
        </div>
      ) : (
        visible.map((e) => {
          const isOpen = open === e.id;
          const wa = `https://wa.me/91${e.whatsapp || e.phone}?text=${encodeURIComponent(`Hello ${e.name}, this is Nirmaan Sena regarding your enquiry ${e.reference}.`)}`;
          return (
            <article className="enq" key={e.id}>
              <div className="enq-head" onClick={() => setOpen(isOpen ? null : e.id)} role="button" tabIndex={0} onKeyDown={(k) => k.key === 'Enter' && setOpen(isOpen ? null : e.id)} aria-expanded={isOpen}>
                <div>
                  <h3>
                    {e.name} <span className="hint" style={{ fontWeight: 400 }}>· {e.reference}</span>
                  </h3>
                  <p>
                    {[e.projectType, e.locality, (e.services || []).join(', ')].filter(Boolean).join(' · ') || 'General enquiry'} —{' '}
                    <time dateTime={e.createdAt} suppressHydrationWarning>
                      {formatDate(e.createdAt, true)}
                    </time>
                  </p>
                </div>
                <span className={`badge ${e.status === 'new' ? 'status-new' : e.status === 'won' ? 'badge-green' : 'badge-muted'}`}>{label(e.status)}</span>
              </div>
              {isOpen ? (
                <div className="enq-body">
                  <dl>
                    <dt>Phone</dt>
                    <dd>
                      <a className="text-link" href={`tel:+91${e.phone}`}>
                        +91 {e.phone}
                      </a>
                    </dd>
                    <dt>WhatsApp</dt>
                    <dd>
                      <a className="text-link" href={wa} target="_blank" rel="noopener noreferrer">
                        +91 {e.whatsapp || e.phone} ↗
                      </a>
                    </dd>
                    {e.email ? (
                      <>
                        <dt>Email</dt>
                        <dd>
                          <a className="text-link" href={`mailto:${e.email}`}>
                            {e.email}
                          </a>
                        </dd>
                      </>
                    ) : null}
                    <dt>Area</dt>
                    <dd>{e.locality || '—'}</dd>
                    <dt>Project type</dt>
                    <dd>{e.projectType || '—'}</dd>
                    <dt>Services</dt>
                    <dd>{(e.services || []).join(', ') || '—'}</dd>
                    <dt>Size</dt>
                    <dd>{e.area ? `${e.area} sq ft` : '—'}</dd>
                    <dt>Start</dt>
                    <dd>{e.timeline || '—'}</dd>
                    <dt>Message</dt>
                    <dd style={{ whiteSpace: 'pre-wrap' }}>{e.message || '—'}</dd>
                    <dt>Sent from</dt>
                    <dd>{e.source || 'website'}</dd>
                  </dl>
                  <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                    <div className="af">
                      <label htmlFor={`st-${e.id}`}>Status</label>
                      <select id={`st-${e.id}`} className="in" value={e.status} onChange={(ev) => patch(e.id, { status: ev.target.value }, 'Status updated.')}>
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af">
                      <label htmlFor={`nt-${e.id}`}>Internal note</label>
                      <textarea
                        id={`nt-${e.id}`}
                        className="in"
                        rows={4}
                        value={notes[e.id] ?? e.note ?? ''}
                        onChange={(ev) => setNotes((n) => ({ ...n, [e.id]: ev.target.value }))}
                        placeholder="Call outcome, visit date, quote amount…"
                      />
                    </div>
                    <div className="adm-actions">
                      <button className="ab ab-dark ab-sm" type="button" onClick={() => patch(e.id, { note: notes[e.id] ?? e.note ?? '' }, 'Note saved.')}>
                        Save note
                      </button>
                      <a className="ab ab-sm" href={wa} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                      <button className="ab ab-sm ab-danger" type="button" onClick={() => remove(e.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })
      )}
      {toast}
    </>
  );
}
