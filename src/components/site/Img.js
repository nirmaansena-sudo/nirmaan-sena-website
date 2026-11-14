'use client';

import { useEffect, useRef, useState } from 'react';
import { imageSrcSet, imageUrl } from '@/lib/media';

/**
 * Responsive image that fades in once loaded.
 * `sizes` should describe the rendered width, e.g. "(max-width: 800px) 100vw, 50vw".
 */
export default function Img({ src, alt = '', sizes = '100vw', width, height, priority = false, className = '', maxWidth, style }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  if (!src) return null;

  return (
    <img
      ref={ref}
      src={imageUrl(src, Math.min(maxWidth || 1920, 1920))}
      srcSet={imageSrcSet(src, undefined, maxWidth)}
      sizes={sizes}
      alt={alt}
      width={width || undefined}
      height={height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`img-fade${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      style={style}
    />
  );
}
