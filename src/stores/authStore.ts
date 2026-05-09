import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import { DEVELOPMENT } from "@/lib/dev";
import { mockInitialize, mockSignIn, mockSignOut } from "@/lib/mockAuth";
import { clearUserScopedCaches } from "@/lib/clearUserCaches";
import type { User } from "@supabase/supabase-js";

let authSubscriptionCleanup: (() => void) | null = null;
// Tracks the last-seen user id so we can detect user-switch transitions and
// purge caches before the new user can read leftover state.
let lastSeenUserId: string | null = null;
// Closure that re-runs server session validation. Set by initialize(),
// invoked by retry().
let validateSessionFn: (() => void) | null = null;

const SESSION_VALIDATION_TIMEOUT_MS = 5000;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  isDemo: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  initialize: () => (() => void) | undefined;
  retry: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  isDemo: false,
  error: null,

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

    // Apply a new session, clearing user-scoped caches first if the user id
    // transitioned (null→user, user→other-user, user→null). This is the only
    // place auth state mutates from a session payload, so it's also the only
    // place we need the cross-user-leak guard.
    const applySession = (
      user: User | null,
      accessToken: string | null,
    ): void => {
      const nextUserId = user?.id ?? null;
      if (nextUserId !== lastSeenUserId) {
        clearUserScopedCaches();
        lastSeenUserId = nextUserId;
      }
      set({
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    };

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
              applySession(stored.user ?? null, stored.access_token ?? null);
            }
          }
        } catch {
          // Ignore parse errors — fall through to getSession
        }
      }
    }

    // Validate session with server. Reject paths covered: network failure,
    // ad-blocker false positive, Supabase outage, hung connection (5s timeout).
    // Without these guards isLoading stays true forever and AuthGuard renders
    // a skeleton with no recovery path.
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const runValidation = () => {
      set({ isLoading: true, error: null });

      if (timeoutId !== null) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        set({
          isLoading: false,
          error: "Connection timed out. Check your network and retry.",
        });
      }, SESSION_VALIDATION_TIMEOUT_MS);

      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          applySession(session?.user ?? null, session?.access_token ?? null);
        })
        .catch((err: unknown) => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          const message =
            err instanceof Error
              ? err.message
              : "Failed to validate session. Please retry.";
          set({ isLoading: false, error: message });
        });
    };

    validateSessionFn = runValidation;
    runValidation();

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null, session?.access_token ?? null);
    });

    authSubscriptionCleanup = () => {
      subscription.unsubscribe();
      authSubscriptionCleanup = null;
      validateSessionFn = null;
      set({ initialized: false });
    };

    return authSubscriptionCleanup;
  },

  retry: () => {
    if (validateSessionFn) {
      validateSessionFn();
      return;
    }
    // Subscription was torn down (or never set up); rerun initialize from
    // a clean slate so we get a fresh validation closure.
    set({ initialized: false, error: null, isLoading: true });
    get().initialize();
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

    // Drop user-scoped caches eagerly. The auth listener was just torn down,
    // so onAuthStateChange won't fire to do this for us — and we don't want
    // any UI that re-renders during the await below to see the prior user's
    // personas/executions/reviews.
    clearUserScopedCaches();
    lastSeenUserId = null;

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
