import React from 'react';

/**
 * Muestra un esqueleto animado para indicar carga. Puede usarse para
 * representar tarjetas de proyectos mientras se esperan los datos.
 */
const Skeleton: React.FC = () => {
  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg shadow animate-pulse p-4">
      <div className="h-40 w-full bg-darkBorder rounded mb-4"></div>
      <div className="h-4 bg-darkBorder rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-darkBorder rounded w-1/2"></div>
    </div>
  );
};

export default Skeleton;