import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const { login, signInWithGoogle, resendVerification } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setCanResendVerification(false);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNotice('Verification email required. Check your inbox or sign up again to resend.');
        setError('Please verify your email before signing in.');
        setCanResendVerification(true);
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 bg-background/90 backdrop-blur-md overflow-y-auto pt-20 md:items-center md:pt-4">
      <div className="w-full max-w-md bg-background-panel border border-border rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-primary tracking-widest uppercase">Welcome Back</h2>
            <p className="text-text-muted text-sm font-sans tracking-wide">Continue your journey through the ages</p>
          </div>

          {notice && (
            <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs rounded text-center font-mono">
              {notice}
            </div>
          )}

          {error && (
            <div className="p-3 bg-war/10 border border-war/20 text-war text-xs rounded text-center font-mono">
              {error}
            </div>
          )}

          {canResendVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading || !email}
              className="w-full py-2 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded disabled:opacity-50"
            >
              Resend verification email
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background-panel px-2 text-text-muted uppercase tracking-widest">or</span></div>
          </div>

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

          <p className="text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="text-primary hover:underline uppercase tracking-widest font-bold">Sign Up</button>
          </p>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
    </div>
  );
};

export default LoginModal;
