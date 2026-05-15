import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 bg-background/90 backdrop-blur-md overflow-y-auto pt-20 md:items-center md:pt-4">
      <div className="w-full max-w-md bg-background-panel border border-border rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-primary tracking-widest uppercase">Begin Journey</h2>
            <p className="text-text-muted text-sm font-sans tracking-wide">Create your archival identity</p>
          </div>

          {error && (
            <div className="p-3 bg-war/10 border border-war/20 text-war text-xs rounded text-center font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Chronicle Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background-card border border-border px-4 py-3 text-text-primary focus:border-primary outline-none transition-colors font-sans"
                placeholder="Herodotus"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background-card border border-border px-4 py-3 text-text-primary focus:border-primary outline-none transition-colors font-sans"
                placeholder="seeker@history.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Master Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background-card border border-border px-4 py-3 text-text-primary focus:border-primary outline-none transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-background-panel font-bold uppercase tracking-[0.2em] hover:bg-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted">
            Already a member of the guild?{' '}
            <button onClick={onSwitchToLogin} className="text-primary hover:underline uppercase tracking-widest font-bold">Sign In</button>
          </p>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
    </div>
  );
};

export default SignupModal;
