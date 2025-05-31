import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return error ? null : data;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
          setProfile(await loadProfile(session.user.id));
        }
        setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (isMounted) {
            if (session?.user) {
              setUser(session.user);
              setProfile(await loadProfile(session.user.id));
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        }
      );

      return () => subscription.unsubscribe();
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      setUser(data.user);
      setProfile(await loadProfile(data.user.id));
      return data;
    },
    signUp: async (email, password, name) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;
      setUser(data.user);
      setProfile(await loadProfile(data.user.id));
      return data;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);