import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container">
      <h1>Panel Municipalidad</h1>
      <ul>
        <li><Link to="/admin/proyecto/nuevo">Crear proyecto</Link></li>
        <li><Link to="/admin/mes/nuevo">Agregar avance mensual</Link></li>
        <li><Link to="/admin/evento/nuevo">Agregar evento/hito</Link></li>
        <li><Link to="/admin/foto/subir">Subir foto</Link></li>
      </ul>
    </div>
  );
}
