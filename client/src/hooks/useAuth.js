import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import useMapStore from '../store/mapStore';
import { api } from '../utils/api.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getGoogleRedirectUrl = () => {
  if (import.meta.env.VITE_SUPABASE_REDIRECT_URL) {
    return import.meta.env.VITE_SUPABASE_REDIRECT_URL;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return undefined;
};

const useAuth = () => {
  const { setUser, user } = useMapStore();

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (supabaseUser) => {
    try {
      // Get full profile from our backend
      const { data: { session } } = await supabase.auth.getSession();
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setUser(response.data.user || response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error?.response?.status === 403 && error?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        await supabase.auth.signOut();
        setUser(null);
        return null;
      }
      setUser(supabaseUser); // Fallback to basic supabase user
      return null;
    }
  };

  const updateProfile = async (payload) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await api.put('/api/auth/me', payload, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    setUser(response.data.user || response.data);
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { session } = response.data || {};

    if (session?.access_token && session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    return response.data;
  };

  const signInWithGoogle = async () => {
    const redirectTo = getGoogleRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (error) throw error;
    return data;
  };

  const signup = async (email, password, displayName) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      displayName
    });
    return response.data;
  };

  const resendVerification = async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, login, signup, logout, fetchProfile, updateProfile, signInWithGoogle, resendVerification };
};

export default useAuth;
