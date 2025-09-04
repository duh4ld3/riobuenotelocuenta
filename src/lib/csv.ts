// src/lib/csv.ts
import type { Project } from '../types';

export function projectToCsv(project: Project): string {
  const header = [
    'id','slug','titulo','categoria','estado','montoAsignado','beneficiarios',
    'lat','lng','inicio','finEstimada','proveedor','observaciones',
    'mes','avance','ejecutadoMes','resumen','eventos'
  ];

  const base = [
    project.id,
    project.slug,
    project.titulo,
    project.categoria ?? '',
    project.estado ?? '',
    project.montoAsignado ?? '',
    project.beneficiarios ?? '',
    project.lat ?? '',
    project.lng ?? '',
    project.inicio ?? '',
    project.finEstimada ?? '',
    project.proveedor ?? '',
    project.observaciones ?? ''
  ];

  const rows = (project.meses?.length ? project.meses : [undefined]).map((m) => {
    const mes = m?.mes ?? '';
    const avance = m?.avance ?? '';
    const ejecutadoMes = m?.ejecutadoMes ?? '';
    const resumen = m?.resumen ?? '';
    const eventos = m?.eventos ?? '';
    return [...base, mes, avance, ejecutadoMes, resumen, eventos]
      .map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v)
      .join(',');
  });

  return header.join(',') + '\n' + rows.join('\n');
}
