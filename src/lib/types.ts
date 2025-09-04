/**
 * Definiciones de tipos para los datos del portal. Los proyectos se
 * componen de entradas mensuales con métricas y fotografías.
 */

export interface Photo {
  src: string;
  alt: string;
}

export interface EventEntry {
  fecha: string;
  texto: string;
}

export interface MonthEntry {
  /** Mes en formato YYYY-MM */
  mes: string;
  /** Avance porcentual de 0 a 100 */
  avance: number;
  /** Monto ejecutado ese mes (CLP) */
  ejecutadoMes: number;
  /** Resumen textual de las actividades del mes */
  resumen: string;
  /** Lista de eventos (fecha y texto) */
  eventos: EventEntry[];
  /** Fotos asociadas al mes */
  fotos: Photo[];
}

export interface Project {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  fuente: string;
  estado: string;
  montoAsignado: number;
  beneficiarios: String;
  lat: number;
  lng: number;
  inicio: string;
  finEstimada: string;
  proveedor: string;
  observaciones: string;
  meses: MonthEntry[];
}

export interface DataState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchAll: (useCacheBust?: boolean) => Promise<void>;
}