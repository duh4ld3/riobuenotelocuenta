import React from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { formatCLP } from '../lib/format';
import { thumbnailImageUrl, PLACEHOLDER } from '../lib/images';

interface Props {
  project: Project;
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  // primera foto disponible (cualquier mes)
  const firstPhoto = project.meses.find((m) => m.fotos.length > 0)?.fotos[0];

  const imageUrl = firstPhoto?.src
    ? thumbnailImageUrl(firstPhoto.src, 400) // ⚡ miniatura optimizada
    : PLACEHOLDER;

  const alt = firstPhoto?.alt ?? 'Imagen de proyecto';

  const averageProgress = React.useMemo(() => {
    if (project.meses.length === 0) return 0;
    const total = project.meses.reduce((acc, m) => acc + m.avance, 0);
    return Math.round(total / project.meses.length);
  }, [project.meses]);

  const stateStyles: Record<string, string> = {
    Pendiente: 'bg-amber-500/20 text-amber-400',
    Trabajando: 'bg-sky-500/20 text-sky-400',
    Listo: 'bg-emerald-500/20 text-emerald-400',
  };
  const pillClass =
    project.estado && stateStyles[project.estado]
      ? stateStyles[project.estado]
      : 'bg-gray-500/20 text-gray-400';

  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg overflow-hidden shadow-md flex flex-col">
      <img
        src={imageUrl}
        alt={alt}
        className="h-40 w-full object-cover object-center"
        loading="lazy"
        onError={(e) => {
          if (e.currentTarget.src !== PLACEHOLDER) {
            e.currentTarget.src = PLACEHOLDER;
          }
        }}
      />
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex-1 pr-2 truncate">
            {project.titulo}
          </h2>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${pillClass}`}
            title={project.estado}
          >
            {project.estado}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-1">
          Monto asignado: {formatCLP(project.montoAsignado ?? 0)}
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Avance promedio: {averageProgress}%
        </p>
        <Link
          to={`/proyectos/${project.slug}`}
          className="mt-auto inline-block text-sm text-primary hover:underline focus-visible:underline"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
