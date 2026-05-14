import React from 'react';

const Navbar = () => {
  return (
    <nav className="z-[3000] sticky top-0 w-full h-16 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-2xl">⏳</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter leading-none">EPOCHA</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">History Unfolded</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all duration-300">
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
