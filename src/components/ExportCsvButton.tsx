import React from 'react';
import type { Project } from '../types';
import { projectToCsv } from '../lib/csv';

interface Props {
  project: Project;
}

/**
 * Botón para exportar los datos del proyecto a CSV.
 */
const ExportCsvButton: React.FC<Props> = ({ project }) => {
  const handleClick = () => {
    const csv = projectToCsv(project);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${project.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/30"
    >
      <span>Exportar CSV</span>
    </button>
  );
};

export default ExportCsvButton;