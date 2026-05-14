import React, { useEffect, useState, useCallback } from 'react';
import useMapStore from '../../store/mapStore';
import LockBadge from '../UI/LockBadge';
import axios from 'axios';

// Simple local debounce implementation
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const eraLabels = [
  { max: 500, label: "Ancient World" },
  { max: 1500, label: "Medieval Era" },
  { max: 1900, label: "Colonial Era" },
  { max: 2024, label: "Modern Era" },
];

const TimeSlider = () => {
  const { sliderYear, setSliderYear, isGuest, setPlaces } = useMapStore();
  const [localYear, setLocalYear] = useState(sliderYear);

  const displayYear = localYear < 0 ? `${Math.abs(localYear)} BC` : `${localYear} AD`;
  const currentEra = eraLabels.find(era => localYear < era.max)?.label || "Modern Era";

  // Debounced API call to fetch places
  const fetchPlacesByYear = useCallback(
    debounce(async (year) => {
      try {
        const response = await axios.get(`http://localhost:3000/api/places?year=${year}`);
        if (setPlaces) setPlaces(response.data);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    }, 400),
    [setPlaces]
  );

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    
    if (isGuest && val > 1945) {
      setLocalYear(1945);
      return;
    }

    setLocalYear(val);
    setSliderYear(val);
    fetchPlacesByYear(val);
  };

  return (
    <div className="z-[1000] absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px]">
      <div className="p-5 bg-background-panel/90 backdrop-blur-md rounded border border-border shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-primary tracking-tighter">
                {displayYear}
              </span>
              {isGuest && <LockBadge />}
            </div>
            <span className="text-[10px] font-display text-text-muted uppercase tracking-[0.2em]">
              {currentEra}
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-bold font-sans text-right">
            Chronological Archive
          </div>
        </div>
        
        <div className="relative group px-1">
          <input
            type="range"
            min="-3000"
            max="2024"
            value={localYear}
            onChange={handleChange}
            className={`
              w-full h-1 rounded-full appearance-none cursor-pointer
              ${isGuest ? 'bg-border' : 'bg-background-card accent-primary'}
              range-thumb-gold
            `}
          />
          {isGuest && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background-panel/60 rounded pointer-events-none">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-background-card px-3 py-1.5 border border-border rounded shadow-xl">
                Login to access all eras
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase tracking-tighter">
          <span>3000 BC</span>
          <span className="opacity-40">●</span>
          <span>2024 AD</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
