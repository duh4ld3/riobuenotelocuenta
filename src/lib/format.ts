// Utilidades de formato (sin dependencias externas)

const clpFmt = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

/** Formatea números a CLP; si viene undefined/NaN, usa 0 */
export function formatCLP(value?: number | null): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return clpFmt.format(Math.round(n));
}

/** Parser flexible: acepta YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM */
function parseFlexibleDate(input?: string): Date | null {
  if (!input) return null;
  const s = String(input).trim();
  let m: RegExpMatchArray | null;

  // YYYY-MM-DD o YYYY/MM/DD
  m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  // DD/MM/YYYY o DD-MM-YYYY
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  // YYYY-MM (toma día 1)
  m = s.match(/^(\d{4})-(\d{1,2})$/);
  if (m) {
    const [, y, mo] = m;
    const date = new Date(Number(y), Number(mo) - 1, 1);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  // Fallback: intenta con Date nativo
  const dflt = new Date(s);
  return Number.isNaN(dflt.valueOf()) ? null : dflt;
}

/** Devuelve "dd MMM yyyy" en es-CL o cadena vacía si no se puede parsear */
export function formatDate(v?: string): string {
  const d = parseFlexibleDate(v);
  if (!d) return '';
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Para "YYYY-MM" devuelve "MMM yyyy" (ej: "sep 2025") */
export function monthLabel(yyyyMm?: string): string {
  const d = parseFlexibleDate(yyyyMm);
  if (!d) return '';
  return d.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
}
