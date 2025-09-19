import { Link } from "react-router-dom";

export default function HomeHero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            Proyectos de la Comuna
          </h1>
          <p className="hero-sub">
            Conoce en tiempo real el avance, presupuesto y ubicación de los
            proyectos que están transformando Río Bueno.
          </p>

          <div className="actions">
            <a href="#resultados" className="btn btn--green">🔍 Explorar Proyectos</a>
            <Link to="/mapa" className="btn btn--outline">📍 Ver en Mapa</Link>
          </div>
        </div>

        <ul className="hero-chips">
          <li>🏛 Infraestructura</li>
          <li>🏥 Salud</li>
          <li>🏫 Educación</li>
          <li>⚽ Deporte</li>
          <li>🎭 Cultura</li>
        </ul>
      </div>
    </section>
  );
}
