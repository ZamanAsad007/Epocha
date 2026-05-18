import React, { useState, useEffect } from 'react';
import useMapStore from '../../store/mapStore';
import { api } from '../../utils/api.js';

const DailyBanner = () => {
  const { isGuest } = useMapStore();
  const [event, setEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isGuest) return;

    // Check if dismissed today
    const dismissedDate = localStorage.getItem('epocha_banner_dismissed');
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setIsVisible(false);
      return;
    }

    const fetchBanner = async () => {
      try {
        const response = await api.get('/api/places/banner/today');
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    };
    fetchBanner();
  }, [isGuest]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('epocha_banner_dismissed', new Date().toDateString());
  };

  if (isGuest || !isVisible || !event) return null;

  return (
    <div className="w-full bg-background-panel/80 backdrop-blur-md border-b border-border animate-in slide-in-from-top duration-700">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 border-l-4 border-primary">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-1">
            📅 On This Day in {event.year}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-heading font-bold text-text-primary">{event.title}</h3>
            <span className="text-xs text-text-muted font-light">— {event.description}</span>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-background-card rounded text-text-muted transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DailyBanner;
