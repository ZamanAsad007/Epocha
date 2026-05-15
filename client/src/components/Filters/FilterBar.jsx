import React from 'react';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import { usePlaces } from '../../hooks/usePlaces';

const FilterBar = () => {
  const { activeFilters, toggleFilter } = useMapStore();
  const visiblePlaces = usePlaces();

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 bg-background-panel border-b border-border backdrop-blur-md bg-opacity-90 shadow-lg">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const catColor = isActive ? config.color : 'text-secondary';
          
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-md border transition-all duration-300 whitespace-nowrap text-sm font-sans
                ${isActive 
                  ? `bg-${key}/10 border-${key} text-${key}` 
                  : 'bg-background-card border-border text-text-secondary hover:border-text-muted'
                }
              `}
            >
              {isActive && (
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: config.hex }}
                ></span>
              )}
              <span className="opacity-80">{config.icon}</span>
              <span className="font-medium tracking-tight uppercase text-[11px]">{config.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden sm:block">
        <span className="font-mono text-[11px] text-primary/60 uppercase tracking-widest">
          {visiblePlaces.length} places visible
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
