import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#0D0D0D]">
      {/* Blurry Background Effect */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
      </div>

      <div className="z-10 w-full max-w-[360px] p-6 bg-background-panel/80 backdrop-blur-xl border border-border rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-700">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_20px_rgba(201,168,76,0.3)]">
            <span className="text-xl font-serif">✥</span>
          </div>
        </div>

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-2xl font-display font-bold text-primary tracking-[0.1em] uppercase">
            {isLogin ? 'Welcome Back' : 'Begin Journey'}
          </h2>
          <p className="text-text-muted text-[10px] font-sans tracking-widest uppercase opacity-60">
            {isLogin ? 'Access the archives of time' : 'Create your identity in the chronicle'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-war/10 border border-war/20 text-war text-[10px] rounded text-center font-mono animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Chronicle Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background-card/50 border border-border focus:border-primary px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-300 rounded-md font-sans"
                placeholder="Herodotus"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background-card/50 border border-border focus:border-primary px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-300 rounded-md font-sans"
              placeholder="seeker@history.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Master Key</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-card/50 border border-border focus:border-primary px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-300 rounded-md font-mono"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-background text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary-hover transition-all duration-300 rounded-md shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-3">
          <p className="text-[10px] text-text-muted tracking-widest uppercase">
            {isLogin ? "New to the chronicle?" : "Already a member?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-primary hover:underline font-bold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          
          <button 
            onClick={() => navigate('/')}
            className="text-[9px] font-bold text-text-muted hover:text-primary uppercase tracking-[0.2em] transition-colors"
          >
            ← Return to Global Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
