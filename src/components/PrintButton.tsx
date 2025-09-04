import React from 'react';

/**
 * Botón para imprimir la vista actual utilizando window.print(). Se
 * oculta durante la impresión para no aparecer en el resultado.
 */
const PrintButton: React.FC = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      🖨️
      <span>Imprimir</span>
    </button>
  );
};

export default PrintButton;