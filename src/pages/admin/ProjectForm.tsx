// src/pages/admin/ProjectForm.tsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Firebase
import { db, storage } from "../../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// ----------------- Tipos & helpers -----------------
type Estado = "pendiente" | "en-progreso" | "finalizado";
type MonthPhotos = Record<string, File[]>;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Firestore no acepta `undefined`
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !(v instanceof File)) out[k] = cleanUndefined(v as any);
    else out[k] = v;
  }
  return out;
}

// Debounce utilitario (para el buscador)
function useDebouncedValue<T>(value: T, delay = 350) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ---- Mapa helpers
function ClickToSetMarker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ----------------- Buscador (Nominatim) -----------------
type Suggestion = { display_name: string; lat: string; lon: string };

function SearchBox({
  query,
  setQuery,
  onPick,
  onUseMyLocation,
  onCenterRioBueno,
}: {
  query: string;
  setQuery: (s: string) => void;
  onPick: (lat: number, lng: number, label?: string) => void;
  onUseMyLocation: () => void;
  onCenterRioBueno: () => void;
}) {
  const debounced = useDebouncedValue(query, 400);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!debounced || (typeof debounced === "string" && debounced.length < 3)) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", String(debounced));
        url.searchParams.set("format", "json");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "8");
        const r = await fetch(url.toString(), { method: "GET" });
        if (!r.ok) throw new Error("Nominatim error");
        const data = (await r.json()) as Suggestion[];
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="relative space-y-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Busca dirección o lugar…"
          className="w-full rounded-xl border px-3 py-2"
        />
        <button type="button" onClick={onUseMyLocation} className="rounded-xl border px-3 py-2">
          📍 Mi ubicación
        </button>
        <button type="button" onClick={onCenterRioBueno} className="rounded-xl border px-3 py-2">
          🏠 Río Bueno
        </button>
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow">
          {loading ? (
            <div className="px-3 py-2 text-sm text-slate-500">Buscando…</div>
          ) : (
            results.map((s, i) => (
              <button
                key={`${s.lat}-${s.lon}-${i}`}
                type="button"
                className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  setOpen(false);
                  setQuery(s.display_name);
                  onPick(Number(s.lat), Number(s.lon), s.display_name);
                }}
              >
                <div className="text-sm">{s.display_name}</div>
              </button>
            ))
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------- Componente principal -----------------
export default function ProjectForm() {
  const nav = useNavigate();

  // UI / Mapa: evita que el mapa rompa el render si se monta antes de tiempo
  const [readyForMap, setReadyForMap] = React.useState(false);
  React.useEffect(() => setReadyForMap(true), []);

  // requeridos
  const [titulo, setTitulo] = React.useState("");
  const [categoria, setCategoria] = React.useState("");
  const [estado, setEstado] = React.useState<Estado>("pendiente");
  const [fuente, setFuente] = React.useState("");
  const [montoAsignado, setMontoAsignado] = React.useState<number>(0);

  const [lat, setLat] = React.useState<number>(-40.336);
  const [lng, setLng] = React.useState<number>(-72.953);
  const [fechaInicio, setFechaInicio] = React.useState(
    new Date().toISOString().slice(0, 10)
  );

  // opcionales
  const [proveedor, setProveedor] = React.useState("");
  const [observaciones, setObservaciones] = React.useState("");
  const [fechaFinEstimada, setFechaFinEstimada] = React.useState("");

  // fotos por mes
  const [month, setMonth] = React.useState<string>("");
  const [photosByMonth, setPhotosByMonth] = React.useState<MonthPhotos>({});

  // buscador
  const [query, setQuery] = React.useState("");

  // estado de guardado
  const [saving, setSaving] = React.useState(false);
  const [progress, setProgress] = React.useState<{ current: number; total: number } | null>(null);

  function onPickFromMap(la: number, ln: number) {
    setLat(la);
    setLng(ln);
  }
  function handleUseMyLocation() {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => alert("No se pudo obtener la ubicación")
    );
  }
  function handleCenterRioBueno() {
    setLat(-40.3318);
    setLng(-72.9534);
  }
  function handleAddFiles(files: FileList | null) {
    if (!files || !month) return;
    const arr = Array.from(files);
    setPhotosByMonth((prev) => {
      const curr = prev[month] || [];
      return { ...prev, [month]: curr.concat(arr) };
    });
  }
  function removePhoto(m: string, idx: number) {
    setPhotosByMonth((prev) => {
      const curr = (prev[m] || []).slice();
      curr.splice(idx, 1);
      return { ...prev, [m]: curr };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim()) return alert("Falta el título");
    if (!categoria.trim()) return alert("Falta la categoría");
    if (!fuente.trim()) return alert("Falta la fuente");

    setSaving(true);
    setProgress(null);
    try {
      const id = crypto.randomUUID();

      // 1) Crear documento base
      const payload = cleanUndefined({
        titulo,
        categoria,
        estado, // 'pendiente' | 'en-progreso' | 'finalizado'
        fuente,
        montoAsignado: Number(montoAsignado ?? 0),
        lat: Number(lat ?? 0),
        lng: Number(lng ?? 0),
        fechaInicio: fechaInicio || new Date().toISOString().slice(0, 10),

        // opcionales
        proveedor: proveedor || null,
        observaciones: observaciones || null,
        fechaFinEstimada: fechaFinEstimada || null,
      });

      await setDoc(doc(collection(db, "proyectos"), id), payload);

      // 2) Subida de fotos con timeout, en paralelo (no bloquea si una falla)
      const filesToUpload: { month: string; file: File }[] = [];
      for (const [m, files] of Object.entries(photosByMonth)) {
        if (!files?.length) continue;
        for (const file of files) filesToUpload.push({ month: m, file });
      }

      if (filesToUpload.length > 0) {
        setProgress({ current: 0, total: filesToUpload.length });

        const uploadOne = async ({ month, file }: { month: string; file: File }) => {
          const path = `proyectos/${id}/avances/${month}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, path);

          // Timeout duro por archivo (30s)
          const abort = new AbortController();
          const timeoutId = setTimeout(() => abort.abort(), 30000);

          try {
            const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

            const url: string = await new Promise((resolve, reject) => {
              task.on(
                "state_changed",
                undefined,
                (err) => reject(err),
                async () => {
                  try {
                    const u = await getDownloadURL(task.snapshot.ref);
                    resolve(u);
                  } catch (e) {
                    reject(e);
                  }
                }
              );
              abort.signal.addEventListener("abort", () => {
                try { task.cancel(); } catch {}
                reject(new Error("upload-timeout"));
              });
            });

            clearTimeout(timeoutId);

            // Registrar en subcolección fotos
            const photoId = crypto.randomUUID();
            await setDoc(
              doc(collection(db, "proyectos", id, "fotos"), photoId),
              cleanUndefined({ src: url, mes: month, alt: titulo || null })
            );
          } catch (err: any) {
            clearTimeout(timeoutId);
            console.error("[UPLOAD] fail", err?.code || err?.message || err);
            alert(`Una foto no se pudo subir (${file.name}). La omito y sigo.`);
          } finally {
            setProgress((p) => (p ? { current: p.current + 1, total: p.total } : p));
          }
        };

        await Promise.all(filesToUpload.map(uploadOne));
      }

      alert("Proyecto guardado ✅");
      nav("/admin/proyectos");
    } catch (err: any) {
      console.error(err);
      alert("Error al guardar: " + (err?.message || "revisa la consola"));
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Crear proyecto</h2>
        <Link to="/admin/proyectos" className="text-sky-600 hover:underline">
          ← Volver a lista
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Datos básicos</h3>
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="Ej: Mejoramiento Plaza ..."
              required
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="Salud, Educación, Infraestructura…"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as Estado)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en-progreso">En progreso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Fuente</label>
              <input
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="FNDR, PMU, Municipal, etc."
                required
              />
            </div>
          </div>
        </section>

        {/* Presupuesto */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Presupuesto</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Monto asignado (CLP)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={montoAsignado}
                onChange={(e) => setMontoAsignado(Number(e.target.value || 0))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                required
              />
            </div>
          </div>
        </section>

        {/* Planificación */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Planificación</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha fin estimada</label>
              <input
                type="date"
                value={fechaFinEstimada}
                onChange={(e) => setFechaFinEstimada(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Proveedor</label>
              <input
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="Empresa / contratista"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              rows={3}
              placeholder="Notas, alcances, restricciones..."
            />
          </div>
        </section>

        {/* Ubicación con buscador */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Ubicación</h3>
          <SearchBox
            query={query}
            setQuery={setQuery}
            onPick={(la, ln) => {
              setLat(la);
              setLng(ln);
            }}
            onUseMyLocation={handleUseMyLocation}
            onCenterRioBueno={handleCenterRioBueno}
          />

          <div className="h-80 rounded-2xl overflow-hidden">
            {readyForMap ? (
              <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <PanTo lat={lat} lng={lng} />
                <ClickToSetMarker onPick={onPickFromMap} />
                <Marker
                  draggable
                  position={[lat, lng]}
                  icon={markerIcon}
                  eventHandlers={{
                    dragend: (e) => {
                      const m = e.target as L.Marker;
                      const p = m.getLatLng();
                      setLat(p.lat);
                      setLng(p.lng);
                    },
                  }}
                >
                  <Popup>
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
            )}
          </div>

          <p className="text-sm text-slate-600">
            Lat/Lng: <code>{lat.toFixed(6)}</code>, <code>{lng.toFixed(6)}</code>
          </p>
        </section>

        {/* Avances por mes (fotos) */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Avances por mes (fotos)</h3>
          <div className="grid sm:grid-cols-[160px_1fr] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium">Mes</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Agregar fotos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                onChange={(e) => handleAddFiles(e.target.files)}
                disabled={!month}
              />
              <p className="text-xs text-slate-500 mt-1">
                Se guardarán en Storage y se indexarán en <code>proyectos/&#123;id&#125;/fotos</code>.
              </p>
            </div>
          </div>

          {Object.entries(photosByMonth).length > 0 && (
            <div className="space-y-3">
              {Object.entries(photosByMonth).map(([m, files]) => (
                <div key={m} className="border rounded-xl p-3">
                  <div className="text-sm font-medium mb-2">{m}</div>
                  {files.length === 0 ? (
                    <div className="text-sm text-slate-500">Sin fotos aún</div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {files.map((f, i) => {
                        const url = URL.createObjectURL(f);
                        return (
                          <div key={i} className="relative group">
                            <img src={url} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              type="button"
                              title="Quitar"
                              className="absolute top-1 right-1 px-2 py-1 text-xs rounded bg-black/60 text-white opacity-0 group-hover:opacity-100"
                              onClick={() => removePhoto(m, i)}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving
              ? progress
                ? `Guardando… (${progress.current}/${progress.total})`
                : "Guardando…"
              : "Guardar proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}
