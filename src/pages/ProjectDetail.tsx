// src/pages/ProjectDetail.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProjectByIdWithPhotos,
  getPhotosGroupedByMonth,
  Project,
} from "../services/projects";
import BudgetDonut from "../components/BudgetDonut";
import MonthlyCarousel from "../components/MonthlyCarousel";

export default function ProjectDetail() {
  const { id = "" } = useParams();
  const [data, setData] = React.useState<Project | null>(null);
  const [slides, setSlides] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(0);
  const [groups, setGroups] = React.useState<{ mes: string; urls: string[] }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const p = await getProjectByIdWithPhotos(id);
        if (!alive) return;
        if (!p) { setNotFound(true); setData(null); setSlides([]); return; }
        setData(p);

        const base = Array.isArray(p.fotos) ? p.fotos : [];
        const portada = (p.portada || "").trim();
        const arr = base.length > 0 ? base : (portada ? [portada] : []);
        setSlides(arr);

        const g = await getPhotosGroupedByMonth(id);
        if (!alive) return;
        setGroups(g);
      } catch (e) {
        if (!alive) return;
        setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="page-detail"><p style={{color:"#fff"}}>Cargando…</p></div>;
  if (notFound || !data) return (
    <div className="page-detail">
      <p style={{color:"#fff"}}>Proyecto no encontrado o aún no publicado. <Link to="/" style={{textDecoration:"underline"}}>Volver</Link></p>
    </div>
  );

  const hero = slides[active] || "";
  const monto = data.montoAsignado || 0;
  const ejecutadoAcum = 0; // TODO: cuando tengas cifras reales

  return (
    <div className="page-detail">
      <div className="container">
        <Link to="/" style={{ color:"#d1e8ff" }}>← Volver</Link>
        <h1 className="title" style={{ margin: "10px 0 18px" }}>{data.titulo}</h1>

        {/* Badges arriba */}
        <div className="chips" style={{ marginBottom: 16 }}>
          {data.categoria && <span className="chip">{data.categoria}</span>}
          {data.estado && <span className="chip chip--estado-en-progreso">{data.estado}</span>}
          {data.fuente && <span className="chip">{data.fuente}</span>}
        </div>

        {/* Hero + Presupuesto */}
        <div className="detail-grid">
          <section className="detail-card gallery">
            <div className="hero">
              {hero ? (
                <img src={hero} alt={data.titulo} />
              ) : (
                <div style={{
                  width:"100%", height:"100%", display:"grid",
                  placeItems:"center", color:"#64748b"
                }}>Sin imagen</div>
              )}
            </div>

            {slides.length > 1 && (
              <div className="thumbs">
                {slides.map((u, i) => (
                  <button
                    key={u + i}
                    className={i === active ? "is-active" : ""}
                    onClick={() => setActive(i)}
                    title={"Foto " + (i + 1)}
                  >
                    <img src={u} alt={"Mini " + (i + 1)} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="detail-card">
            <h3>Presupuesto</h3>
            <BudgetDonut asignado={monto} ejecutado={ejecutadoAcum} />

            <div className="hr" />
            <div style={{ display:"grid", gap:6 }}>
              <div><strong>Monto asignado:</strong> ${monto.toLocaleString("es-CL")}</div>
              <div><strong>Ejecutado (acum.):</strong> ${ejecutadoAcum.toLocaleString("es-CL")}</div>
              <div><strong>Ejecutado en el mes:</strong> $0</div>
            </div>
          </section>
        </div>

        {/* Información y Observaciones */}
        <div className="detail-grid" style={{ marginTop: 16 }}>
          <section className="detail-card">
            <h3>Información</h3>
            <div className="chips" style={{ marginBottom: 12 }}>
              {data.categoria && <span className="chip">{data.categoria}</span>}
              {data.estado && <span className="chip">{data.estado}</span>}
              {data.fuente && <span className="chip">{data.fuente}</span>}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {typeof data.montoAsignado === "number" && (
                <div><strong>Monto:</strong> ${data.montoAsignado.toLocaleString("es-CL")}</div>
              )}
              {data.proveedor && (
                <div><strong>Proveedor:</strong> {data.proveedor}</div>
              )}
              {data.fechaInicio && (
                <div><strong>Inicio:</strong> {data.fechaInicio}</div>
              )}
              {data.fechaFinEstimada && (
                <div><strong>Fin estimada:</strong> {data.fechaFinEstimada}</div>
              )}
            </div>
          </section>

          <section className="detail-card">
            <h3>Observaciones</h3>
            <p className="obs">{data.observaciones || "Sin observaciones."}</p>
          </section>
        </div>

        {/* Mapa */}
        {typeof data.lat === "number" && typeof data.lng === "number" && !Number.isNaN(data.lat) && !Number.isNaN(data.lng) && (
          <section className="detail-card" style={{ marginTop: 16 }}>
            <h3>Ubicación</h3>
            <div style={{ borderRadius: 12, overflow:"hidden" }}>
              <iframe
                title="Ubicación"
                width="100%"
                height="360"
                loading="lazy"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        )}

        {/* Carrusel mensual */}
        {groups.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <MonthlyCarousel groups={groups} />
          </div>
        )}
      </div>
    </div>
  );
}
