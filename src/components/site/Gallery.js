'use client';

import { useMemo, useState } from 'react';
import Img from './Img';
import AutoVideo from './AutoVideo';
import YouTube from './YouTube';
import Lightbox from './Lightbox';
import { Play } from './Icons';
import { composeGallery } from '@/lib/gallery';
import { aspect } from '@/lib/media';

const ratioFor = (row, item) => {
  if (row.kind === 'pair') return row.portrait ? '4 / 5' : '4 / 3';
  if (row.kind === 'full') return `${Math.max(aspect(item), 1.25)}`;
  if (row.kind === 'split') return isFinite(aspect(item)) ? `${aspect(item)}` : '4 / 3';
  return `${aspect(item)}`;
};

const sizesFor = (row) => (row.kind === 'full' ? '100vw' : '(max-width: 700px) 100vw, 60vw');

export default function Gallery({ items, title }) {
  const rows = useMemo(() => composeGallery(items), [items]);
  const viewable = useMemo(() => items.filter((it) => it.type === 'image' || it.type === 'video'), [items]);
  const [open, setOpen] = useState(-1);
  let n = 0;

  if (!rows.length) return null;

  return (
    <div className="gallery">
      {rows.map((row, r) => {
        const cls =
          row.kind === 'split' ? `g-split-p${row.portraitIndex}` : row.kind === 'single' ? 'g-single' : row.kind === 'pair' ? 'g-pair' : 'g-full';
        return (
          <div key={r} className={`g-row ${cls}`}>
            {row.items.map((item, k) => {
              n += 1;
              const num = String(n).padStart(2, '0');
              const lbIndex = viewable.indexOf(item);
              return (
                <figure key={item.id || item.url} className="g-item" data-reveal="" style={{ '--d': `${k * 120}ms` }}>
                  {item.type === 'youtube' ? (
                    <YouTube url={item.url} title={item.caption || title} />
                  ) : item.type === 'video' ? (
                    <button
                      type="button"
                      className="g-open g-video-open"
                      onClick={() => setOpen(lbIndex)}
                      aria-label={`Play video ${num}: ${item.caption || title}`}
                    >
                      <span className="frame frame-dark" style={{ aspectRatio: ratioFor(row, item), pointerEvents: 'none' }} aria-hidden="true">
                        <AutoVideo item={item} label={item.caption || title} />
                        <span className="g-video-play"><Play size={20} /> Play video</span>
                      </span>
                    </button>
                  ) : (
                    <button type="button" className="g-open" onClick={() => setOpen(lbIndex)} aria-label={`Open image ${num}${item.caption ? `: ${item.caption}` : ''}`}>
                      <div className="frame" style={{ aspectRatio: ratioFor(row, item) }}>
                        <Img src={item.url} alt={item.caption || title} sizes={sizesFor(row)} />
                      </div>
                    </button>
                  )}
                  <figcaption>
                    <span>{num}</span>
                    {item.caption ? <span>{item.caption}</span> : null}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        );
      })}
      {open >= 0 ? <Lightbox items={viewable} index={open} onChange={setOpen} onClose={() => setOpen(-1)} title={title} /> : null}
    </div>
  );
}
