import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar los iconos por defecto para Leaflet. Cuando se usa con Vite
// es necesario importar las imágenes explícitamente.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ajustar los iconos por defecto
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  lat: number;
  lng: number;
  titulo?: string;
}

/**
 * Mapa interactivo centrado en las coordenadas del proyecto. Incluye un
 * marcador y un enlace para abrir la ubicación en Google Maps. Para
 * funcionar correctamente hay que cargar el CSS de Leaflet.
 */
const MapLeaflet: React.FC<Props> = ({ lat, lng, titulo }) => {
  const position: [number, number] = [lat, lng];
  return (
    <div className="relative h-64 w-full">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full z-0 rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{titulo}</Popup>
        </Marker>
      </MapContainer>
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="no-print absolute top-2 right-2 bg-darkCard/70 text-gray-200 px-2 py-1 rounded-md text-xs hover:bg-darkCard/90 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Abrir en Google Maps
      </a>
    </div>
  );
};

export default MapLeaflet;