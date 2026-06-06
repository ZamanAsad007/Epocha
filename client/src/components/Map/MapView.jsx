import { MapContainer, TileLayer, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerLayer from './MarkerLayer';
import BorderOverlay from './BorderOverlay';
import EventBanner from '../UI/EventBanner';
import ScrollBanner from '../UI/ScrollBanner';
import { getEventForYear } from '../../data/historicalEvents';
import useMapStore from '../../store/mapStore';
import { useState, useEffect, useRef } from 'react';
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

const MapController = ({ setMapInstance }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);
  return null;
};

const MapView = () => {
  const {
    selectedPlace,
    isUpdating,
    sliderYear,
    bordersVisible,
    pendingFlyToPlace,
    clearPendingFlyToPlace,
  } = useMapStore();
  const [mapInstance, setMapInstance] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const prevYearRef = useRef(sliderYear);

  useEffect(() => {
    const prevYear = prevYearRef.current;
    if (prevYear !== sliderYear) {
      const event = getEventForYear(prevYear, sliderYear);
      if (event) {
        setCurrentEvent(event);
      }
      prevYearRef.current = sliderYear;
    }
  }, [sliderYear]);

  useEffect(() => {
    if (!mapInstance || !pendingFlyToPlace?.lat || !pendingFlyToPlace?.lng) return;

    mapInstance.flyTo([pendingFlyToPlace.lat, pendingFlyToPlace.lng], 8, { duration: 1.5 });
    clearPendingFlyToPlace();
  }, [mapInstance, pendingFlyToPlace, clearPendingFlyToPlace]);

  const handleFlyTo = ([lng, lat]) => {
    if (mapInstance) {
      mapInstance.flyTo([lat, lng], 5, { duration: 1.5 });
    }
  };

  const handleFlyToPlace = (place) => {
    if (mapInstance && place?.lat !== undefined && place?.lng !== undefined) {
      mapInstance.flyTo([place.lat, place.lng], 8, { duration: 1.5 });
    }
  };
  
  // Center of the world
  const center = [20, 0];
  const zoom = 3;

  // Define vertical bounds only to allow infinite horizontal scrolling
  const verticalBounds = L.latLngBounds(L.latLng(-85, -500), L.latLng(85, 500));

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={18}
        maxBounds={verticalBounds}
        maxBoundsViscosity={0.5}
        worldCopyJump={true}
        zoomControl={false}
        className="w-full h-full"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright" style="color:#C9A84C">OpenStreetMap</a> © <a href="https://carto.com/" style="color:#C9A84C">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          subdomains="abcd"
          noWrap={false}
        />
        <MapEvents />
        <MapController setMapInstance={setMapInstance} />
        <ZoomControl position="bottomright" />
        <MarkerLayer />
        <BorderOverlay year={sliderYear} visible={bordersVisible} />
      </MapContainer>

      {/* Event Overlay Banner */}
      <EventBanner
        event={currentEvent}
        onDismiss={() => setCurrentEvent(null)}
        onFlyTo={handleFlyTo}
      />

      <ScrollBanner onFlyToPlace={handleFlyToPlace} />

      {/* Updating Indicator */}
      {isUpdating && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[3000] 
                        bg-background-panel border border-border rounded-full
                        px-4 py-2 text-primary text-xs font-bold uppercase tracking-widest shadow-2xl animate-in fade-in duration-300">
          Updating Archive...
        </div>
      )}

      {/* Shadow overlay when sidebar is open for better depth */}
      {selectedPlace && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-[1500] transition-opacity animate-in fade-in duration-500"></div>
      )}
    </div>
  );
};

export default MapView;
