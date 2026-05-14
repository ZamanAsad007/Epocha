import React from 'react';
import useMapStore from '../../store/mapStore';
import LockBadge from '../UI/LockBadge';

const TimeSlider = () => {
  const { sliderYear, setSliderYear, isGuest } = useMapStore();

  const handleChange = (e) => {
    if (!isGuest) {
      setSliderYear(parseInt(e.target.value));
    }
  };

  const displayYear = sliderYear < 0 ? `${Math.abs(sliderYear)} BC` : `${sliderYear} AD`;

  return (
    <div className="z-[1000] absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px]">
      <div className="p-4 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">
              {displayYear}
            </span>
            {isGuest && <LockBadge />}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            Timeline
          </div>
        </div>
        
        <div className="relative group">
          <input
            type="range"
            min="-3000"
            max="2024"
            value={sliderYear}
            onChange={handleChange}
            disabled={isGuest}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
              ${isGuest ? 'bg-gray-800' : 'bg-gray-700 accent-blue-500'}
            `}
          />
          {isGuest && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/40 rounded-lg pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter bg-black/50 px-2 py-1 rounded">
                Login to travel in time
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-gray-600">
          <span>3000 BC</span>
          <span>0</span>
          <span>2024 AD</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
