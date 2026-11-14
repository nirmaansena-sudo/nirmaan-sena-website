import Link from 'next/link';

/**
 * Nirmaan Sena mark: a colonnade on a stepped plinth, set on drafting lines.
 * Drawn as vector so it stays sharp at every size. Uses currentColor.
 */
export function LogoMark({ className = 'brand-mark', title }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M3 12.5h42M9.5 4v40M38.5 4v40" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <path d="M11 12.5L24 5.5l13 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" />
      <rect x="10.5" y="13.5" width="27" height="3" fill="currentColor" />
      <rect x="13" y="18.5" width="3" height="13" fill="currentColor" />
      <rect x="19.5" y="18.5" width="3" height="13" fill="currentColor" />
      <rect x="25.5" y="18.5" width="3" height="13" fill="currentColor" />
      <rect x="32" y="18.5" width="3" height="13" fill="currentColor" />
      <rect x="10.5" y="33" width="27" height="3" fill="currentColor" />
      <rect x="7.5" y="37.5" width="33" height="3" fill="currentColor" />
    </svg>
  );
}

export function Brand({ onClick }) {
  return (
    <Link href="/" className="brand" aria-label="Nirmaan Sena — home" onClick={onClick}>
      <LogoMark />
      <span className="brand-word">
        <strong>
          NIRMAAN <span>SENA</span>
        </strong>
        <small>Neev se nirmaan tak</small>
      </span>
    </Link>
  );
}
