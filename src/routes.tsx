// src/routes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

// Público
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminProjects from "./pages/admin/AdminProjects";
import ProjectForm from "./pages/admin/ProjectForm";

// ---- Guards ----
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="p-6">Cargando…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function NoAuthRoute({ children }: { children: JSX.Element }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="p-6">Cargando…</div>;
  return user ? <Navigate to="/admin" replace /> : children;
}

// ---- Definición de rutas ----
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/proyecto/:id" element={<ProjectDetail />} />
        <Route
          path="/login"
          element={
            <NoAuthRoute>
              <Login />
            </NoAuthRoute>
          }
        />

        {/* Admin (protegido) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard / inicio del panel */}
          <Route index element={<AdminHome />} />

          {/* Proyectos */}
          <Route path="proyectos" element={<AdminProjects />} />
          <Route path="proyectos/nuevo" element={<ProjectForm />} />
          <Route path="proyectos/editar/:id" element={<ProjectForm />} />
        </Route>

        {/* 404 → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
