import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import { DEVELOPMENT } from "@/lib/dev";
import { mockInitialize, mockSignIn, mockSignOut } from "@/lib/mockAuth";
import type { User } from "@supabase/supabase-js";

let authSubscriptionCleanup: (() => void) | null = null;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  isDemo: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  initialize: () => (() => void) | undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  isDemo: false,

  initialize: () => {
    if (get().initialized) return authSubscriptionCleanup ?? undefined;
    set({ initialized: true });

    if (DEVELOPMENT) {
      mockInitialize(set);
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

    // Optimistic: check localStorage for a cached session to avoid skeleton flash
    if (typeof window !== "undefined") {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const projectRef = url.match(/\/\/([^.]+)/)?.[1] ?? "";
      if (projectRef) {
        try {
          const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
          if (raw) {
            const stored = JSON.parse(raw);
            const expiresAt = stored?.expires_at;
            // Only use if token hasn't expired yet
            if (expiresAt && expiresAt > Math.floor(Date.now() / 1000)) {
              set({
                user: stored.user ?? null,
                accessToken: stored.access_token ?? null,
                isAuthenticated: !!stored.user,
                isLoading: false,
              });
            }
          }
        } catch {
          // Ignore parse errors — fall through to getSession
        }
      }
    }

    // Validate session with server (updates or clears optimistic state)
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });

    authSubscriptionCleanup = () => {
      subscription.unsubscribe();
      authSubscriptionCleanup = null;
      set({ initialized: false });
    };

    return authSubscriptionCleanup;
  },

  signInAsDemo: () => {
    mockSignIn(set);
    set({ isDemo: true });
  },

  signInWithGoogle: async () => {
    if (DEVELOPMENT) {
      mockSignIn(set);
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
    if (authSubscriptionCleanup) {
      authSubscriptionCleanup();
    }

    if (DEVELOPMENT || get().isDemo) {
      mockSignOut(set);
      set({ isDemo: false });
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
