import { Show } from './types';

export function parseTime(value: unknown): Date | null {
  if (!value) return null;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') return (value as { toDate: () => Date }).toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    // Prefer parsing ISO date/time strings into local Date components to avoid timezone shifts
    // Handle YYYY-MM-DD or YYYY-MM-DDTHH:MM(:SS)
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const dateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY
    const dmyDash4 = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY
    const dmyDash2 = /^\d{2}-\d{2}-\d{2}$/; // DD-MM-YY
    const dmySlash2 = /^\d{2}\/\d{2}\/\d{2}$/; // DD/MM/YY
    if (dateOnly.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (dateTime.test(value)) {
      const [datePart, timePart] = value.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm, ss] = (timePart.split(':').map(Number) as number[]).concat([0, 0]).slice(0, 3);
      return new Date(y, m - 1, d, hh, mm, ss);
    }
    // DD/MM/YYYY or DD-MM-YYYY
    if (dmySlash.test(value) || dmyDash4.test(value)) {
      const sep = value.indexOf('/') > -1 ? '/' : '-';
      const [dd, mm, yyyy] = value.split(sep).map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    // DD-MM-YY or DD/MM/YY -> expand two-digit year
    if (dmyDash2.test(value) || dmySlash2.test(value)) {
      const sep = value.indexOf('/') > -1 ? '/' : '-';
      const [dd, mm, yy] = value.split(sep).map(Number);
      const yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
      return new Date(yyyy, mm - 1, dd);
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    const asNum = Number(value);
    if (!isNaN(asNum)) return new Date(asNum);
  }
  return null;
}

export function formatKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function normalizeDateToISO(dateStr: unknown) {
  if (!dateStr) return '';
  if (typeof dateStr !== 'string') return '';
  // YYYY-MM-DD
  const isoY = /^\d{4}-\d{2}-\d{2}$/;
  if (isoY.test(dateStr)) return dateStr;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
  const dmy2 = /^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/; // dd-mm-yy
  let m = dateStr.match(dmy);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  m = dateStr.match(dmy2);
  if (m) {
    const [, dd, mm, yy] = m;
    // interpret 2-digit year: 00-49 => 2000-2049, 50-99 => 1950-1999
    const y = Number(yy);
    const yyyy = y < 50 ? 2000 + y : 1900 + y;
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

export function isActive(s: Show, now: Date) {
  const start = s.start.getTime();
  const end = s.end ? s.end.getTime() : start + 1000 * 60 * 60 * 2;
  const t = now.getTime();
  return t >= start && t <= end;
}