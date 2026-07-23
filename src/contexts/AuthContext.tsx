import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthModalOpen: false,
  authModalTab: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.warn('Failed to fetch initial session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.warn('Could not fetch profile, using fallback:', error.message || error);
        setProfile({
          id: userId,
          email: userEmail || '',
          role: 'user'
        });
        return;
      }

      if (!data) {
        const email = userEmail || '';
        if (email) {
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: userId, email, role: 'user' }])
              .select()
              .maybeSingle();
              
            if (!insertError && newProfile) {
              setProfile(applyLocalOverrides(newProfile as Profile));
              return;
            }
          } catch (e) {
            console.warn('Profile insert error:', e);
          }
        }
        setProfile(applyLocalOverrides({ id: userId, email: email, role: 'user' }));
      } else {
        setProfile(applyLocalOverrides(data as Profile));
      }
    } catch (error) {
      console.warn('Unexpected error fetching profile:', error);
      setProfile(applyLocalOverrides({ id: userId, email: userEmail || '', role: 'user' }));
    } finally {
      setLoading(false);
    }
  };

  const applyLocalOverrides = (prof: Profile): Profile => {
    try {
      const localUsernames = JSON.parse(localStorage.getItem('custom_usernames') || '{}');
      if (prof.id && localUsernames[prof.id]) {
        return { ...prof, username: localUsernames[prof.id] };
      }
    } catch (e) {}
    return prof;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  const updateProfile = (updated: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...updated } : null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal, signOut, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
