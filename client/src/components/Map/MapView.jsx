import React from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import MarkerLayer from './MarkerLayer';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  // Center of the world
  const center = [20, 0];
  const zoom = 2;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full bg-gray-900"
        style={{ background: '#111827' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <MarkerLayer />
      </MapContainer>
    </div>
  );
};

export default MapView;
