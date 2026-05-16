import React, { useState, useEffect } from 'react';
import useMapStore from '../../store/mapStore';
import PlaceDetail from './PlaceDetail';
import QuizPanel from './QuizPanel';
import StatsPanel from './StatsPanel';

const Sidebar = () => {
  const { selectedPlace, clearSelectedPlace } = useMapStore();
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'quiz', 'stats'

  // Reset view when selected place changes
  useEffect(() => {
    setActiveTab('details');
  }, [selectedPlace?.id]);

  return (
    <div className={`
      z-[5000] fixed inset-y-0 right-0 
      w-full sm:w-[400px] 
      bg-background-panel border-l border-border shadow-[0_0_50px_rgba(0,0,0,0.5)]
      transition-transform duration-500 flex flex-col
      ${selectedPlace ? 'translate-x-0' : 'translate-x-full'}
      max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[80vh] max-sm:rounded-t-3xl max-sm:border-t max-sm:border-l-0
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-background-panel/90 backdrop-blur-md border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          {activeTab !== 'details' && (
            <button 
              onClick={() => setActiveTab('details')}
              className="p-2 -ml-2 rounded-full hover:bg-background-card text-text-muted hover:text-primary transition-all"
              title="Back to Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-xl font-display font-bold tracking-widest text-primary uppercase">
            {activeTab === 'details' ? 'Archival Details' : activeTab === 'quiz' ? 'Archival Trial' : 'Site Analytics'}
          </h2>
        </div>
        <button
          onClick={clearSelectedPlace}
          className="group flex items-center gap-2 p-2 px-3 rounded border border-border bg-background-card hover:bg-background-panel hover:border-primary/50 transition-all"
          title="Close Archives"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-primary">Close</span>
          <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {selectedPlace && (
          <>
            {activeTab === 'details' && (
              <PlaceDetail 
                place={selectedPlace} 
                onStartQuiz={() => setActiveTab('quiz')} 
                onViewStats={() => setActiveTab('stats')}
              />
            )}
            
            {activeTab === 'quiz' && (
              <QuizPanel placeId={selectedPlace.id} onBack={() => setActiveTab('details')} />
            )}
            
            {activeTab === 'stats' && (
              <StatsPanel selectedPlace={selectedPlace} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
