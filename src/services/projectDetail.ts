// src/services/projectDetail.ts
import {
  collection, doc, getDoc, getDocs, orderBy, query, where,
} from "firebase/firestore";
import { db } from "../firebase";

export type AvanceMes = {
  mes: string;          // "2025-09"
  porcentaje: number;   // 0 - 100
  nota?: string;        // texto opcional
  createdAt?: any;
  updatedAt?: any;
};

export type Foto = {
  id: string;
  mes?: string;         // "2025-09"
  src: string;
  alt?: string;
  createdAt?: any;
};

export type ProjectDetail = {
  id: string;
  titulo: string;
  categoria?: string;
  estado?: string;
  fuente?: string;
  montoAsignado?: number;
  proveedor?: string;
  observaciones?: string;
  lat?: number; lng?: number;
  publicado?: boolean;
  // colecciones
  avances: AvanceMes[];
  fotos: Foto[];
};

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const ref = doc(db, "proyectos", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const d = snap.data() || {};
  const base = {
    id: snap.id,
    titulo: String(d.titulo ?? ""),
    categoria: d.categoria ?? "",
    estado: d.estado ?? "",
    fuente: d.fuente ?? "",
    montoAsignado: Number(d.montoAsignado ?? 0),
    proveedor: d.proveedor ?? "",
    observaciones: d.observaciones ?? "",
    lat: typeof d.lat === "number" ? d.lat : undefined,
    lng: typeof d.lng === "number" ? d.lng : undefined,
    publicado: Boolean(d.publicado ?? d.published ?? false),
  };

  // Avances: subcolección /avances/{YYYY-MM}
  const qa = query(collection(ref, "avances"), orderBy("mes", "asc"));
  const sa = await getDocs(qa);
  const avances: AvanceMes[] = sa.docs.map(s => {
    const v = s.data() || {};
    return {
      mes: String(v.mes ?? s.id),
      porcentaje: Math.max(0, Math.min(100, Number(v.porcentaje ?? 0))),
      nota: v.nota ?? "",
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  });

  // Fotos: subcolección /fotos
  const qf = query(collection(ref, "fotos"), orderBy("mes", "asc"));
  const sf = await getDocs(qf);
  const fotos: Foto[] = sf.docs.map(s => {
    const v = s.data() || {};
    return {
      id: s.id,
      mes: v.mes ?? "",
      src: String(v.src ?? ""),
      alt: v.alt ?? base.titulo,
      createdAt: v.createdAt,
    };
  });

  return { ...base, avances, fotos };
}

/** Agrupa fotos por mes. */
export function groupFotosByMes(fotos: Foto[]): Record<string, Foto[]> {
  return fotos.reduce<Record<string, Foto[]>>((acc, f) => {
    const m = f.mes || "sin-mes";
    acc[m] = acc[m] || [];
    acc[m].push(f);
    return acc;
  }, {});
}
