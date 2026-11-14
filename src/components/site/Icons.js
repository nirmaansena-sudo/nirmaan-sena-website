// Thin-line icon set, drawn to match the typography.

export function ArrowRight({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M1 8h13.2M9.2 3l5 5-5 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3.5 12.5l9-9M5 3.5h7.5V11" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ArrowLeft({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M15 8H1.8M6.8 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Close({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Check({ size = 12, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Play({ size = 22, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

export function WhatsApp({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.74C5.8.74.72 5.82.72 12.07c0 2 .52 3.95 1.52 5.66L.62 23.62l6.03-1.58a11.3 11.3 0 0 0 5.4 1.38h.01c6.24 0 11.32-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.02z" />
    </svg>
  );
}

export function Phone({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5.6 1.8H3.2c-.7 0-1.3.6-1.2 1.3.6 5.7 5.1 10.2 10.8 10.8.7.1 1.3-.5 1.3-1.2v-2.4l-2.7-1.2-1.6 1.6a8.6 8.6 0 0 1-3.8-3.8l1.6-1.6L5.6 1.8z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
