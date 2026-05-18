import React, { useState, useCallback } from 'react';
import useMapStore from '../../store/mapStore';
import LockBadge from '../UI/LockBadge';
import { debounce } from '../../utils/debounce';

const eraLabels = [
  { max: 0, label: "Late Ancient World" },
  { max: 500, label: "Early Ancient / Roman Era" },
  { max: 1500, label: "Medieval Era" },
  { max: 1900, label: "Colonial Era" },
  { max: 2024, label: "Modern Era" },
];

const TimeSlider = () => {
  const { sliderYear, setSliderYear, isGuest } = useMapStore();
  const [localYear, setLocalYear] = useState(sliderYear);

  const displayYear = localYear < 0 
    ? `${Math.abs(localYear)} BC` 
    : (localYear === 0 ? '1 AD' : `${localYear} AD`);
  const currentEra = eraLabels.find(era => localYear < era.max)?.label || "Modern Era";

  // Debounced store update
  const debouncedSetYear = useCallback(
    debounce((year) => {
      setSliderYear(year);
    }, 400),
    [setSliderYear]
  );

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    
    if (isGuest && val > 1945) {
      setLocalYear(1945);
      debouncedSetYear(1945);
      return;
    }

    setLocalYear(val);
    debouncedSetYear(val);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setLocalYear('');
      return;
    }
    
    let year = parseInt(val);
    if (isNaN(year)) return;

    // Clamp values
    if (year < -500) year = -500;
    if (year > 2024) year = 2024;
    
    if (isGuest && year > 1945) {
      year = 1945;
    }

    setLocalYear(year);
    debouncedSetYear(year);
  };

  return (
    <div className="z-[1000] absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px]">
      <div className="p-5 bg-background-panel/90 backdrop-blur-md rounded border border-border shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="number"
                  value={localYear}
                  onChange={handleInputChange}
                  className="w-24 bg-background-card/50 border border-border/50 rounded px-2 py-1 font-mono text-xl font-bold text-primary focus:outline-none focus:border-primary/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Year"
                />
                <span className="absolute -top-4 left-0 text-[9px] text-text-muted uppercase tracking-widest font-bold">
                  Go to Year
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-primary tracking-tighter min-w-[100px]">
                  {displayYear}
                </span>
                {isGuest && <LockBadge />}
              </div>
            </div>
            <span className="text-[10px] font-display text-text-muted uppercase tracking-[0.2em] mt-1">
              {currentEra}
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-bold font-sans text-right hidden sm:block">
            Chronological Archive
          </div>
        </div>
        
        <div className="relative group px-1">
          <input
            type="range"
            min="-500"
            max="2024"
            value={localYear || 0}
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
          <span>500 BC</span>
          <span className="opacity-40">●</span>
          <span>2024 AD</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
