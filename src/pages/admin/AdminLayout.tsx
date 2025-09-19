// src/pages/admin/AdminLayout.tsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

// Pequeño helper para formatear la fecha del header
function formatDate(d = new Date()) {
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function NavItem({
  to,
  label,
  disabled,
  exact,
}: {
  to: string;
  label: string;
  disabled?: boolean;
  exact?: boolean; // <— solo “Inicio” lo usa
}) {
  if (disabled) {
    return (
      <div className="px-3 py-2 rounded-lg text-slate-400 cursor-not-allowed select-none flex items-center justify-between">
        {label}
        <span className="text-[10px] uppercase tracking-wider">Próx.</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={!!exact}
      className={({ isActive }) =>
        [
          "block px-3 py-2 rounded-lg transition",
          isActive
            ? "bg-white text-slate-900"
            : "text-slate-200 hover:bg-white/10",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      alert("No se pudo cerrar sesión. Intenta nuevamente.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Layout: sidebar fijo + contenido */}
      <div className="grid grid-cols-[260px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="bg-[#0e1726] text-white flex flex-col">
          {/* Brand */}
          <div className="h-16 flex items-center px-4 border-b border-white/10">
            <div className="text-lg font-semibold tracking-wide">
              <span className="opacity-70">Admin</span>{" "}
              <span className="text-sky-300">Río Bueno</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 space-y-1 flex-1">
            <NavItem to="/admin" label="Inicio" exact />
            <NavItem to="/admin/proyectos" label="Proyectos" />
            <NavItem to="/admin/documentos" label="Documentos" disabled />
          </nav>

          {/* Footer: Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-white/10 hover:bg-white/15 text-white px-3 py-2 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <section className="flex flex-col">
          {/* Header superior */}
          <header className="h-16 bg-white border-b flex items-center">
            <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-slate-900">
                Panel de administración
              </h1>
              <div className="text-sm text-slate-500">{formatDate()}</div>
            </div>
          </header>

          {/* Área principal (Outlet) */}
          <main className="flex-1">
            <div className="w-full max-w-6xl mx-auto p-6">
              {/* Sugerencia: usa la clase `card` en tus vistas para tarjetas unificadas */}
              <Outlet />
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
