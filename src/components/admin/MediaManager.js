'use client';

import { useRef, useState } from 'react';
import { uploadMedia, newId } from '@/lib/upload-client';
import { imageUrl, videoPoster, youtubeId, aspect } from '@/lib/media';
import { composeGallery } from '@/lib/gallery';

/** Hook that uploads a list of files and reports progress per file. */
export function useUploader(onDone, onError) {
  const [queue, setQueue] = useState([]);

  async function upload(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    const jobs = list.map((f) => ({ key: newId(), name: f.name, progress: 0, error: '' }));
    setQueue((q) => [...q, ...jobs]);
    const update = (key, patch) => setQueue((q) => q.map((j) => (j.key === key ? { ...j, ...patch } : j)));

    // Two uploads at a time keeps things quick without saturating mobile connections.
    let next = 0;
    const results = new Array(list.length);
    async function worker() {
      while (next < list.length) {
        const i = next++;
        const job = jobs[i];
        try {
          results[i] = await uploadMedia(list[i], (p) => update(job.key, { progress: p }));
          setQueue((q) => q.filter((j) => j.key !== job.key));
        } catch (err) {
          update(job.key, { error: err.message || 'Upload failed' });
          onError?.(`${list[i].name}: ${err.message}`);
        }
      }
    }
    await Promise.all([worker(), worker()]);
    const ok = results.filter(Boolean);
    if (ok.length) onDone(ok);
  }

  const clearFailed = () => setQueue((q) => q.filter((j) => !j.error));
  return { queue, upload, clearFailed };
}

export function UploadQueue({ queue, onClear }) {
  if (!queue.length) return null;
  const failed = queue.some((j) => j.error);
  return (
    <div className="upload-list">
      {queue.map((j) => (
        <div key={j.key} className={`upload-row${j.error ? ' failed' : ''}`}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}</span>
          <span>{j.error ? j.error : `${Math.round(j.progress * 100)}%`}</span>
          {!j.error ? (
            <span className="bar">
              <i style={{ width: `${Math.round(j.progress * 100)}%` }} />
            </span>
          ) : null}
        </div>
      ))}
      {failed ? (
        <button type="button" className="ab ab-sm" onClick={onClear} style={{ justifySelf: 'start' }}>
          Clear failed
        </button>
      ) : null}
    </div>
  );
}

export function Dropzone({ onFiles, accept = 'image/*,video/*', multiple = true, title, subtitle }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
      }}
    >
      <span className="dz-icon" aria-hidden="true">
        ↑
      </span>
      <strong>{title || 'Drop photos and videos here'}</strong>
      <span>{subtitle || 'or click to choose files · JPG, PNG, WebP, MP4'}</span>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function MediaThumb({ item }) {
  if (item.type === 'youtube') {
    const id = youtubeId(item.url);
    return id ? <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" /> : null;
  }
  if (item.type === 'video') {
    const poster = videoPoster(item);
    return poster ? <img src={poster} alt="" loading="lazy" /> : <video src={item.url} muted preload="metadata" />;
  }
  return <img src={imageUrl(item.url, 480)} alt="" loading="lazy" />;
}

/** Tiny schematic of how the gallery will be laid out on the website. */
function LayoutPreview({ items }) {
  const rows = composeGallery(items);
  if (!rows.length) return null;
  const spans = (row) => {
    if (row.kind === 'full') return [[1, 13]];
    if (row.kind === 'pair') return [[1, 7], [7, 13]];
    if (row.kind === 'single') return [[6, 12]];
    return row.portraitIndex === 0 ? [[1, 6], [6, 13]] : [[1, 8], [8, 13]];
  };
  return (
    <div>
      <p className="hint" style={{ marginTop: 18 }}>
        Layout on the website (updates as you reorder):
      </p>
      <div className="layout-preview" aria-hidden="true">
        {rows.map((row, r) => (
          <div className="lp-row" key={r}>
            {row.items.map((it, k) => {
              const [a, b] = spans(row)[k];
              const ratio = row.kind === 'pair' ? (row.portrait ? 0.8 : 4 / 3) : row.kind === 'full' ? Math.max(aspect(it), 1.25) : aspect(it);
              return <i key={k} style={{ gridColumn: `${a} / ${b}`, aspectRatio: String(ratio) }} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full gallery manager: upload, YouTube links, captions, layout, cover, reorder. */
export default function MediaManager({ items, onChange, coverUrl, onSetCover, notify }) {
  const [yt, setYt] = useState('');
  const [dragIndex, setDragIndex] = useState(-1);
  const [overIndex, setOverIndex] = useState(-1);
  const { queue, upload, clearFailed } = useUploader(
    (added) => {
      onChange((list) => [...list, ...added]);
      notify?.(`${added.length} file${added.length > 1 ? 's' : ''} uploaded.`);
    },
    (msg) => notify?.(msg, 'error')
  );

  const update = (i, patch) => onChange((list) => list.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange((list) => list.filter((_, k) => k !== i));
  const move = (from, to) =>
    onChange((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });

  function addYoutube() {
    const id = youtubeId(yt.trim());
    if (!id) {
      notify?.('That doesn’t look like a YouTube link.', 'error');
      return;
    }
    onChange((list) => [...list, { id: newId(), type: 'youtube', url: `https://www.youtube.com/watch?v=${id}`, width: 16, height: 9, caption: '', layout: 'full' }]);
    setYt('');
  }

  return (
    <div>
      <Dropzone onFiles={upload} />
      <UploadQueue queue={queue} onClear={clearFailed} />

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input
          className="in"
          placeholder="Paste a YouTube link for a walkthrough video"
          value={yt}
          onChange={(e) => setYt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addYoutube();
            }
          }}
        />
        <button type="button" className="ab" onClick={addYoutube}>
          Add video link
        </button>
      </div>

      {items.length ? (
        <div className="media-grid">
          {items.map((it, i) => (
            <div
              key={it.id || it.url}
              className={`media-item${dragIndex === i ? ' dragging' : ''}${overIndex === i && dragIndex !== i ? ' drop-target' : ''}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex >= 0) move(dragIndex, i);
                setDragIndex(-1);
                setOverIndex(-1);
              }}
              onDragEnd={() => {
                setDragIndex(-1);
                setOverIndex(-1);
              }}
            >
              <div className="media-thumb" title="Drag to reorder">
                <MediaThumb item={it} />
                <div className="media-badges">
                  <span className="badge badge-dark">{String(i + 1).padStart(2, '0')}</span>
                  {it.type !== 'image' ? <span className="badge">{it.type === 'youtube' ? 'YouTube' : 'Video'}</span> : null}
                  {coverUrl && coverUrl === it.url ? <span className="badge badge-amber">Cover</span> : null}
                </div>
              </div>
              <div className="media-body">
                <input className="in" placeholder="Caption (optional)" value={it.caption || ''} onChange={(e) => update(i, { caption: e.target.value })} />
                <div className="media-tools">
                  <button type="button" className="ab ab-sm ab-icon" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move earlier">
                    ←
                  </button>
                  <button
                    type="button"
                    className="ab ab-sm ab-icon"
                    onClick={() => move(i, i + 1)}
                    disabled={i === items.length - 1}
                    aria-label="Move later"
                  >
                    →
                  </button>
                  {it.type === 'image' ? (
                    <>
                      <button
                        type="button"
                        className="ab ab-sm"
                        aria-pressed={it.layout === 'full'}
                        onClick={() => update(i, { layout: it.layout === 'full' ? 'auto' : 'full' })}
                        title="Show this photo across the full width"
                      >
                        {it.layout === 'full' ? '✓ Full width' : 'Full width'}
                      </button>
                      {coverUrl !== it.url ? (
                        <button type="button" className="ab ab-sm" onClick={() => onSetCover(it)}>
                          Set cover
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  <button type="button" className="ab ab-sm ab-danger" onClick={() => remove(i)} aria-label="Remove">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="hint" style={{ marginTop: 14 }}>
          No gallery media yet. Upload site photos, finished interiors, drone shots or short clips.
        </p>
      )}

      <LayoutPreview items={items} />
    </div>
  );
}
