import React from 'react';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import { usePlaces } from '../../hooks/usePlaces';

const FilterBar = () => {
  const { activeFilters, toggleFilter, places, bordersVisible, setBordersVisible, isGuest } = useMapStore();
  const visiblePlaces = usePlaces();

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-2 sm:py-2 bg-background-panel border-b border-border backdrop-blur-md bg-opacity-90 shadow-lg gap-3 sm:gap-0">
      <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-wrap">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const catColor = isActive ? config.color : 'text-secondary';
          
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-md border transition-all duration-300 whitespace-nowrap text-xs sm:text-sm font-sans
                ${isActive 
                  ? `bg-${key}/10 border-${key} text-${key}` 
                  : 'bg-background-card border-border text-text-secondary hover:border-text-muted'
                }
              `}
            >
              {isActive && (
                <span 
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: config.hex }}
                ></span>
              )}
              <span className="opacity-80 text-base sm:text-lg shrink-0">{config.icon}</span>
              <span className="font-medium tracking-tight uppercase text-[9px] sm:text-[11px]">{config.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto">
        <div className="relative group">
          <button
            onClick={() => !isGuest && setBordersVisible(!bordersVisible)}
            disabled={isGuest}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border text-[10px] sm:text-xs font-sans transition-all duration-300 whitespace-nowrap
              ${isGuest
                ? 'border-border/50 text-text-muted/50 bg-background-card/50 cursor-not-allowed opacity-60'
                : bordersVisible
                  ? 'border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(201,168,76,0.1)] hover:bg-primary/20 cursor-pointer'
                  : 'border-border text-text-muted hover:border-text-muted/80 bg-background-card cursor-pointer'
              }`}
          >
            <span className="text-sm sm:text-base">🗺️</span>
            <span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
              {isGuest ? 'Borders' : (bordersVisible ? 'Borders ON' : 'Borders OFF')}
            </span>
            {isGuest && (
              <span className="text-primary text-[10px] animate-pulse">🔒</span>
            )}
          </button>
          {isGuest && (
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 bg-[#141414] border border-[#C9A84C] rounded p-2.5 shadow-2xl text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold font-mono whitespace-nowrap">
              Sign in to see historical borders
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <span className="font-mono text-[9px] sm:text-[10px] text-primary/70 uppercase tracking-widest bg-background-card/50 px-3 py-1.5 rounded border border-border/50 shadow-inner whitespace-nowrap">
            Showing <span className="text-primary font-bold">{visiblePlaces.length}</span> of <span className="text-primary font-bold">{places.length}</span> records
          </span>
        </div>
      </div>

      <div className="sm:hidden flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.25em] text-text-muted font-bold">
        <span>Use the menu for categories</span>
        <span className="text-primary/70">{visiblePlaces.length}/{places.length}</span>
      </div>
    </div>
  );
};

export default FilterBar;
