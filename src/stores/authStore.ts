import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import { DEVELOPMENT } from "@/lib/dev";
import type { User } from "@supabase/supabase-js";

const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@personas.dev",
  user_metadata: {
    full_name: "Demo User",
    avatar_url: "",
  },
} as unknown as User;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    if (DEVELOPMENT) {
      // Dev mode: skip Supabase, wait for manual sign-in
      set({ isLoading: false });
      return;
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      // Supabase not configured — stay in unauthenticated state
      set({ isLoading: false });
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });

    // Listen for auth changes (sign-in, sign-out, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });
  },

  signInWithGoogle: async () => {
    if (DEVELOPMENT) {
      // Dev mode: immediately sign in with mock user
      set({
        user: MOCK_USER,
        accessToken: "mock-token-dev",
        isAuthenticated: true,
      });
      return;
    }

    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },

  signOut: async () => {
    if (DEVELOPMENT) {
      set({ user: null, accessToken: null, isAuthenticated: false });
      return;
    }

    const supabase = getSupabase();
    await supabase.auth.signOut();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
