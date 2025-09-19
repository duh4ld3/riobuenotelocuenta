import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { Project } from './lib/types';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import { fetchAllData } from './lib/fetchAllData';

// ---- Contexto de datos que usa Home ----
type DataCtx = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchAll: (force?: boolean) => Promise<void>;
};

export const DataContext = createContext<DataCtx | null>(null);

// ---- Proveedor de datos ----
const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchAll = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      // Date.now() como cache-bust cuando force=true
      const data = await fetchAllData(force ? Date.now() : 0);
      setProjects(data);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(true);
    const id = setInterval(() => fetchAll(true), 300000); // 5 min
    return () => clearInterval(id);
  }, [fetchAll]);

  const value = useMemo<DataCtx>(
    () => ({
      projects,
      loading,
      error,
      lastUpdated,
      fetchAll,
    }),
    [projects, loading, error, lastUpdated, fetchAll]
  );

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
};

// ---- App con rutas ----
const App: React.FC = () => {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 🔴 corregido: debe ser plural para coincidir con tus Links */}
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DataProvider>
    </Router>
  );
};

export default App;
