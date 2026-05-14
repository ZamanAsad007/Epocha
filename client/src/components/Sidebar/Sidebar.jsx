import React from 'react';
import useMapStore from '../../store/mapStore';
import PlaceDetail from './PlaceDetail';

const Sidebar = () => {
  const { selectedPlace, clearSelectedPlace } = useMapStore();

  return (
    <div className={`
      z-[2000] fixed inset-y-0 right-0 
      w-full sm:w-[400px] 
      bg-gray-900 border-l border-white/10 shadow-2xl 
      transition-transform duration-500 overflow-y-auto
      ${selectedPlace ? 'translate-x-0' : 'translate-x-full'}
      max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[80vh] max-sm:rounded-t-3xl max-sm:border-t max-sm:border-l-0
    `}>
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-md border-b border-white/5">
        <h2 className="text-xl font-bold tracking-tight">{selectedPlace ? 'Details' : ''}</h2>
        <button
          onClick={clearSelectedPlace}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-6">
        {selectedPlace && <PlaceDetail place={selectedPlace} />}
      </div>
    </div>
  );
};

export default Sidebar;
