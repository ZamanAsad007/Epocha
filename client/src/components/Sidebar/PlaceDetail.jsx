import React from 'react';
import useWikipedia from '../../hooks/useWikipedia';
import { categoryConfig } from '../../utils/categoryConfig';
import LoadingSpinner from '../UI/LoadingSpinner';

const PlaceDetail = ({ place }) => {
  const { title, description, extract, thumbnail, loading, error } = useWikipedia(place.wikipedia_slug);
  const config = categoryConfig[place.category];

  const displayYear = place.year < 0 ? `${Math.abs(place.year)} BC` : `${place.year} AD`;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">{config?.icon}</span>
          <span className={`text-xs font-bold uppercase tracking-widest text-${config?.color}`}>
            {config?.label}
          </span>
        </div>
        <h1 className="text-3xl font-black mb-1">{place.name}</h1>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/10 uppercase">
            {place.era}
          </span>
          <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/10 uppercase font-mono">
            {displayYear}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : thumbnail ? (
          <img src={thumbnail} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 italic">
            No image available
          </div>
        )}
      </div>

      {/* Wikipedia Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm">Failed to load description from Wikipedia.</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-300 leading-tight">
              {description}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              {extract}
            </p>
          </>
        )}
      </div>

      {/* Action Buttons (Stubbed) */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium opacity-50 cursor-not-allowed">
          <span>📝</span> Quiz
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium opacity-50 cursor-not-allowed">
          <span>📊</span> Stats
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium opacity-50 cursor-not-allowed">
          <span>🔖</span> Save
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium opacity-50 cursor-not-allowed">
          <span>🔗</span> Share
        </button>
      </div>
    </div>
  );
};

export default PlaceDetail;
