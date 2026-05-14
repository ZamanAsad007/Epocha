import React from 'react';
import { Popup } from 'react-leaflet';
import { categoryConfig } from '../../utils/categoryConfig';

const MarkerPopup = ({ place }) => {
  const config = categoryConfig[place.category];

  return (
    <Popup className="custom-popup">
      <div className="p-2 min-w-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{config?.icon}</span>
          <h3 className="font-bold text-gray-900 m-0">{place.name}</h3>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
            {place.category}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase">
            {place.era}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {place.year < 0 ? `${Math.abs(place.year)} BC` : `${place.year} AD`}
        </p>
      </div>
    </Popup>
  );
};

export default MarkerPopup;
