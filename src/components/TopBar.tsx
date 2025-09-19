import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="wrap">
        <Link to="/" className="brand">
          <span className="brand-emblem">🏛</span>
          <span className="brand-text">
            Portal de Transparencia <b>Río Bueno</b>
          </span>
        </Link>

        <nav className="menu">
          <Link to="/#resultados" className="menu-link">📊 Reportes</Link>
          <Link to="/login" className="btn btn--purple">Iniciar Sesión</Link>
        </nav>
      </div>
    </header>
  );
}
