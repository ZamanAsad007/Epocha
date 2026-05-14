import React from 'react';

const Navbar = () => {
  return (
    <nav className="z-[3000] sticky top-0 w-full h-[56px] flex items-center justify-between px-6 bg-background-panel/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3">
        <div className="text-primary text-2xl flex items-center justify-center">
          <span role="img" aria-label="compass">🧭</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-widest text-primary leading-none uppercase">EPOCHA</span>
          <span className="font-sans text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Explore History</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="px-5 py-1.5 rounded-md border border-primary text-primary text-sm font-bold transition-all duration-300 hover:bg-primary hover:text-background-panel">
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
