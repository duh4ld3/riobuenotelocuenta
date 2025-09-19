import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { listProjects, Project } from "../services/projects";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

import TopBar from "../components/TopBar";
import HomeHero from "../components/HomeHero";
import FeaturedProjects from "../components/FeaturedProjects";
import ProjectCard from "../components/ProjectCard";
import FiltersBar from "../components/FiltersBar";
import SyncButton from "../components/SyncButton";
import Skeleton from "../components/Skeleton";
import SiteFooter from "../components/SiteFooter";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [user] = useAuthState(auth);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [estado, setEstado] = useState("");
  const [fuente, setFuente] = useState("");

  async function fetchAll(force = false) {
    let alive = true;
    try {
      setLoading(true);
      setError(null);
      const data = await listProjects();
      if (!alive) return;
      setProjects((data || []).filter((p) => p?.publicado === true));
      setLastUpdated(Date.now());
    } catch (e: any) {
      if (!alive) return;
      setError(e?.message || "Error al cargar proyectos");
      setProjects([]);
    } finally {
      if (alive) setLoading(false);
    }
    return () => { alive = false; };
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listProjects();
        if (!alive) return;
        setProjects((data || []).filter((p) => p?.publicado === true));
        setLastUpdated(Date.now());
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Error al cargar proyectos");
        setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const t = setTimeout(() => alive && setLoading(false), 4000);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  const norm = (v?: string) => (v ?? "").trim();
  const lc = (v?: string) => norm(v).toLowerCase();

  const categories = useMemo(
    () => Array.from(new Set(projects.map(p => norm(p?.categoria)).filter(Boolean))).sort(),
    [projects]
  );
  const estados = useMemo(
    () => Array.from(new Set(projects.map(p => norm(p?.estado)).filter(Boolean))).sort(),
    [projects]
  );
  const fuentes = useMemo(
    () => Array.from(new Set(projects.map(p => norm(p?.fuente)).filter(Boolean))).sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    const s = lc(search), cat = norm(category), est = norm(estado), fue = norm(fuente);
    return projects.filter(p => {
      const titulo = lc(p?.titulo);
      const catP = norm(p?.categoria), estP = norm(p?.estado), fueP = norm(p?.fuente);
      const matchSearch = s ? titulo.includes(s) || lc(catP).includes(s) : true;
      const matchCat = cat ? catP === cat : true;
      const matchEstado = est ? estP === est : true;
      const matchFuente = fue ? fueP === fue : true;
      return matchSearch && matchCat && matchEstado && matchFuente;
    });
  }, [projects, search, category, estado, fuente]);

  return (
    <div className="layout">
      <TopBar />
      <HomeHero />

      <FeaturedProjects projects={projects} />

      <main className="wrap pb-16" id="resultados">
        <div className="section-head">
          <div>
            <h2 className="section-title">Explorar proyectos</h2>
            <p className="muted">Busca por nombre, categoría, estado o fuente.</p>
          </div>

          <div className="head-actions">
            {lastUpdated && (
              <span className="small muted">
                Última sincronización: {dayjs(lastUpdated).format("HH:mm DD/MM/YYYY")}
              </span>
            )}
            <SyncButton onClick={() => fetchAll(true)} />
            {user ? (
              <Link to="/admin" className="btn btn--outline">Panel admin</Link>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <FiltersBar
            search={search} onSearchChange={setSearch}
            category={category} onCategoryChange={setCategory}
            estado={estado} onEstadoChange={setEstado}
            fuente={fuente} onFuenteChange={setFuente}
            categories={categories} estados={estados} fuentes={fuentes}
          />
        </div>

        {error && (
          <div className="callout error mt-4">
            Se produjo un error al cargar los datos: {error}
          </div>
        )}

        {loading ? (
          <div className="cards mt-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="callout mt-6">No hay proyectos que coincidan con los filtros.</div>
        ) : (
          <div className="cards mt-6">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
