import Papa from 'papaparse';
import type { Project, MonthEntry, Photo, EventEntry } from '../types';
import { SHEET_PROY, SHEET_MESES, SHEET_FOTOS, verifyConfig } from '../config/config';
import { normalizeImageUrl } from './images';

type AnyRow = Record<string, string | undefined>;

/* ---------------- Utils ---------------- */

/** Convierte string → número manejando CLP, miles y decimales en cualquier formato */
function safeNum(v: string | undefined | null, def = 0): number {
  if (v == null) return def;

  // quita espacios normales y duros, y todo lo que no sea dígito, coma, punto o signo
  let s = String(v)
    .trim()
    .replace(/[\s\u00A0]/g, '')
    .replace(/[^\d.,-]/g, '');

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    // ambos presentes → el ÚLTIMO símbolo suele ser el decimal
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // decimal = coma (1.234.567,89)
      s = s.replace(/\./g, ''); // quita miles
      s = s.replace(/,/g, '.'); // coma → punto decimal
    } else {
      // decimal = punto (1,234,567.89)
      s = s.replace(/,/g, '');  // quita miles
      // dejamos el punto como decimal
    }
  } else if (hasComma) {
    // solo coma presente: si se ve como miles, la quitamos; si no, es decimal
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(/,/g, '.');
  } else if (hasDot) {
    // solo punto presente: si se ve como miles, lo quitamos
    s = /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s;
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : def;
}

function normKey(k: string): string {
  return k
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function pick(row: AnyRow, keys: string[]): string {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    map[normKey(k)] = v ?? '';
  }
  for (const k of keys) {
    const v = map[normKey(k)];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
}

/** Busca número: si no encuentra por claves, escanea cualquier columna que contenga 'monto' o 'presupuesto'. */
function pickNum(row: AnyRow, preferred: string[], def = 0): number {
  const direct = pick(row, preferred);
  const n = safeNum(direct, NaN);
  if (Number.isFinite(n)) return n;

  for (const [k, v] of Object.entries(row)) {
    const nk = normKey(k);
    if (/monto|presupuesto/.test(nk)) {
      const n2 = safeNum(v, NaN);
      if (Number.isFinite(n2)) return n2;
    }
  }
  return def;
}

async function parseCsvText<T>(text: string): Promise<T[]> {
  const { data } = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      h
        .replace(/^\uFEFF/, '') // <-- BOM FIX: quita BOM del primer encabezado
        .trim(),
  });
  return data as T[];
}

async function fetchCsv<T>(url: string, fallback: string): Promise<T[]> {
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

/* --------------- Fetch + Merge --------------- */

export async function fetchAllData(cb: number = 0): Promise<Project[]> {
  verifyConfig();

  const cbParam = cb ? (SHEET_PROY.includes('?') ? `&cb=${cb}` : `?cb=${cb}`) : '';
  const proyUrl  = `${SHEET_PROY}${cbParam}`;
  const mesesUrl = `${SHEET_MESES}${cbParam}`;
  const fotosUrl = `${SHEET_FOTOS}${cbParam}`;

  // DEBUG: descomenta si quieres ver qué URLs usa
  // console.log('[CSV] PROY:', proyUrl);
  // console.log('[CSV] MESES:', mesesUrl);
  // console.log('[CSV] FOTOS:', fotosUrl);

  const [proys, meses, fotos] = await Promise.all([
    fetchCsv<AnyRow>(proyUrl,  '/offline-data/proyectos.csv'),
    fetchCsv<AnyRow>(mesesUrl,  '/offline-data/meses.csv'),
    fetchCsv<AnyRow>(fotosUrl, '/offline-data/fotos.csv'),
  ]);

  // DEBUG fuerte: imprime headers y primera fila tal cual llegan
  if (proys && proys.length) {
    // console.log('[DBG] Headers PROY:', Object.keys(proys[0]));
    // console.log('[DBG] First row PROY:', proys[0]);
  }
  if (meses && meses.length) {
    // console.log('[DBG] Headers MESES:', Object.keys(meses[0]));
    // console.log('[DBG] First row MESES:', meses[0]);
  }

  // Fotos por (idProyecto|mes)
  const fotosByKey = new Map<string, Photo[]>();
  for (const f of fotos) {
    const idProyecto = pick(f, ['idProyecto', 'id_proyecto', 'id proyecto', 'id']).trim();
    const mes        = pick(f, ['mes', 'month', 'periodo']).trim();
    const srcRaw     = pick(f, ['src', 'url', 'foto', 'imagen', 'link']).trim();
    if (!idProyecto || !mes || !srcRaw) continue;

    const src = normalizeImageUrl(srcRaw);
    const alt = pick(f, ['alt', 'texto', 'descripcion', 'descripción', 'caption']).trim();

    const key = `${idProyecto}|${mes}`;
    const arr = fotosByKey.get(key) ?? [];
    arr.push({ src, alt });
    fotosByKey.set(key, arr);
  }

  // Meses por proyecto
  const mesesByProy = new Map<string, MonthEntry[]>();
  for (const row of meses) {
    const idProyecto   = pick(row, ['idProyecto', 'id_proyecto', 'id proyecto', 'id']).trim();
    const mes          = pick(row, ['mes', 'month', 'periodo']).trim();
    if (!idProyecto || !mes) continue;

    const avance       = Math.max(0, Math.min(100, safeNum(pick(row, ['avance', 'porcentaje', '%', 'avance%']), 0)));
    const ejecutadoMes = safeNum(pick(row, ['ejecutadoMes', 'ejecutado_mes', 'ejecutado mes', 'ejecutado']), 0);

    const resumen      = pick(row, ['resumen', 'nota', 'comentario']).trim();
    const eventosStr   = pick(row, ['eventos', 'eventos_mes', 'eventos mes']).trim();

    const eventos: EventEntry[] = [];
    if (eventosStr) {
      eventosStr.split(';').forEach((part) => {
        const [fecha, ...rest] = part.split(':');
        const texto = rest.join(':');
        if (fecha && texto) eventos.push({ fecha: fecha.trim(), texto: texto.trim() });
      });
    }

    const monthEntry: MonthEntry = {
      mes,
      avance,
      ejecutadoMes,
      resumen,
      eventos,
      fotos: fotosByKey.get(`${idProyecto}|${mes}`) ?? [],
    };

    const arr = mesesByProy.get(idProyecto) ?? [];
    arr.push(monthEntry);
    mesesByProy.set(idProyecto, arr);
  }

  // Proyectos
  const projects: Project[] = [];
  for (const p of proys) {
    const id            = pick(p, ['id']).trim();
    if (!id) continue;

    const slug          = pick(p, ['slug']).trim();
    const titulo        = pick(p, ['titulo', 'título', 'nombre', 'proyecto']).trim();
    const categoria     = pick(p, ['categoria', 'categoría', 'rubro']).trim();
    const fuente        = pick(p, ['fuente', 'origen']).trim();
    const estado        = pick(p, ['estado', 'situacion', 'situación']).trim();

    // usa pickNum con fallback; junto a safeNum nuevo, debe dejar de ser 0
    const montoAsignado = pickNum(p, [
      'montoAsignado', 'monto_asignado', 'monto asignado',
      'presupuesto', 'presupuesto total', 'presupuesto (clp)', 'presupuesto(clp)'
    ], 0);

    const beneficiarios = pick(p, ['beneficiarios', 'benef']).trim();
    const lat           = safeNum(pick(p, ['lat', 'latitud']), 0);
    const lng           = safeNum(pick(p, ['lng', 'long', 'longitud']), 0);
    const inicio        = pick(p, ['inicio', 'fecha inicio', 'fecha_inicio']).trim();
    const finEstimada   = pick(p, ['finEstimada', 'fin estimada', 'fecha fin', 'fecha_fin', 'termino', 'término']).trim();
    const proveedor     = pick(p, ['proveedor', 'contratista']).trim();
    const observaciones = pick(p, ['observaciones', 'obs', 'comentarios']).trim();

    // console.log('[DBG] Proyecto', id, { raw: p['montoAsignado'], montoAsignado });

    const project: Project = {
      id,
      slug,
      titulo,
      categoria,
      fuente,
      estado,
      montoAsignado,
      beneficiarios,
      lat,
      lng,
      inicio,
      finEstimada,
      proveedor,
      observaciones,
      meses: mesesByProy.get(id) ?? [],
    };

    project.meses.sort((a, b) => a.mes.localeCompare(b.mes));
    projects.push(project);
  }

  // console.log('[DBG] Projects final sample:', projects.slice(0, 2));
  return projects;
}
