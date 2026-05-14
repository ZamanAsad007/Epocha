import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import useMapStore from '../store/mapStore';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${supabase.auth.session()?.access_token || (await supabase.auth.getSession()).data.session?.access_token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(supabaseUser); // Fallback to basic supabase user
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, displayName) => {
    // Call our backend to handle registration + Prisma sync
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      email,
      password,
      displayName
    });
    
    // Then sign in via supabase
    await login(email, password);
    return response.data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, login, signup, logout };
};

export default useAuth;
