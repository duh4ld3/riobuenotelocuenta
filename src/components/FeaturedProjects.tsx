import { Link } from "react-router-dom";
import type { Project } from "../services/projects";
import { getFirstPhotoUrl } from "../services/projects";

function progressOf(p: any): number {
  // lee cualquiera de estos campos si existen
  const v = p?.avance ?? p?.progreso ?? p?.porcentaje ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, 6); // “Destacados”: primeros 6 publicados

  return (
    <section className="featured">
      <div className="wrap">
        <div className="featured-head">
          <h2>Proyectos destacados ⚡</h2>
          <a href="#resultados" className="link">Sincronizar datos</a>
        </div>

        <div className="cards">
          {featured.map((p) => {
            const img = getFirstPhotoUrl(p) || "";
            const pr = progressOf(p);
            const estado = (p.estado || "").replace("-", " ");
            return (
              <article key={p.id} className="card proj">
                <div className="proj-thumb">
                  {img ? <img src={img} alt={p.titulo} /> : <div className="noimg">Sin imagen</div>}
                  <span className="badge">{(p.categoria || "Proyecto").toUpperCase()}</span>
                </div>
                <div className="proj-body">
                  <div className="proj-meta">
                    <span className={`chip chip--estado`}>{estado || "estado"}</span>
                    {p.fuente && <span className="chip chip--fuente">{p.fuente}</span>}
                  </div>
                  <h3 className="proj-title">{p.titulo}</h3>

                  <div className="proj-progress">
                    <div className="progress">
                      <div className="progress__bar" style={{ ["--value" as any]: pr }} />
                    </div>
                    <span className="progress-text">{pr}%</span>
                  </div>

                  <div className="proj-actions">
                    <Link to={`/proyecto/${p.id}`} className="btn btn--purple">
                      Ver detalles completos
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
