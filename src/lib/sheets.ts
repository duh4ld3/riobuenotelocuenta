import Papa from 'papaparse';

export type Row = Record<string, string>;

export async function parseCsvText<T extends Row = Row>(text: string): Promise<T[]> {
  const { data } = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return data;
}

/** Descarga y parsea CSV de una URL; si falla, intenta fallback local. */
export async function fetchCsv<T extends Row = Row>(url: string, fallback: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return await parseCsvText<T>(await res.text());
  } catch (_e1) {
    try {
      const res = await fetch(fallback, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} en fallback ${fallback}`);
      return await parseCsvText<T>(await res.text());
    } catch (e2) {
      throw new Error(
        `No se pudo cargar CSV:\n- URL: ${url}\n- Fallback: ${fallback}\nDetalle final: ${(e2 as Error).message}`
      );
    }
  }
}
