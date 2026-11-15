import Link from 'next/link';

const originalLogo = '/brand/nirmaan-sena-original.png';

// Display the supplied artwork directly, without redrawing the brand mark.
export function LogoMark({ className = 'brand-mark', title }) {
  return (
    <svg className={className} viewBox="140 48 390 290" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title ? <title>{title}</title> : null}
      <svg x="140" y="48" width="390" height="290" viewBox="140 48 390 290" overflow="hidden">
        <image href={originalLogo} width="640" height="640" />
      </svg>
    </svg>
  );
}

export function Brand({ onClick, stacked = false }) {
  return (
    <Link href="/" className={`brand${stacked ? ' brand--stacked' : ''}`} aria-label="Nirmaan Sena — home" onClick={onClick}>
      {stacked ? (
        <img className="brand-original" src={originalLogo} width="640" height="640" alt="" />
      ) : (
        <>
          <LogoMark />
          <svg className="brand-wordmark" viewBox="12 365 620 185" aria-hidden="true" focusable="false">
            <image href={originalLogo} width="640" height="640" />
          </svg>
        </>
      )}
    </Link>
  );
}
