import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página mostrada cuando el usuario navega a una ruta inexistente.
 */
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-2">404 - Página no encontrada</h1>
      <p className="mb-4">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className="text-primary underline">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;