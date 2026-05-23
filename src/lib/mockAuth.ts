import type { User } from "@supabase/supabase-js";

export const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@personas.dev",
  user_metadata: {
    full_name: "Demo User",
    avatar_url: "",
  },
} as unknown as User;

const MOCK_TOKEN = "mock-token-dev";

type SetState = (partial: {
  user?: User | null;
  accessToken?: string | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  isDemo?: boolean;
}) => void;

export function mockInitialize(set: SetState) {
  // Auto-authenticate so /dashboard is reachable without a sign-in click when
  // NEXT_PUBLIC_USE_MOCK_API=true. isDemo also surfaces the demo banner.
  set({
    user: MOCK_USER,
    accessToken: MOCK_TOKEN,
    isAuthenticated: true,
    isDemo: true,
    isLoading: false,
  });
}

export function mockSignIn(set: SetState) {
  set({ user: MOCK_USER, accessToken: MOCK_TOKEN, isAuthenticated: true });
}

export function mockSignOut(set: SetState) {
  set({ user: null, accessToken: null, isAuthenticated: false });
}
