'use client';

import { useState } from 'react';
import { youtubeId } from '@/lib/media';
import { Play } from './Icons';

/** Lightweight YouTube embed: shows a poster until the visitor presses play. */
export default function YouTube({ url, title = 'Project video' }) {
  const id = youtubeId(url);
  const [active, setActive] = useState(false);
  if (!id) return null;

  return (
    <div className="video-frame">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="yt-play frame frame-dark" onClick={() => setActive(true)} aria-label={`Play: ${title}`}>
          <img className="yt-poster" src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="yt-btn">
            <Play />
          </span>
        </button>
      )}
    </div>
  );
}
