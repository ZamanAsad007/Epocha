import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWikipedia from '../../hooks/useWikipedia';
import { supabase } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { categoryConfig } from '../../utils/categoryConfig';
import LoadingSpinner from '../UI/LoadingSpinner';

const PlaceDetail = ({ place, onStartQuiz, onViewStats }) => {
  const navigate = useNavigate();
  const wikiSlug = place.wikipediaSlug || place.wikipedia_slug;
  const { title, description, extract, thumbnail, loading, error } = useWikipedia(wikiSlug);
  const config = categoryConfig[place.category];
  const [bookmarkState, setBookmarkState] = useState('idle');

  const displayYear = place.year < 0 ? `${Math.abs(place.year)} BC` : `${place.year} AD`;

  useEffect(() => {
    setBookmarkState('idle');
  }, [place.id]);

  const handleSaveBookmark = async () => {
    if (bookmarkState === 'saving' || bookmarkState === 'saved') {
      return;
    }

    setBookmarkState('saving');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      await api.post(
        `/api/places/${place.id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      setBookmarkState('saved');
    } catch (saveError) {
      console.error('Error saving bookmark:', saveError);
      setBookmarkState('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* ... (Header, Image, Content) ... */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl opacity-90 grayscale-[0.5]">{config?.icon}</span>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-${place.category}`}>
            {config?.label}
          </span>
        </div>
        <h1 className="text-4xl font-heading font-bold mb-3 text-text-primary leading-tight">{place.name}</h1>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded bg-background-card text-[11px] text-text-secondary border border-border uppercase tracking-widest">
            {place.era}
          </span>
          <span className="px-3 py-1 rounded bg-background-card text-[11px] text-primary/80 border border-border uppercase font-mono tracking-tighter">
            {displayYear}
          </span>
        </div>
      </div>

      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-background-card border border-border relative shadow-inner">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : thumbnail ? (
          <img src={thumbnail} alt={place.name} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted italic text-sm font-serif">
            No visual record found in archives
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background-panel/40 to-transparent"></div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-3 bg-background-card rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-background-card rounded w-full animate-pulse"></div>
            <div className="h-3 bg-background-card rounded w-5/6 animate-pulse"></div>
          </div>
        ) : error ? (
          <p className="text-war text-sm font-serif italic">Communication with the global archives failed.</p>
        ) : (
          <>
            <p className="text-xl font-heading font-medium text-text-primary leading-snug">
              {description}
            </p>
            <p className="text-[15px] font-sans text-text-secondary leading-relaxed font-light">
              {extract}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-8 border-t border-border">
        <button 
          onClick={onStartQuiz}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-border bg-background-card hover:bg-background-panel hover:border-primary/30 transition-all text-[11px] font-bold uppercase tracking-widest text-text-primary"
        >
          <span className="opacity-60 text-sm">📝</span> Take Quiz
        </button>
        <button 
          onClick={onViewStats}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-border bg-background-card hover:bg-background-panel hover:border-primary/30 transition-all text-[11px] font-bold uppercase tracking-widest text-text-primary"
        >
          <span className="opacity-60 text-sm">📊</span> Stats
        </button>
        <button
          onClick={handleSaveBookmark}
          disabled={bookmarkState === 'saving' || bookmarkState === 'saved'}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded border transition-all text-[11px] font-bold uppercase tracking-widest ${bookmarkState === 'saved' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background-card hover:bg-background-panel hover:border-primary/30 text-text-primary'} disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          <span className="opacity-60 text-sm">{bookmarkState === 'saved' ? '✓' : '🔖'}</span>
          {bookmarkState === 'saving' ? 'Saving...' : bookmarkState === 'saved' ? 'Saved' : 'Save'}
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-border bg-background-card hover:bg-background-panel hover:border-primary/30 transition-all text-[11px] font-bold uppercase tracking-widest text-text-muted opacity-50 cursor-not-allowed">
          <span className="opacity-60 text-sm">🔗</span> Share
        </button>
      </div>
    </div>
  );
};

export default PlaceDetail;
