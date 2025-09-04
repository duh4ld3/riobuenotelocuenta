import React from 'react';

interface Props {
  onClick: () => void;
}

/**
 * Botón que fuerza la sincronización de datos desde Google Sheets. Al
 * pulsarlo se añade un parámetro cache bust a las URL de descarga para
 * evitar resultados en caché.
 */
const SyncButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-print inline-flex items-center gap-2 rounded-md bg-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      🔄
      <span>Sincronizar</span>
    </button>
  );
};

export default SyncButton;