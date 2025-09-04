import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import ProjectDetail from './routes/ProjectDetail';
import NotFound from './routes/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* ruta de detalle de proyecto */}
      <Route path="/proyectos/:slug" element={<ProjectDetail />} />
      {/* ruta por defecto */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}