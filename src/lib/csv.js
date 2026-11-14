// CSV export for enquiries.
// Cells that start with = + - @ (or a tab/return) are prefixed with an apostrophe so
// spreadsheet apps treat them as text, not formulas ("CSV injection").

const COLUMNS = ['reference', 'createdAt', 'status', 'name', 'phone', 'whatsapp', 'email', 'locality', 'projectType', 'services', 'area', 'timeline', 'message', 'note'];

export function csvCell(value) {
  let s = Array.isArray(value) ? value.join('; ') : value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(rows, columns = COLUMNS) {
  return [columns.join(','), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(','))].join('\r\n');
}
