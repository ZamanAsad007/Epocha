import React, { useState, useMemo } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import MarkerPopup from './MarkerPopup';
import { usePlaces } from '../../hooks/usePlaces';

const MIN_ZOOM_TO_SHOW = 3;
const MAX_VIEWPORT_MARKERS = 300;

const HistoryMarker = React.memo(({ place, onClick, isSelected }) => {
  const config = categoryConfig[place.category];
  const color = config?.hex || '#C9A84C';
  const size = isSelected ? 22 : 14;

  const icon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative group">
        <div class="marker-base ${isSelected ? 'marker-pulse' : ''}" 
             style="
               width: ${size}px; 
               height: ${size}px; 
               background-color: ${color}; 
               border: 2px solid ${color}88; 
               border-radius: 50%;
               box-shadow: 0 0 10px ${color}66;
               transition: all 0.3s ease-in-out;
             ">
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  }), [color, size, isSelected]);

  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick(place),
      }}
    >
      <MarkerPopup place={place} />
    </Marker>
  );
}, (prev, next) => prev.place.id === next.place.id && prev.isSelected === next.isSelected);

const MarkerLayer = () => {
  const { selectedPlace, setSelectedPlace } = useMapStore();
  const visiblePlaces = usePlaces();
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState(null);

  const map = useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
      setBounds(e.target.getBounds());
    },
    moveend: (e) => {
      setBounds(e.target.getBounds());
    },
    load: (e) => {
      setZoom(e.target.getZoom());
      setBounds(e.target.getBounds());
    }
  });

  // Filter by viewport with padding, then cap the count *within the viewport*
  const viewportPlaces = useMemo(() => {
    const candidates = (() => {
      if (!bounds) return visiblePlaces;
      const paddedBounds = bounds.pad(0.2);
      return visiblePlaces.filter(place => paddedBounds.contains([place.lat, place.lng]));
    })();

    return candidates
      .slice()
      .sort((a, b) => {
        // prioritize places with images and descriptions
        const scoreA = (a.imageUrl ? 1 : 0) + (a.description ? 1 : 0);
        const scoreB = (b.imageUrl ? 1 : 0) + (b.description ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, MAX_VIEWPORT_MARKERS);
  }, [visiblePlaces, bounds]);

  if (zoom < MIN_ZOOM_TO_SHOW) {
    return null;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading={true}
      maxClusterRadius={60}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      chunkInterval={200}
      chunkDelay={50}
    >
      {viewportPlaces.map((place) => (
        <HistoryMarker
          key={place.id}
          place={place}
          isSelected={selectedPlace?.id === place.id}
          onClick={setSelectedPlace}
        />
      ))}
    </MarkerClusterGroup>
  );
};

export default MarkerLayer;
