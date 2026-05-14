import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePlaces } from '../../hooks/usePlaces';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import MarkerPopup from './MarkerPopup';

const MarkerLayer = () => {
  const places = usePlaces();
  const { selectedPlace, setSelectedPlace } = useMapStore();

  const markerColors = {
    war: '#C0392B',
    culture: '#C9A84C',
    music: '#7D5BA6',
    religion: '#2980B9',
    ruins: '#7F8C8D',
  };

  const createIcon = (category, isSelected) => {
    const color = markerColors[category] || '#C9A84C';
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
      {places.map((place) => {
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
