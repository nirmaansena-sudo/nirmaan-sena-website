'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import MediaManager, { Dropzone, MediaThumb, UploadQueue, useUploader } from './MediaManager';
import { api, useToast } from './Toast';
import { categories } from '@/lib/site';
import { slugify } from '@/lib/validate';
import { imageUrl, youtubeId } from '@/lib/media';
import { formatDate } from '@/lib/format';
import { newId } from '@/lib/upload-client';

const blank = {
  title: '',
  slug: '',
  category: categories[0].key,
  location: '',
  city: 'Jaipur',
  year: '',
  status: 'completed',
  area: '',
  duration: '',
  client: '',
  summary: '',
  description: '',
  scope: [],
  specs: [],
  cover: null,
  heroVideo: null,
  gallery: [],
  featured: false,
  published: false,
  seoDescription: '',
};

function toForm(p) {
  return {
    ...blank,
    ...p,
    area: p?.area ?? '',
    year: p?.year ?? '',
    scope: p?.scope || [],
    specs: (p?.specs || []).map((s) => ({ ...s, _k: newId() })),
    gallery: p?.gallery || [],
  };
}

export default function ProjectEditor({ initial }) {
  const router = useRouter();
  const isNew = !initial?.id;
  // One snapshot for both the form and the "saved" baseline (spec rows get random keys).
  const [initialForm] = useState(() => toForm(initial));
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(() => JSON.stringify({ ...initialForm, _scope: (initial?.scope || []).join(', ') }));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [scopeText, setScopeText] = useState((initial?.scope || []).join(', '));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [heroYt, setHeroYt] = useState('');
  const [updatedAt, setUpdatedAt] = useState(initial?.updatedAt);
  const [toast, show] = useToast();

  const dirty = useMemo(() => JSON.stringify({ ...form, _scope: scopeText }) !== saved, [form, scopeText, saved]);

  useEffect(() => {
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const setGallery = (updater) => setForm((f) => ({ ...f, gallery: typeof updater === 'function' ? updater(f.gallery) : updater }));

  const coverUploader = useUploader(
    ([item]) => {
      if (item.type !== 'image') {
        show('The cover must be a photo.', 'error');
        return;
      }
      setForm((f) => ({ ...f, cover: item }));
      show('Cover photo uploaded.');
    },
    (msg) => show(msg, 'error')
  );

  const heroUploader = useUploader(
    ([item]) => {
      if (item.type !== 'video') {
        show('Choose a video file (MP4).', 'error');
        return;
      }
      setForm((f) => ({ ...f, heroVideo: item }));
      show('Hero video uploaded.');
    },
    (msg) => show(msg, 'error')
  );

  function setHeroYoutube() {
    const id = youtubeId(heroYt.trim());
    if (!id) return show('That doesn’t look like a YouTube link.', 'error');
    setForm((f) => ({ ...f, heroVideo: { id: newId(), type: 'youtube', url: `https://www.youtube.com/watch?v=${id}`, width: 16, height: 9 } }));
    setHeroYt('');
  }

  // Specs
  const setSpec = (i, key, value) => setForm((f) => ({ ...f, specs: f.specs.map((s, k) => (k === i ? { ...s, [key]: value } : s)) }));
  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: '', value: '', _k: newId() }] }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specs: f.specs.filter((_, k) => k !== i) }));

  async function save(e, overrides = {}) {
    e?.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      ...form,
      ...overrides,
      scope: scopeText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      specs: form.specs.map(({ _k, ...s }) => s),
    };
    try {
      const { project } = isNew
        ? await api('/api/admin/projects', { method: 'POST', body: payload })
        : await api(`/api/admin/projects/${initial.id}`, { method: 'PUT', body: payload });
      const next = toForm(project);
      const nextScope = (project.scope || []).join(', ');
      setForm(next);
      setScopeText(nextScope);
      setSaved(JSON.stringify({ ...next, _scope: nextScope }));
      setUpdatedAt(project.updatedAt);
      show(project.published ? 'Saved and live on the website.' : 'Saved as draft.');
      if (isNew) {
        router.replace(`/admin/projects/${project.id}`);
      }
      router.refresh();
    } catch (err) {
      setErrors(err.errors || {});
      show(err.message, 'error');
      setTimeout(() => document.querySelector('.af.err, .err-text')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    try {
      await api(`/api/admin/projects/${initial.id}`, { method: 'DELETE' });
      setSaved(JSON.stringify({ ...form, _scope: scopeText }));
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      show(err.message, 'error');
    }
  }

  const err = (k) => (errors[k] ? <span className="err-text">{errors[k]}</span> : null);
  const fc = (k, extra) => `af ${extra || ''}${errors[k] ? ' err' : ''}`;

  return (
    <form onSubmit={save}>
      <div className="adm-head">
        <div>
          <p style={{ marginTop: 0, marginBottom: 6 }}>
            <Link
              href="/admin"
              className="hint"
              onClick={(e) => {
                if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault();
              }}
            >
              ← All projects
            </Link>
          </p>
          <h1>{isNew ? 'New project' : form.title || 'Untitled project'}</h1>
          {!isNew ? <p suppressHydrationWarning>Last saved {formatDate(updatedAt, true)}</p> : null}
        </div>
        <div className="adm-actions">
          {!isNew && initial.published ? (
            <a className="ab" href={`/projects/${initial.slug}`} target="_blank" rel="noopener noreferrer">
              View on site ↗
            </a>
          ) : null}
          <button className="ab ab-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : dirty || isNew ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="editor">
        <div>
          {/* Basics */}
          <section className="card">
            <div className="card-title">
              <h2>Project details</h2>
            </div>
            <div className="form-grid">
              <div className={fc('title', 'span-6')}>
                <label htmlFor="p-title">
                  Project name <span className="req">*</span>
                </label>
                <input id="p-title" className="in" value={form.title} onChange={set('title')} placeholder="e.g. Sharma Residence" />
                {err('title')}
              </div>
              <div className={fc('slug', 'span-6')}>
                <label htmlFor="p-slug">Web address</label>
                <div className="prefix-in">
                  <span>/projects/</span>
                  <input
                    id="p-slug"
                    className="in"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug')(slugify(e.target.value) + (e.target.value.endsWith('-') ? '-' : ''));
                    }}
                    placeholder="sharma-residence"
                  />
                </div>
                {err('slug')}
              </div>
              <div className="af span-3">
                <label htmlFor="p-cat">Category</label>
                <select id="p-cat" className="in" value={form.category} onChange={set('category')}>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="af span-3">
                <span className="af-label">Status</span>
                <div className="seg" role="group" aria-label="Status">
                  <button type="button" aria-pressed={form.status === 'completed'} onClick={() => set('status')('completed')}>
                    Completed
                  </button>
                  <button type="button" aria-pressed={form.status === 'ongoing'} onClick={() => set('status')('ongoing')}>
                    Under construction
                  </button>
                </div>
              </div>
              <div className="af span-3">
                <label htmlFor="p-loc">Locality</label>
                <input id="p-loc" className="in" value={form.location} onChange={set('location')} placeholder="e.g. Vaishali Nagar" />
              </div>
              <div className="af span-3">
                <label htmlFor="p-city">City</label>
                <input id="p-city" className="in" value={form.city} onChange={set('city')} />
              </div>
              <div className="af span-2">
                <label htmlFor="p-area">Area (sq ft)</label>
                <input id="p-area" className="in" inputMode="numeric" value={form.area} onChange={set('area')} placeholder="2400" />
              </div>
              <div className="af span-2">
                <label htmlFor="p-dur">Timeline</label>
                <input id="p-dur" className="in" value={form.duration} onChange={set('duration')} placeholder="e.g. 45 days" />
              </div>
              <div className="af span-2">
                <label htmlFor="p-year">Year</label>
                <input id="p-year" className="in" inputMode="numeric" maxLength={4} value={form.year} onChange={set('year')} placeholder="2026" />
              </div>
              <div className="af span-6">
                <label htmlFor="p-client">Client (optional)</label>
                <input id="p-client" className="in" value={form.client} onChange={set('client')} placeholder="Shown only if filled — e.g. Private residence" />
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="card">
            <div className="card-title">
              <h2>Story</h2>
              <p>Shown on the project page</p>
            </div>
            <div className="form-grid">
              <div className="af span-6">
                <label htmlFor="p-sum">Short summary</label>
                <textarea id="p-sum" className="in" rows={2} maxLength={320} value={form.summary} onChange={set('summary')} placeholder="One or two lines that appear under the title and on project cards." />
                <span className="hint">{form.summary.length}/320</span>
              </div>
              <div className="af span-6">
                <label htmlFor="p-desc">Full description</label>
                <textarea
                  id="p-desc"
                  className="in"
                  rows={9}
                  value={form.description}
                  onChange={set('description')}
                  placeholder={'The brief, what was built, materials, challenges solved.\n\nLeave an empty line to start a new paragraph.'}
                />
              </div>
              <div className="af span-6">
                <label htmlFor="p-scope">Scope of work</label>
                <input id="p-scope" className="in" value={scopeText} onChange={(e) => setScopeText(e.target.value)} placeholder="Civil work, False ceiling, Modular kitchen, Electrical" />
                <span className="hint">Separate with commas. Shown as tags.</span>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="card">
            <div className="card-title">
              <h2>Photos &amp; videos</h2>
              <p>{form.gallery.length} items</p>
            </div>
            <MediaManager
              items={form.gallery}
              onChange={setGallery}
              coverUrl={form.cover?.url}
              onSetCover={(it) => {
                setForm((f) => ({ ...f, cover: it }));
                show('Cover photo updated.');
              }}
              notify={show}
            />
          </section>

          {/* Specs */}
          <section className="card">
            <div className="card-title">
              <h2>Specifications</h2>
              <p>Materials, finishes, structure</p>
            </div>
            {form.specs.map((s, i) => (
              <div className="spec-row" key={s._k}>
                <input className="in" placeholder="Label — e.g. Flooring" value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)} />
                <input className="in" placeholder="Value — e.g. Italian marble" value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} />
                <button type="button" className="ab ab-icon" onClick={() => removeSpec(i)} aria-label="Remove row">
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="ab ab-sm" onClick={addSpec}>
              + Add row
            </button>
          </section>

          {/* SEO */}
          <section className="card">
            <div className="card-title">
              <h2>Search &amp; sharing</h2>
              <p>Optional</p>
            </div>
            <div className="af">
              <label htmlFor="p-seo">Description for Google and WhatsApp previews</label>
              <textarea id="p-seo" className="in" rows={2} maxLength={300} value={form.seoDescription} onChange={set('seoDescription')} placeholder="Uses the short summary if left empty." />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="editor-side">
          <section className="card">
            <div className="card-title">
              <h2>Visibility</h2>
            </div>
            <label className="switch">
              <span>
                <strong>Published</strong>
                <small>Visible on the website</small>
              </span>
              <input type="checkbox" checked={form.published} onChange={set('published')} />
            </label>
            <div className="project-highlight-note">
              <strong>Project highlights</strong>
              <p>Choose where published projects appear on the home page and across the site.</p>
              <Link href="/admin/highlights" onClick={(event) => { if (dirty && !window.confirm('You have unsaved project changes. Leave without saving?')) event.preventDefault(); }}>Manage highlights ↗</Link>
            </div>
            <button className="ab ab-primary" type="submit" disabled={saving} style={{ width: '100%', marginTop: 12 }}>
              {saving ? 'Saving…' : form.published ? 'Save & publish' : 'Save draft'}
            </button>
            {dirty && !isNew ? (
              <p className="hint" style={{ marginTop: 8, textAlign: 'center' }}>
                You have unsaved changes
              </p>
            ) : null}
          </section>

          <section className="card">
            <div className="card-title">
              <h2>Cover photo</h2>
              {form.cover ? (
                <button type="button" className="ab ab-sm" onClick={() => setForm((f) => ({ ...f, cover: null }))}>
                  Remove
                </button>
              ) : null}
            </div>
            {form.cover ? (
              <div className="cover-box">
                <img src={imageUrl(form.cover.url, 800)} alt="" />
              </div>
            ) : (
              <Dropzone onFiles={coverUploader.upload} accept="image/*" multiple={false} title="Upload cover photo" subtitle="Landscape works best · or pick one from the gallery" />
            )}
            <UploadQueue queue={coverUploader.queue} onClear={coverUploader.clearFailed} />
            {form.cover ? (
              <div className="af" style={{ marginTop: 10 }}>
                <input
                  className="in"
                  placeholder="Cover caption (optional)"
                  value={form.cover.caption || ''}
                  onChange={(e) => setForm((f) => ({ ...f, cover: { ...f.cover, caption: e.target.value } }))}
                />
              </div>
            ) : null}
            {err('cover')}
          </section>

          <section className="card">
            <div className="card-title">
              <h2>Hero video</h2>
              {form.heroVideo ? (
                <button type="button" className="ab ab-sm" onClick={() => setForm((f) => ({ ...f, heroVideo: null }))}>
                  Remove
                </button>
              ) : null}
            </div>
            {form.heroVideo ? (
              <>
                <div className="cover-box" style={{ background: 'var(--ink-2)' }}>
                  <MediaThumb item={form.heroVideo} />
                </div>
                <p className="hint" style={{ marginTop: 8 }}>
                  {form.heroVideo.type === 'youtube'
                    ? 'Shown as a walkthrough section on the project page.'
                    : 'Plays silently at the top of the project page, instead of the cover photo.'}
                </p>
              </>
            ) : (
              <>
                <Dropzone onFiles={heroUploader.upload} accept="video/*" multiple={false} title="Upload a short clip" subtitle="MP4, 10–30 seconds, no sound needed" />
                <UploadQueue queue={heroUploader.queue} onClear={heroUploader.clearFailed} />
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <input className="in" placeholder="…or a YouTube link" value={heroYt} onChange={(e) => setHeroYt(e.target.value)} />
                  <button type="button" className="ab" onClick={setHeroYoutube}>
                    Add
                  </button>
                </div>
              </>
            )}
          </section>

          {!isNew ? (
            <section className="card">
              <div className="card-title">
                <h2>Delete project</h2>
              </div>
              <p className="hint" style={{ marginBottom: 12 }}>
                Removes the project from the website and dashboard. This can’t be undone.
              </p>
              <button type="button" className="ab ab-danger" onClick={remove} style={{ width: '100%' }}>
                {confirmDelete ? 'Click again to delete' : 'Delete project'}
              </button>
            </section>
          ) : null}
        </aside>
      </div>
      {toast}
    </form>
  );
}
