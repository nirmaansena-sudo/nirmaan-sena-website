// Formatting helpers that are safe to use in both server and client components.

export const formatArea = (n) => (n ? `${Number(n).toLocaleString('en-IN')} sq ft` : '');

export function formatDate(iso, withTime = false) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    timeZone: 'Asia/Kolkata',
  });
}

export const pad2 = (n) => String(n).padStart(2, '0');
