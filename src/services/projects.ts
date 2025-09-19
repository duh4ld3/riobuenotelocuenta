// src/services/projects.ts
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  query,
} from "firebase/firestore";

/* ========= Tipos ========= */
export type Estado = "pendiente" | "en-progreso" | "finalizado";

export type Project = {
  id: string;
  titulo: string;

  categoria?: string;
  fuente?: string;
  estado?: Estado;

  montoAsignado?: number;
  beneficiarios?: number;

  lat?: number;
  lng?: number;

  fechaInicio?: string;
  fechaFinEstimada?: string;

  proveedor?: string;
  observaciones?: string;

  portada?: string;     // URL principal
  fotos?: string[];     // URLs adicionales

  publicado?: boolean;

  creadoEn?: any;
  actualizadoEn?: any;
};

export type PhotoByMonth = { mes: string; urls: string[] };

/* ========= Helpers ========= */
const asString = (v: any): string => (typeof v === "string" ? v : v?.toString?.() || "");
const asNumber = (v: any): number => (typeof v === "number" ? v : Number(v ?? 0));
const asStringArray = (a: any): string[] =>
  Array.isArray(a) ? a.map(asString).filter((u) => u.trim().length > 0) : [];

/* ========= Primera foto para tarjetas ========= */
export function getFirstPhotoUrl(p?: Partial<Project> | null): string {
  if (!p) return "";
  const portada = asString(p.portada).trim();
  if (portada) return portada;
  const arr = asStringArray(p.fotos);
  return arr[0] || "";
}

/* ========= Normalizador ========= */
function docToProject(snapOrPlain: any): Project {
  const raw = typeof snapOrPlain?.data === "function"
    ? snapOrPlain.data()
    : snapOrPlain || {};
  const id = snapOrPlain?.id ?? raw?.id ?? "";

  const fotos = asStringArray(raw.fotos);
  const portada = asString(raw.portada) || (fotos.length > 0 ? fotos[0] : "");

  return {
    id: asString(id),
    titulo: asString(raw.titulo),

    categoria: asString(raw.categoria),
    fuente: asString(raw.fuente),
    estado: asString(raw.estado) as Estado,

    montoAsignado: asNumber(raw.montoAsignado),
    beneficiarios: asNumber(raw.beneficiarios),

    lat: typeof raw.lat === "number" ? raw.lat : Number(raw.lat ?? NaN),
    lng: typeof raw.lng === "number" ? raw.lng : Number(raw.lng ?? NaN),

    fechaInicio: asString(raw.fechaInicio),
    fechaFinEstimada: asString(raw.fechaFinEstimada),

    proveedor: asString(raw.proveedor),
    observaciones: asString(raw.observaciones),

    portada,
    fotos,

    publicado: !!raw.publicado,

    creadoEn: raw.createdAt ?? raw.creadoEn ?? null,
    actualizadoEn: raw.updatedAt ?? raw.actualizadoEn ?? null,
  };
}

/* ========= Lista de proyectos publicados ========= */
export async function listProjects(): Promise<Project[]> {
  const colRef = collection(db, "proyectos");

  try {
    const q = query(colRef, where("publicado", "==", true));
    const snap = await getDocs(q);
    const items = snap.docs.map(docToProject);
    return items.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } catch (e) {
    console.warn("[listProjects] fallo query publicado==true:", e);
  }

  try {
    const snapAll = await getDocs(colRef);
    const all = snapAll.docs.map(docToProject);
    const published = all.filter((p) => p.publicado === true);
    return published.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } catch (e) {
    console.error("[listProjects] fallo fallback:", e);
    return [];
  }
}

/* ========= Proyecto por ID ========= */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const ref = doc(db, "proyectos", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return docToProject(snap);
  } catch (e) {
    console.error("[getProjectById] error:", e);
    return null;
  }
}

/* ========= Fotos subcolección ========= */
export async function getProjectPhotosFromSubcollection(
  id: string
): Promise<string[]> {
  try {
    const colRef = collection(db, "proyectos", id, "fotos");
    const snap = await getDocs(colRef);
    const urls = snap.docs
      .map((d) => asString(d.data()?.src))
      .filter((u) => u.length > 0);
    return urls;
  } catch (e) {
    console.warn("[getProjectPhotosFromSubcollection] error:", e);
    return [];
  }
}

/* ========= Proyecto con fotos garantizadas ========= */
export async function getProjectByIdWithPhotos(
  id: string
): Promise<Project | null> {
  const base = await getProjectById(id);
  if (!base) return null;

  const fotosDoc = Array.isArray(base.fotos) ? base.fotos : [];
  const portadaDoc = asString(base.portada);

  if (portadaDoc || fotosDoc.length > 0) {
    return {
      ...base,
      portada: portadaDoc || fotosDoc[0] || "",
      fotos: fotosDoc.length > 0 ? fotosDoc : (portadaDoc ? [portadaDoc] : []),
    };
  }

  const sub = await getProjectPhotosFromSubcollection(id);
  if (sub.length > 0) {
    return { ...base, portada: sub[0], fotos: sub };
  }

  return { ...base, portada: "", fotos: [] };
}

/* ========= Fotos agrupadas por mes para carrusel ========= */
export async function getPhotosGroupedByMonth(id: string): Promise<PhotoByMonth[]> {
  try {
    const colRef = collection(db, "proyectos", id, "fotos");
    const snap = await getDocs(colRef);
    const map = new Map<string, string[]>();
    snap.docs.forEach((d) => {
      const { src = "", mes = "" } = d.data() as any;
      if (!src || !mes) return;
      if (!map.has(mes)) map.set(mes, []);
      map.get(mes)!.push(src);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, urls]) => ({ mes, urls }));
  } catch (e) {
    console.warn("[getPhotosGroupedByMonth] error:", e);
    return [];
  }
}
