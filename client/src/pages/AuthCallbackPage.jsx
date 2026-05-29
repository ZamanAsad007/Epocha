import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth, { supabase } from '../hooks/useAuth';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchProfile } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    let cancelled = false;

    const finishSignIn = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            setMessage('Sign-in session not found. Redirecting...');
            navigate('/auth', { replace: true });
          }
          return;
        }

        const next = new URLSearchParams(location.search).get('next') || '/profile';

        void fetchProfile(session.user)
          .finally(() => {
            window.dispatchEvent(new CustomEvent('epocha-profile-refresh'));
          });

        if (!cancelled) {
          navigate(next, { replace: true });
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        if (!cancelled) {
          setMessage(error.message || 'Google sign-in failed. Redirecting...');
          navigate('/auth', { replace: true });
        }
      }
    };

    finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [fetchProfile, location.search, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0D0D0D] text-text-primary px-6">
      <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-border bg-background-panel/90 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center text-primary">
          <span className="text-xl font-serif">✥</span>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-[0.14em] uppercase text-primary">
          Google Login
        </h1>
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;