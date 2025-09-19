// src/pages/admin/AdminProjects.tsx
import React from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

type Proyecto = {
  id: string;
  titulo: string;
  categoria?: string;
  estado?: "pendiente" | "en-progreso" | "finalizado";
  publicado?: boolean;
};

export default function AdminProjects() {
  const [items, setItems] = React.useState<Proyecto[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "proyectos"), orderBy("titulo"));
      const snap = await getDocs(q);
      const rows: Proyecto[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar la lista de proyectos");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function togglePublicar(id: string, publicar: boolean) {
    try {
      await updateDoc(doc(db, "proyectos", id), {
        publicado: publicar,
        // publicadoAt: publicar ? serverTimestamp() : null, // si quieres guardar fecha
      });
      setItems((list) => list.map((p) => (p.id === id ? { ...p, publicado: publicar } : p)));
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado de publicación");
    }
  }

  async function removeProject(id: string, titulo: string) {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, "proyectos", id));
      // (Opcional) también elimina subcolecciones (fotos/avances) desde un Cloud Function.
      setItems((list) => list.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar el proyecto");
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Proyectos</h2>
        <Link
          to="/admin/proyectos/nuevo"
          className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
        >
          + Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-500">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">No hay proyectos aún.</div>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Título y meta */}
                <div>
                  <div className="text-lg font-semibold capitalize">{p.titulo}</div>
                  <div className="mt-1 text-sm text-slate-500 flex flex-wrap gap-2">
                    {p.categoria && <span>{p.categoria}</span>}
                    {p.estado && (
                      <span className="text-slate-400">•</span>
                    )}
                    {p.estado && (
                      <span className="capitalize">{p.estado.replace("-", " ")}</span>
                    )}
                    <span className="text-slate-400">•</span>
                    {p.publicado ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Borrador
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones estilo “píldora” */}
                <div className="flex flex-wrap gap-3">
                  {/* Ver (deshabilitado si no está publicado) */}
                  {p.publicado ? (
                    <Link
                      to={`/proyecto/${p.id}`}
                      className="btn-pill bg-blue-600 hover:bg-blue-700"
                    >
                      Ver
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn-pill bg-blue-300 cursor-not-allowed opacity-60"
                      title="Primero publica el proyecto"
                      disabled
                    >
                      Ver
                    </button>
                  )}

                  {/* Editar */}
                  <Link
                    to={`/admin/proyectos/editar/${p.id}`}
                    className="btn-pill bg-amber-500 hover:bg-amber-600"
                  >
                    Editar
                  </Link>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => removeProject(p.id, p.titulo)}
                    className="btn-pill bg-rose-600 hover:bg-rose-700"
                  >
                    Eliminar
                  </button>

                  {/* Publicar / Retirar */}
                  {p.publicado ? (
                    <button
                      type="button"
                      onClick={() => togglePublicar(p.id, false)}
                      className="btn-pill bg-emerald-600 hover:bg-emerald-700"
                    >
                      Retirar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePublicar(p.id, true)}
                      className="btn-pill bg-emerald-600 hover:bg-emerald-700"
                    >
                      Publicar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Utiliza estas clases utilitarias en tu global.css / globals.css:
 *
 * .btn-pill {
 *   @apply rounded-2xl px-6 py-3 text-white font-semibold shadow transition-colors;
 * }
 *
 * // Si no usas @apply, puedes pegar las clases directamente en cada botón.
 */
