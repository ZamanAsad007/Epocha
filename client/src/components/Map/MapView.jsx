import { MapContainer, TileLayer, ZoomControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerLayer from './MarkerLayer';
import useMapStore from '../../store/mapStore';
import 'leaflet/dist/leaflet.css';

const MapEvents = () => {
  const { clearSelectedPlace } = useMapStore();
  useMapEvents({
    click: () => {
      clearSelectedPlace();
    },
  });
  return null;
};

const MapView = () => {
  const { selectedPlace } = useMapStore();
  
  // Center of the world
  const center = [20, 0];
  const zoom = 2;

  // Define vertical bounds only to allow infinite horizontal scrolling
  const verticalBounds = L.latLngBounds(L.latLng(-85, -500), L.latLng(85, 500));

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2.5}
        maxBounds={verticalBounds}
        maxBoundsViscosity={0.5}
        worldCopyJump={true}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#0D0D0D' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          noWrap={false}
        />
        <MapEvents />
        <ZoomControl position="bottomright" />
        <MarkerLayer />
      </MapContainer>

      {/* Shadow overlay when sidebar is open for better depth */}
      {selectedPlace && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-[1500] transition-opacity animate-in fade-in duration-500"></div>
      )}
    </div>
  );
};

export default MapView;
