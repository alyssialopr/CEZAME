import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isInitialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Validate session against the server to check if user was deleted
        const { error } = await supabase.auth.getUser();
        if (error) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
