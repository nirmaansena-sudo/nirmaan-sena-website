'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { imageUrl, videoPoster, videoUrl } from '@/lib/media';
import { ArrowLeft, ArrowRight, Close } from './Icons';

export default function Lightbox({ items, index, onChange, onClose, title }) {
  const item = items[index];
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const touch = useRef(null);

  const go = useCallback((d) => {
    if (items.length > 1) onChange((index + d + items.length) % items.length);
  }, [index, items.length, onChange]);

  // Render outside page animations and their stacking contexts, after hydration.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const prevFocus = document.activeElement;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = prevOverflow;
      if (prevFocus?.isConnected) prevFocus.focus?.({ preventScroll: true });
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // Native video controls use these keys to seek through the clip.
        if (e.target instanceof HTMLMediaElement) return;
        e.preventDefault();
        go(e.key === 'ArrowRight' ? 1 : -1);
      }
      else if (e.key === 'Tab' && dialogRef.current) {
        // Keep keyboard focus inside the gallery while it is open.
        const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), video[controls]')]
          .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
        if (!controls.length) {
          e.preventDefault();
          dialogRef.current.focus();
          return;
        }
        const i = controls.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          controls[controls.length - 1].focus();
        } else if (!e.shiftKey && (i === -1 || i === controls.length - 1)) {
          e.preventDefault();
          controls[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose, mounted]);

  // Preload neighbours for instant navigation.
  useEffect(() => {
    [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]].forEach((it) => {
      if (it?.type === 'image') {
        const img = new Image();
        img.src = imageUrl(it.url, 2400);
      }
    });
  }, [index, items]);

  if (!mounted || !item) return null;

  return createPortal(
    <div ref={dialogRef} className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} — gallery`} tabIndex={-1}>
      <div className="lb-top">
        <span>{title}</span>
        <button ref={closeRef} type="button" className="lb-btn" onClick={onClose} aria-label="Close gallery">
          <Close />
        </button>
      </div>
      <div
        className="lb-stage"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => {
          if (e.target.closest?.('video, button')) {
            touch.current = null;
            return;
          }
          const start = e.touches[0];
          touch.current = start ? { x: start.clientX, y: start.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          const end = e.changedTouches[0];
          touch.current = null;
          if (!start || !end) return;
          const dx = end.clientX - start.x;
          const dy = end.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        }}
        onTouchCancel={() => (touch.current = null)}
      >
        {item.type === 'video' ? (
          <video key={item.url} src={videoUrl(item.url)} poster={videoPoster(item) || undefined} controls autoPlay playsInline tabIndex={0} />
        ) : (
          <img key={item.url} src={imageUrl(item.url, 2400)} alt={item.caption || title} />
        )}
        {items.length > 1 ? (
          <>
            <button type="button" className="lb-btn lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous">
              <ArrowLeft />
            </button>
            <button type="button" className="lb-btn lb-nav lb-next" onClick={() => go(1)} aria-label="Next">
              <ArrowRight />
            </button>
          </>
        ) : null}
      </div>
      <div className="lb-bottom">
        <span>{item.caption}</span>
        <span aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
      </div>
    </div>,
    document.body
  );
}
