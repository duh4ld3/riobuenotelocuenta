// src/lib/images.ts

/** Extrae el ID de Google Drive desde varias formas de enlace */
export function extractDriveId(u: string): string | null {
  const s = String(u ?? '').trim();

  // /file/d/<ID>/view
  let m = s.match(/drive\.google\.com\/file\/d\/([^/]+)(?:\/|$)/i);
  if (m?.[1]) return m[1];

  // open?id=<ID>
  m = s.match(/drive\.google\.com\/open\?[^#]*\bid=([^&#]+)/i);
  if (m?.[1]) return m[1];

  // uc?export=view&id=<ID>  o  uc?id=<ID>
  m = s.match(/drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&#]+)/i);
  if (m?.[1]) return m[1];

  return null;
}

/** Candidatos de URL para un ID de Drive (orden de prueba) */
export function driveImageCandidates(id: string): string[] {
  return [
    // vista directa
    `https://drive.google.com/uc?export=view&id=${id}`,
    // miniaturas de buen rendimiento en el CDN de Google
    `https://lh3.googleusercontent.com/d/${id}=w2000-no`,
    // “thumbnail” API
    `https://drive.google.com/thumbnail?id=${id}&sz=w2000`,
  ];
}

/** Normaliza enlaces de Drive/Dropbox/otros a una URL usable por <img> */
export function normalizeImageUrl(url: string): string {
  const u = (url ?? '').trim();
  if (!u) return u;

  const id = extractDriveId(u);
  if (id) {
    // preferimos la vista directa (suele evitar 403 si el archivo es público)
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  // Dropbox: fuerza descarga/visualización directa
  if (/https?:\/\/www\.dropbox\.com\//i.test(u)) {
    // raw=1 muestra como imagen; si ya hay query, añadimos &raw=1
    const hasQuery = u.includes('?');
    const base = u.replace(/(\?|&)dl=\d/i, '').replace(/[?&]$/, '');
    return base + (hasQuery ? '&raw=1' : '?raw=1');
  }

  // genérico: tal cual
  return u;
}

/**
 * Genera una URL de miniatura (cuando el proveedor lo permite).
 * Si no podemos generar una miniatura específica, devolvemos una normalizada.
 */
export function thumbnailImageUrl(url: string, width = 600): string {
  const u = (url ?? '').trim();
  if (!u) return u;

  const id = extractDriveId(u);
  if (id) {
    // CDN lh3 con tamaño deseado
    const w = Math.max(64, Math.min(4096, Math.floor(width)));
    return `https://lh3.googleusercontent.com/d/${id}=w${w}-no`;
  }

  if (/https?:\/\/www\.dropbox\.com\//i.test(u)) {
    // En Dropbox no hay “thumbnail service” estable → usamos versión raw
    return normalizeImageUrl(u);
  }

  // Genérico (servidores propios, S3, etc.)
  return normalizeImageUrl(u);
}

export const PLACEHOLDER = '/img/placeholders/placeholder1.jpg';
