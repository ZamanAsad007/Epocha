import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import MarkerPopup from './MarkerPopup';
import { usePlaces } from '../../hooks/usePlaces';

const MarkerLayer = () => {
  const { selectedPlace, setSelectedPlace } = useMapStore();
  const visiblePlaces = usePlaces();

  const createIcon = (category, isSelected) => {
    const config = categoryConfig[category];
    const color = config?.hex || '#C9A84C';
    const size = isSelected ? 22 : 14;
    
    return L.divIcon({
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
    });
  };

  return (
    <>
      {visiblePlaces.map((place) => {
        const isSelected = selectedPlace?.id === place.id;
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createIcon(place.category, isSelected)}
            eventHandlers={{
              click: () => setSelectedPlace(place),
            }}
          >
            <MarkerPopup place={place} />
          </Marker>
        );
      })}
    </>
  );
};

export default MarkerLayer;
