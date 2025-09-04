import React, { useContext, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { DataContext } from '../App';
import ProjectCard from '../components/ProjectCard';
import FiltersBar from '../components/FiltersBar';
import SyncButton from '../components/SyncButton';
import Skeleton from '../components/Skeleton';

/**
 * Página principal que muestra un listado filtrable de proyectos.
 * Permite buscar por texto y filtrar por categoría, estado y fuente.
 * Incluye un botón de sincronización para refrescar los datos desde Google Sheets.
 */
const Home: React.FC = () => {
  const dataCtx = useContext(DataContext);
  if (!dataCtx) throw new Error('DataContext fuera de alcance');
  const { projects, loading, error, lastUpdated, fetchAll } = dataCtx;

  // Estados locales para filtros
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [estado, setEstado] = useState('');
  const [fuente, setFuente] = useState('');

  // Helpers para evitar undefined
  const norm = (v?: string) => (v ?? '').trim();
  const lc = (v?: string) => norm(v).toLowerCase();

  // Listas de opciones únicas
  const categories = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => norm(p.categoria)).filter((x) => x.length > 0))
      ).sort(),
    [projects]
  );

  const estados = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => norm(p.estado)).filter((x) => x.length > 0))
      ).sort(),
    [projects]
  );

  const fuentes = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => norm(p.fuente)).filter((x) => x.length > 0))
      ).sort(),
    [projects]
  );

  // Filtrado
  const filtered = useMemo(() => {
    const s = lc(search);
    const cat = norm(category);
    const est = norm(estado);
    const fue = norm(fuente);

    return projects.filter((p) => {
      const titulo = lc(p.titulo);
      const catP = norm(p.categoria);
      const estP = norm(p.estado);
      const fueP = norm(p.fuente);

      const matchSearch = s
        ? titulo.includes(s) || lc(catP).includes(s)
        : true;
      const matchCat = cat ? catP === cat : true;
      const matchEstado = est ? estP === est : true;
      const matchFuente = fue ? fueP === fue : true;

      return matchSearch && matchCat && matchEstado && matchFuente;
    });
  }, [projects, search, category, estado, fuente]);

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 p-4 pb-12">
      <h1 className="text-2xl font-bold mb-4">Proyectos de la comuna</h1>

      {/* Filtros */}
      <FiltersBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        estado={estado}
        onEstadoChange={setEstado}
        fuente={fuente}
        onFuenteChange={setFuente}
        categories={categories}
        estados={estados}
        fuentes={fuentes}
      />

      {/* Barra de sincronización y fecha de actualización */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 mb-4 gap-2">
        <SyncButton onClick={() => fetchAll(true)} />
        {lastUpdated && (
          <span className="text-sm text-gray-400">
            Última sincronización: {dayjs(lastUpdated).format('HH:mm DD/MM/YYYY')}
          </span>
        )}
      </div>

      {/* Contenido */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-red-500">
          Se produjo un error al cargar los datos: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="col-span-full text-gray-400">
              No hay proyectos que coincidan con los filtros.
            </p>
          ) : (
            filtered.map((p) => <ProjectCard key={p.id} project={p} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
