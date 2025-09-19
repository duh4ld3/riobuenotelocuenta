export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <h4>Portal de Transparencia</h4>
          <ul>
            <li><a href="/acerca">Acerca del Portal</a></li>
            <li><a href="/como-usar">Cómo usar la plataforma</a></li>
            <li><a href="/faq">Preguntas frecuentes</a></li>
            <li><a href="/contacto">Contacto y soporte</a></li>
          </ul>
        </div>

        <div>
          <h4>Gobierno Abierto</h4>
          <ul>
            <li><a href="/transparencia">Ley de Transparencia</a></li>
            <li><a href="/datos-abiertos">Datos abiertos</a></li>
            <li><a href="/participacion">Participación ciudadana</a></li>
            <li><a href="/solicitudes">Solicitudes de información</a></li>
          </ul>
        </div>

        <div>
          <h4>Municipio de Río Bueno</h4>
          <ul>
            <li><a href="https://www.riobueno.cl" target="_blank">Sitio web oficial</a></li>
            <li><a href="/servicios">Servicios municipales</a></li>
            <li><a href="/concejo">Concejo municipal</a></li>
            <li><a href="/noticias">Noticias y comunicados</a></li>
          </ul>
        </div>

        <div>
          <h4>Información de contacto</h4>
          <ul className="muted">
            <li>📍 Dirección Municipal</li>
            <li>📞 Teléfonos de contacto</li>
            <li>✉ Correos electrónicos</li>
            <li>🕒 Horarios de atención</li>
          </ul>
        </div>
      </div>

      <div className="wrap footer-copy">
        © {new Date().getFullYear()} Municipio de Río Bueno. Portal de Transparencia de Proyectos.
      </div>
    </footer>
  );
}
