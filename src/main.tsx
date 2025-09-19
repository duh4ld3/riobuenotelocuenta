import React from "react";
import ReactDOM from "react-dom/client";

// ✅ Importa Tailwind
import "./index.css";

// ✅ Luego tus estilos globales personalizados
import "./styles/globals.css";

// Leaflet
import "leaflet/dist/leaflet.css";

import AppRoutes from "./routes";
import { DataProvider } from "./context/DataContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DataProvider>
      <AppRoutes />
    </DataProvider>
  </React.StrictMode>
);
