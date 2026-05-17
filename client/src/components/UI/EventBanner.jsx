// src/components/UI/EventBanner.jsx
import React, { useEffect } from 'react';

const TYPE_COLORS = {
  war:         '#C0392B',   // red
  political:   '#C9A84C',   // gold
  cultural:    '#7D5BA6',   // purple
  exploration: '#2980B9',   // blue
};

const formatYear = (year) => {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 AD';
  return `${year} AD`;
};

const EventBanner = ({ event, onDismiss, onFlyTo }) => {
  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(onDismiss, 6000);  // auto dismiss 6s
    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  const color = TYPE_COLORS[event.type] || '#C9A84C';

  return (
    // Fixed position below navbar (top-14), above content
    <div 
      className="fixed top-16 left-1/2 transform -translate-x-1/2
                 z-[4000] w-[90%] max-w-2xl
                 bg-[#141414]/95 backdrop-blur-md border rounded-lg p-4
                 shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-slide-down"
      style={{ borderColor: color }}
    >
      {/* Left colored accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
        style={{ backgroundColor: color }} 
      />

      <div className="pl-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Year badge */}
          <span 
            className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-widest"
            style={{ 
              color, 
              borderColor: color + '40',
              backgroundColor: color + '15' 
            }}
          >
            {formatYear(event.year)}
          </span>

          {/* Title */}
          <h3 className="text-[#F0E6D3] font-serif text-lg font-bold mt-2 tracking-wide">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-[#9A8F7E] font-sans text-xs mt-1 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {event.region && (
            <button
              onClick={() => onFlyTo(event.region)}
              className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border font-bold font-sans transition-all duration-300 bg-transparent hover:bg-white/5 active:scale-95"
              style={{ color, borderColor: color }}
            >
              View on Map →
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-border text-text-secondary font-sans font-bold hover:text-[#F0E6D3] hover:border-text-muted transition-colors active:scale-95 bg-[#1C1A16]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
