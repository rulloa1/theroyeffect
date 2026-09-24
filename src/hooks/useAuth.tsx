import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    try {
      const res = supabase.auth.onAuthStateChange((_event, next) => {
        if (mounted) {
          setSession(next);
          setLoading(false);
        }
      });
      void supabase.auth
        .getSession()
        .then(({ data }) => {
          if (mounted) {
            setSession(data?.session ?? null);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });

      return () => {
        mounted = false;
        res?.data?.subscription?.unsubscribe();
      };
    } catch (err) {
      console.warn("[AuthProvider] Supabase auth not available:", err);
      if (mounted) {
        setSession(null);
        setLoading(false);
      }
      return () => {
        mounted = false;
      };
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
