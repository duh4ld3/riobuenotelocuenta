import React from 'react';

interface Props {
  title: string;
  value: string;
}

/**
 * Muestra una métrica clave (KPI) con un título y un valor destacado.
 */
const KPICard: React.FC<Props> = ({ title, value }) => {
  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-4 flex flex-col justify-between shadow">
      <span className="text-sm text-gray-400 mb-1">{title}</span>
      <span className="text-xl font-semibold text-primary">{value}</span>
    </div>
  );
};

export default KPICard;