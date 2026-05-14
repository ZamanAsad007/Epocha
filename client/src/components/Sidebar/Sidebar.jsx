import React, { useState, useEffect } from 'react';
import useMapStore from '../../store/mapStore';
import PlaceDetail from './PlaceDetail';
import QuizPanel from './QuizPanel';

const Sidebar = () => {
  const { selectedPlace, clearSelectedPlace } = useMapStore();
  const [view, setView] = useState('detail'); // 'detail' or 'quiz'

  // Reset view when selected place changes
  useEffect(() => {
    setView('detail');
  }, [selectedPlace?.id]);

  return (
    <div className={`
      z-[2000] fixed inset-y-0 right-0 
      w-full sm:w-[400px] 
      bg-background-panel border-l border-border shadow-[0_0_50px_rgba(0,0,0,0.5)]
      transition-transform duration-500 overflow-y-auto
      ${selectedPlace ? 'translate-x-0' : 'translate-x-full'}
      max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[80vh] max-sm:rounded-t-3xl max-sm:border-t max-sm:border-l-0
    `}>
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-background-panel/90 backdrop-blur-md border-b border-border">
        <h2 className="text-xl font-display font-bold tracking-widest text-primary uppercase">
          {selectedPlace ? (view === 'detail' ? 'Archival Details' : 'Knowledge Trial') : ''}
        </h2>
        <button
          onClick={clearSelectedPlace}
          className="p-2 rounded-full hover:bg-background-card text-text-muted transition-colors border border-transparent hover:border-border"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-6">
        {selectedPlace && (
          view === 'detail' ? (
            <PlaceDetail place={selectedPlace} onStartQuiz={() => setView('quiz')} />
          ) : (
            <QuizPanel placeId={selectedPlace.id} onBack={() => setView('detail')} />
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
