import React from 'react';
import { Popup } from 'react-leaflet';
import { categoryConfig } from '../../utils/categoryConfig';

const MarkerPopup = ({ place }) => {
  const config = categoryConfig[place.category];

  return (
    <Popup className="custom-popup" offset={[0, -10]}>
      <div className="p-3 min-w-[180px] bg-background-card text-text-primary border border-border rounded shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl grayscale-[0.3]">{config?.icon}</span>
          <h3 className="font-heading font-bold text-primary m-0 leading-tight">{place.name}</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <span className="text-[9px] px-2 py-0.5 rounded border border-border bg-background-panel text-text-secondary uppercase tracking-widest font-sans">
            {place.category}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded border border-border bg-background-panel text-text-secondary uppercase tracking-widest font-sans">
            {place.era}
          </span>
        </div>
        <p className="text-[10px] font-mono text-primary/60 border-t border-border pt-2 mt-0 tracking-widest uppercase">
          {place.year < 0 ? `${Math.abs(place.year)} BC` : `${place.year} AD`}
        </p>
      </div>
    </Popup>
  );
};

export default MarkerPopup;
