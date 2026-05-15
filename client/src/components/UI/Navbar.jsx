import { Link, useNavigate } from 'react-router-dom';
import useMapStore from '../../store/mapStore';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useMapStore();
  const { logout } = useAuth();

  return (
    <nav className="h-14 bg-background-panel border-b border-border px-6 flex items-center justify-between z-[4000] sticky top-0 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_15px_rgba(201,168,76,0.3)]">
          <span className="text-xl font-serif">✥</span>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-[0.2em] text-primary">EPOCHA</h1>
      </div>

      <div className="flex items-center gap-6">
        {!isGuest && (
          <button className="text-text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-background-card">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}

        {isGuest ? (
          <Link 
            to="/auth"
            className="px-5 py-1.5 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest rounded hover:bg-primary hover:text-background transition-all duration-300"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-3 group relative cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.displayName}</p>
              <p className="text-[9px] text-text-muted">Master Chronicler</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-background-card border border-border flex items-center justify-center text-primary group-hover:border-primary transition-colors">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="rounded-full" /> : <span>👤</span>}
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-background-panel border border-border rounded shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button className="w-full px-4 py-2 text-left text-xs text-text-primary hover:bg-background-card uppercase tracking-widest">Profile</button>
              <button className="w-full px-4 py-2 text-left text-xs text-text-primary hover:bg-background-card uppercase tracking-widest">Bookmarks</button>
              <div className="border-t border-border my-1"></div>
              <button onClick={logout} className="w-full px-4 py-2 text-left text-xs text-war hover:bg-war/10 uppercase tracking-widest">Sign Out</button>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
