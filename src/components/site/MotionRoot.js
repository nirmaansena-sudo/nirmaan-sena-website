'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Adds `is-in` to every [data-reveal] element as it scrolls into view.
 * One observer for the whole page; re-scans on navigation and DOM changes.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    window.__nsMotion = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) el.classList.add('is-in');
        else io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
