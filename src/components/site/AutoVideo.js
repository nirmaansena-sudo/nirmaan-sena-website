'use client';

import { useEffect, useRef } from 'react';
import { videoPoster, videoUrl } from '@/lib/media';

/** Muted, looping video that only plays while on screen. */
export default function AutoVideo({ item, className = '', label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={videoUrl(item.url)}
      poster={videoPoster(item) || undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label || item.caption || 'Project video'}
    />
  );
}
