// Tipos únicos para todo el proyecto: usa SIEMPRE estos.

export interface Photo {
  src: string;
  alt?: string;
  mes?: string;
}

export interface EventEntry {
  fecha: string; // "YYYY-MM-DD" o ISO
  texto: string; // descripción del evento
}

export interface MonthEntry {
  mes: string;               // "YYYY-MM"
  avance: number;            // 0..100
  ejecutadoMes: number;      // CLP del mes
  resumen?: string;
  eventos: EventEntry[];     // array de objetos
  fotos: Photo[];            // fotos del mes
}

export interface Project {
  id: string;
  slug: string;
  titulo: string;
  categoria?: string;
  fuente?: string;
  estado?: string;           // si quieres, cámbialo a union 'Pendiente' | 'Trabajando' | 'Listo'
  montoAsignado?: number;
  beneficiarios?: string;    // si los guardas como número, cambia a number
  lat?: number;
  lng?: number;
  inicio?: string;
  finEstimada?: string;
  proveedor?: string;
  observaciones?: string;
  meses: MonthEntry[];       // siempre presente (vacío si no hay)
}
