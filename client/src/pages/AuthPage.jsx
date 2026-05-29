import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, signInWithGoogle, resendVerification } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.search.includes('verified=1') ? 'Email verified. You can sign in now.' : '');
  const [loading, setLoading] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setCanResendVerification(false);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await signup(email, password, displayName);
        setIsLogin(true);
        setNotice('Verification email sent. Check your inbox before signing in.');
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in.');
        setCanResendVerification(true);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setNotice('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      await resendVerification(email);
      setNotice('Verification email resent. Check your inbox.');
      setCanResendVerification(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Could not resend verification email');
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

        {notice && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 text-primary text-[10px] rounded text-center font-mono">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-war/10 border border-war/20 text-war text-[10px] rounded text-center font-mono animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {canResendVerification && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading || !email}
            className="mb-4 w-full py-2 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded disabled:opacity-50"
          >
            Resend verification email
          </button>
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
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-border text-text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-background-card transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Redirecting...' : 'Sign in with Google'}
          </button>

          <button 
            type="button"
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
