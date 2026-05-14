import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { usePlaces } from '../../hooks/usePlaces';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import MarkerPopup from './MarkerPopup';

const MarkerLayer = () => {
  const places = usePlaces();
  const setSelectedPlace = useMapStore((state) => state.setSelectedPlace);

  return (
    <>
      {places.map((place) => {
        const config = categoryConfig[place.category];
        const color = config ? `var(--color-${place.category})` : '#ffffff';
        
        // Tailwind colors are defined in tailwind.config.cjs
        // However, Leaflet needs hex or standard CSS colors.
        // Let's use a small helper or just hardcode the HSL from the config for the markers.
        const markerColors = {
            war: 'hsl(0, 80%, 50%)',
            culture: 'hsl(30, 80%, 50%)',
            music: 'hsl(280, 80%, 50%)',
            religion: 'hsl(210, 80%, 50%)',
            ruins: 'hsl(0, 0%, 50%)',
        };

        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={8}
            pathOptions={{
              fillColor: markerColors[place.category] || '#ffffff',
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 1,
            }}
            eventHandlers={{
              click: () => {
                setSelectedPlace(place);
              },
            }}
          >
            <MarkerPopup place={place} />
          </CircleMarker>
        );
      })}
    </>
  );
};

export default MarkerLayer;
