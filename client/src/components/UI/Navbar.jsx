import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMapStore from '../../store/mapStore';
import useAuth from '../../hooks/useAuth';
import { categoryConfig } from '../../utils/categoryConfig';

const getInitials = (value) => {
  const text = String(value || '').trim();
  if (!text) return 'E';
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isGuest, activeFilters, toggleFilter } = useMapStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative h-14 bg-background-panel border-b border-border px-3 sm:px-6 flex items-center justify-between z-[4000] sticky top-0 backdrop-blur-md bg-opacity-95">
      <Link to="/" className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_15px_rgba(201,168,76,0.3)] shrink-0">
          <span className="text-lg sm:text-xl font-serif">✥</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-display font-bold tracking-[0.2em] text-primary whitespace-nowrap">EPOCHA</h1>
      </Link>

      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="sm:hidden group flex items-center justify-center w-8 h-8 rounded-full border border-border bg-[#121212] text-text-muted hover:text-primary hover:border-primary shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-colors"
          aria-label="Open categories menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="block w-4 h-0.5 rounded-full bg-current transition-transform group-hover:scale-x-110" />
            <span className="block w-4 h-0.5 rounded-full bg-current transition-transform group-hover:scale-x-110" />
            <span className="block w-4 h-0.5 rounded-full bg-current transition-transform group-hover:scale-x-110" />
          </span>
        </button>

        {!isGuest && (
          <button
            onClick={() => navigate('/profile#bookmarks')}
            className="group relative text-text-muted hover:text-primary transition-colors p-1.5 sm:p-2 rounded-full hover:bg-background-card"
            title="Bookmarks"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background-panel px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Bookmarks
            </span>
          </button>
        )}

        {isGuest ? (
          <Link
            to="/auth"
            className="px-3 sm:px-5 py-1.5 border border-primary/40 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded hover:bg-primary hover:text-background transition-all duration-300 whitespace-nowrap"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 group relative cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">{user?.displayName}</p>
              <p className="text-[8px] sm:text-[9px] text-text-muted">Master Chronicler</p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background-card border border-border flex items-center justify-center text-primary group-hover:border-primary transition-colors overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.displayName || 'Profile avatar'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] sm:text-[11px] font-bold">{getInitials(user?.displayName || user?.email)}</span>
              )}
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-background-panel border border-border rounded shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => navigate('/profile')} className="w-full px-4 py-2 text-left text-[11px] sm:text-xs text-text-primary hover:bg-background-card uppercase tracking-widest">Profile</button>
              <div className="border-t border-border my-1"></div>
              <button onClick={async () => { await logout(); navigate('/auth'); }} className="w-full px-4 py-2 text-left text-[11px] sm:text-xs text-war hover:bg-war/10 uppercase tracking-widest">Sign Out</button>
            </div>
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden absolute right-0 top-[calc(100%+1px)] z-[4100] w-[min(18rem,calc(100vw-0.75rem))] rounded-bl-2xl border-l border-b border-border bg-[#121212] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div className="px-3 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.3em] text-text-muted font-bold">Categories</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] uppercase tracking-widest text-text-muted hover:text-primary"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const isActive = activeFilters.includes(key);

                return (
                  <button
                    key={key}
                    onClick={() => {
                      toggleFilter(key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-all duration-300 ${isActive ? `bg-${key}/10 border-${key} text-${key}` : 'bg-background-card border-border text-text-secondary'}`}
                  >
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.hex }} />
                    ) : (
                      <span className="text-base shrink-0 opacity-80">{config.icon}</span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
