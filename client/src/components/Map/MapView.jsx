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
        className="w-full h-full"
        style={{ background: '#0D0D0D' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <MarkerLayer />
      </MapContainer>
    </div>
  );
};

export default MapView;
