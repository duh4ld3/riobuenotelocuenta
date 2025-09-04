// src/routes/ProjectDetail.tsx
import React, { useContext, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { DataContext } from '../App';
import { formatCLP, formatDate } from '../lib/format';

import MonthTabs from '../components/MonthTabs';
import PhotoCarousel from '../components/PhotoCarousel';
import BudgetDonut from '../components/BudgetDonut';
import TimelineList from '../components/TimelineList';
import MapLeaflet from '../components/MapLeaflet';
import ExportCsvButton from '../components/ExportCsvButton';
import PrintButton from '../components/PrintButton';
import KPICard from '../components/KPICard';

import type { Project } from '../types';

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dataCtx = useContext(DataContext);
  if (!dataCtx) throw new Error('DataContext fuera de alcance');

  const { projects, loading, error, lastUpdated } = dataCtx;

  // Buscar el proyecto por su slug
  const project = useMemo<Project | undefined>(
    () => projects.find((p) => p.slug === slug),
    [projects, slug]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  // Calcular métricas para la gráfica de presupuesto
  const { ejecutadoAcum, restante } = useMemo(() => {
    if (!project) return { ejecutadoAcum: 0, restante: 0 };
    const executed = project.meses.reduce((acc, m) => acc + m.ejecutadoMes, 0);
    const restanteCalc = Math.max((project.montoAsignado ?? 0) - executed, 0);
    return { ejecutadoAcum: executed, restante: restanteCalc };
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg p-4 text-gray-100">
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg p-4 text-gray-100">
        <p className="text-red-500">Error al cargar los datos: {error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-darkBg p-4 text-gray-100">
        <p>Proyecto no encontrado.</p>
        <Link to="/" className="text-primary underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Mes activo y fallback de fotos
  const activeMonth = project.meses[activeIndex] || project.meses[0];

  // 👉 Fallback: si el mes activo no trae fotos, usamos la primera disponible de otros meses
  const photosForView =
    activeMonth.fotos.length > 0
      ? activeMonth.fotos
      : project.meses.flatMap((m) => m.fotos);

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 p-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-primary hover:underline">
          ← Volver
        </Link>

        <h1 className="text-2xl font-bold mt-2 mb-2">{project.titulo}</h1>

        <div className="text-sm text-gray-400 mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <span>Estado: {project.estado}</span>
          <span>Fuente: {project.fuente}</span>
          <span>Beneficiarios: {String(project.beneficiarios ?? '')}</span>
          <span>
            Periodo: {formatDate(project.inicio)} → {formatDate(project.finEstimada)}
          </span>
        </div>

        {/* Tabs para los meses */}
        <MonthTabs
          months={project.meses}
          activeIndex={activeIndex}
          onChange={(i) => setActiveIndex(i)}
        />

        {/* Contenido del mes */}
        {activeMonth && (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              {/* Carrusel con fallback */}
              <PhotoCarousel photos={photosForView} />

              {/* KPIs del mes */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard
                  title="Ejecutado en el mes"
                  value={formatCLP(activeMonth.ejecutadoMes)}
                />
                <KPICard title="Avance" value={`${activeMonth.avance}%`} />
                <KPICard title="Eventos" value={activeMonth.eventos.length.toString()} />
                <KPICard title="Incidencias" value="0" />
              </div>

              {/* Timeline de eventos */}
              {activeMonth.eventos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Eventos del mes</h3>
                  <TimelineList eventos={activeMonth.eventos} />
                </div>
              )}
            </div>

            <div>
              {/* Gráfica de presupuesto y mapa */}
              <div className="bg-darkCard border border-darkBorder rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Presupuesto</h3>
                <BudgetDonut
                  asignado={project.montoAsignado ?? 0}
                  ejecutado={ejecutadoAcum}
                />
                <p className="mt-2 text-sm text-gray-400">
                  Asignado: {formatCLP(project.montoAsignado ?? 0)}
                  <br />
                  Ejecutado acumulado: {formatCLP(ejecutadoAcum)}
                  <br />
                  Restante: {formatCLP(restante)}
                </p>
              </div>

              <div className="mt-4 bg-darkCard border border-darkBorder rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Ubicación</h3>
                <MapLeaflet lat={project.lat} lng={project.lng} titulo={project.titulo} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 no-print">
                <ExportCsvButton project={project} />
                <PrintButton />
              </div>

              {lastUpdated && (
                <p className="mt-2 text-xs text-gray-500">
                  Última sincronización: {dayjs(lastUpdated).format('HH:mm DD/MM/YYYY')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
