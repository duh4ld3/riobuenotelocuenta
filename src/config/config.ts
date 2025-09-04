// src/config/config.ts

// URLs de las 3 hojas publicadas como CSV (definidas en .env)
export const SHEET_PROY = import.meta.env.VITE_CSV_PROYECTOS || '';
export const SHEET_MESES = import.meta.env.VITE_CSV_MESES || '';
export const SHEET_FOTOS = import.meta.env.VITE_CSV_FOTOS || '';

/**
 * Verifica que todas las variables estén definidas,
 * lanza un error claro en consola si falta alguna.
 */
export function verifyConfig() {
  const missing: string[] = [];
  if (!SHEET_PROY) missing.push('VITE_CSV_PROYECTOS');
  if (!SHEET_MESES) missing.push('VITE_CSV_MESES');
  if (!SHEET_FOTOS) missing.push('VITE_CSV_FOTOS');

  if (missing.length > 0) {
    throw new Error(
      `[Config] Faltan variables de entorno: ${missing.join(', ')}.
Asegúrate de definirlas en tu archivo .env y reinicia con "npm run dev".`
    );
  }
}
