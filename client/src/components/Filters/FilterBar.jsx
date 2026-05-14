import React from 'react';
import useMapStore from '../../store/mapStore';
import { categoryConfig } from '../../utils/categoryConfig';
import { places } from '../../data/places';

const FilterBar = () => {
  const { activeFilters, toggleFilter } = useMapStore();

  const getCount = (category) => {
    return places.filter((p) => p.category === category).length;
  };

  return (
    <div className="z-[1000] absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      {Object.entries(categoryConfig).map(([key, config]) => {
        const isActive = activeFilters.includes(key);
        const count = getCount(key);

        return (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${isActive 
                ? `bg-gray-700 text-white border-b-2 border-${config.color}` 
                : 'bg-transparent text-gray-400 hover:bg-white/5 border-b-2 border-transparent'
              }
            `}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="hidden sm:inline text-sm font-medium">{config.label}</span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md opacity-60">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
