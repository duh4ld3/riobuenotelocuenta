import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Punto de entrada de la aplicación. Renderiza el componente raíz dentro del
// elemento con id="root" definido en index.html. Se usa StrictMode para
// ayudar a detectar problemas potenciales durante el desarrollo.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);