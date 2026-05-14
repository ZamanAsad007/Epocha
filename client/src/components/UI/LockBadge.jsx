import React from 'react';

const LockBadge = () => {
  return (
    <div className="flex items-center justify-center p-1.5 bg-primary/20 rounded-md border border-primary/30 text-primary group relative">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

export default LockBadge;
