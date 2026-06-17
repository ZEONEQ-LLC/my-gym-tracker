"use client";

// Client-side auth state. Provides the current Supabase user (and its id) to
// the React tree and keeps it in sync via onAuthStateChange. The repository
// hooks read useUserId() so every query/mutation is scoped to the signed-in
// user instead of the old LOCAL_USER constant.

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";

type AuthState = { user: User | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setState({ user: data.user, loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useUserId(): string | null {
  return useContext(AuthContext).user?.id ?? null;
}
