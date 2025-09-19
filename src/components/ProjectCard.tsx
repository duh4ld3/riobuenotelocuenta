// src/components/ProjectCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Project } from "../services/projects";

// Utilidad defensiva por si llega algo raro en portada/fotos
function pickCover(p: Project): string {
  const url =
    (typeof p.portada === "string" && p.portada.trim()) ||
    (Array.isArray(p.fotos) ? p.fotos.find(u => typeof u === "string" && u.trim()) : "") ||
    "";
  // Aceptamos solo URLs http/https (evita gs://)
  if (/^https?:\/\//i.test(url)) return url;
  return ""; // forzamos placeholder
}

function fmtMoney(n?: number) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toLocaleString("es-CL");
}

export default function ProjectCard({ project }: { project: Project }) {
  const cover = pickCover(project);
  const estado = (project.estado || "").toLowerCase();

  return (
    <article className="card project-card">
      <Link to={`/proyecto/${project.id}`} className="block focus:outline-none focus:ring-2 focus:ring-sky-300 rounded-lg">
        {/* Imagen 16:9 con object-fit */}
        <div className="project-card__media">
          {cover ? (
            <img
              src={cover}
              alt={project.titulo || "Proyecto"}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="project-card__placeholder">
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        <div className="project-card__body">
          <div className="project-card__meta">
            {project.categoria ? <span className="chip">{project.categoria}</span> : null}
            {project.fuente ? <span className="chip">{project.fuente}</span> : null}
            {estado && (
              <span
                className={
                  "chip " +
                  (estado === "pendiente"
                    ? "chip--estado-pendiente"
                    : estado === "en-progreso"
                    ? "chip--estado-en-progreso"
                    : "chip--estado-finalizado")
                }
              >
                {project.estado}
              </span>
            )}
          </div>

          <h3 className="project-card__title">{project.titulo || "Proyecto"}</h3>

          <div className="project-card__row">
            <span className="project-card__label">Monto</span>
            <span className="project-card__value">$ {fmtMoney(project.montoAsignado)}</span>
          </div>

          <div className="project-card__actions">
            <span className="link">Ver proyecto</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
