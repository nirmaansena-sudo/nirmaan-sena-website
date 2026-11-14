'use client';

import { useEffect, useRef, useState } from 'react';

/** Counts the leading number of a value like "50+" or "24 h" up when it scrolls into view. */
export default function CountUp({ value, duration = 1600 }) {
  const ref = useRef(null);
  const match = String(value).match(/^(\D*)(\d+)(.*)$/);
  const [n, setN] = useState(match ? Number(match[2]) : null);

  useEffect(() => {
    if (!match) return;
    const target = Number(match[2]);
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setN(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {match[1]}
        {n}
        {match[3]}
      </span>
    </span>
  );
}
