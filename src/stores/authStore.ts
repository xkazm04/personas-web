import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import { mockSignIn, mockSignOut } from "@/lib/mockAuth";
import { clearUserScopedCaches } from "@/lib/clearUserCaches";
import type { User } from "@supabase/supabase-js";

let authSubscriptionCleanup: (() => void) | null = null;
let userSignOutInProgress = false;

/**
 * Shape-check an untrusted Supabase auth-token payload pulled from
 * localStorage. Returns the narrowed fields if everything looks right,
 * otherwise returns null so the caller falls back to getSession().
 *
 * Required: expires_at is a finite future unix-seconds number, user is an
 * object with a non-empty string id, and access_token is a non-empty string.
 */
function validateOptimisticSession(
  raw: unknown,
): { user: User; accessToken: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const expiresAt = r.expires_at;
  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) return null;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return null;

  const accessToken = r.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) return null;

  const user = r.user;
  if (!user || typeof user !== "object") return null;
  const userId = (user as Record<string, unknown>).id;
  if (typeof userId !== "string" || userId.length === 0) return null;

  return { user: user as User, accessToken };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  isDemo: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;
  sessionExpired: boolean;
  error: string | null;
  /** Last sign-in attempt failure reason, surfaced inline in SignInPrompt.
   *  Kept separate from `error` so it doesn't divert AuthGuard into the
   *  full-page SessionErrorPrompt when the user is simply not signed in yet. */
  signInError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  /** Un-gated public demo entry used by the standalone `/demo` route. */
  enterDemo: () => void;
  signOut: () => Promise<void>;
  initialize: () => (() => void) | undefined;
  retry: () => void;
  clearSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  isDemo: false,
  isSigningIn: false,
  isSigningOut: false,
  sessionExpired: false,
  error: null,
  signInError: null,

  initialize: () => {
    if (get().initialized) return authSubscriptionCleanup ?? undefined;
    set({ initialized: true, error: null });

    // A demo session (isDemo) is a deliberate, in-memory choice — never
    // re-run real auth over it (that would clobber the mock session on a
    // remount). Real auth runs in every environment otherwise.
    if (get().isDemo) {
      set({ isLoading: false });
      return authSubscriptionCleanup ?? undefined;
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      // Supabase not configured for this environment. Don't hard-error into the
      // session-error screen — fall through to the unauthenticated gate so the
      // user can still explore the demo (and a Google click surfaces a friendly
      // inline signInError). Keeps the "demo is always available" guarantee.
      set({ isLoading: false });
      return;
    }

    // Optimistic: check localStorage for a cached session to avoid skeleton flash.
    // The payload is untrusted (extensions, devtools, page-script tampering can
    // mutate it), so we validate the shape before letting it drive the UI or
    // gate any fetch. If anything looks off, fall through to getSession().
    if (typeof window !== "undefined") {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const projectRef = url.match(/\/\/([^.]+)/)?.[1] ?? "";
      if (projectRef) {
        try {
          const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
          if (raw) {
            const stored: unknown = JSON.parse(raw);
            const validated = validateOptimisticSession(stored);
            if (validated) {
              set({
                user: validated.user,
                accessToken: validated.accessToken,
                isAuthenticated: true,
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
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const wasAuthenticated = get().isAuthenticated;
        const nowAuthenticated = !!session?.user;
        set({
          user: session?.user ?? null,
          accessToken: session?.access_token ?? null,
          isAuthenticated: nowAuthenticated,
          isLoading: false,
          error: null,
          sessionExpired:
            wasAuthenticated && !nowAuthenticated && !userSignOutInProgress,
        });
      })
      .catch(() => {
        set({
          error: "Could not verify your session. Check your connection and try again.",
          isLoading: false,
        });
      });

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const wasAuthenticated = get().isAuthenticated;
      const nowAuthenticated = !!session?.user;
      // Clear every user-scoped cache whenever the identity behind the data
      // changes — expiry, revocation, sign-out in another tab, or a switch to a
      // different account — so no consumer keeps the previous account's
      // personas/executions/messages/leaderboard. A plain token refresh keeps
      // the same user id and is left untouched. (signOut clears via its own
      // finally; demo entry clears in signInAsDemo/enterDemo.)
      const prevUserId = get().user?.id ?? null;
      const nextUserId = session?.user?.id ?? null;
      if (prevUserId !== nextUserId) {
        clearUserScopedCaches();
      }
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: nowAuthenticated,
        isLoading: false,
        error: null,
        signInError: nowAuthenticated ? null : get().signInError,
        sessionExpired:
          wasAuthenticated && !nowAuthenticated && !userSignOutInProgress
            ? true
            : get().sessionExpired,
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
    // Explicit, user-initiated demo entry — available in every environment.
    // Mints an in-memory mock session; no real account is touched. Drop any
    // prior real account's caches first so demo never renders their data.
    clearUserScopedCaches();
    mockSignIn(set);
    set({ isDemo: true });
  },

  enterDemo: () => {
    // Public, un-gated entry for the standalone /demo route. Mints the mock
    // session and marks the store initialized so the dashboard's AuthProvider
    // won't re-run real auth and clobber the demo on the redirect into
    // /dashboard. Distinct from signInAsDemo (gated for the sign-in button).
    clearUserScopedCaches();
    mockSignIn(set);
    set({ isDemo: true, isLoading: false, initialized: true });
  },

  signInWithGoogle: async () => {
    set({ isSigningIn: true, signInError: null });
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        set({
          signInError:
            error.message ||
            "Couldn't start the sign-in flow. Please try again.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Couldn't reach the sign-in service. Check your connection and try again.";
      set({ signInError: message });
    } finally {
      set({ isSigningIn: false });
    }
  },

  signOut: async () => {
    set({ isSigningOut: true, error: null });
    userSignOutInProgress = true;

    try {
      if (authSubscriptionCleanup) {
        authSubscriptionCleanup();
      }

      if (get().isDemo) {
        mockSignOut(set);
        set({ isDemo: false, isSigningOut: false });
        return;
      }

      const supabase = getSupabase();
      await supabase.auth.signOut();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isSigningOut: false,
      });
    } catch {
      // Server may have already invalidated the session even though the
      // client call rejected (network blip mid-request). Force-clear local
      // state so the UI doesn't keep rendering an authenticated shell over a
      // dead token, and surface the failure so the user knows to retry.
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isDemo: false,
        isSigningOut: false,
        error:
          "Sign-out couldn't reach the server. You've been signed out locally — check your connection and retry to confirm.",
      });
    } finally {
      userSignOutInProgress = false;
      clearUserScopedCaches();
    }
  },

  retry: () => {
    authSubscriptionCleanup?.();
    set({ initialized: false, isLoading: true, error: null });
    get().initialize();
  },

  clearSessionExpired: () => set({ sessionExpired: false }),
}));
