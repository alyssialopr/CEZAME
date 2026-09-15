import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase.js';
import api from '../services/api.js';
import { AdminUser } from '../types/index.js';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchCurrentUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchCurrentUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.session) {
        return { error: authError?.message || 'Identifiants invalides' };
      }

      // Vérifier le rôle auprès de l'API Node.js
      const { data: meData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authData.session.access_token}` },
      });

      if (!meData?.user) {
        await supabase.auth.signOut();
        return { error: 'Accès refusé : vous ne possédez pas les droits d’administration.' };
      }

      setUser(meData.user);
      return {};
    } catch (err: any) {
      await supabase.auth.signOut();
      return {
        error:
          err.response?.data?.error ||
          'Erreur d’accès : vérifiez que votre compte est déclaré comme administrateur.',
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperadmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSuperadmin,
        isAdmin,
        login,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
