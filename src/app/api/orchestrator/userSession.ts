import "server-only";
import { getOptionalEnv } from "@/lib/server/env";

/**
 * Who is asking, before the orchestrator proxy lends them the team key.
 *
 * The proxy attaches `TEAM_API_KEY` server-side so the key never enters the
 * browser bundle. But a key attached to every request lends its authority to
 * anyone who can reach the route, so keeping it out of the bundle is only half
 * the job. The browser's `X-User-Token` is the user's Supabase access token,
 * and Supabase Auth (`GET /auth/v1/user`) is the party that can say whether it
 * belongs to a live session. Only a verified session gets the key.
 *
 * A verified token is remembered for {@link VERIFIED_TTL_MS} (keyed by its
 * SHA-256, never the token itself), so a polling dashboard does not pay an
 * Auth round trip per request. A refusal is never remembered.
 */

export type SessionVerdict = "verified" | "missing" | "rejected" | "unavailable";

export const VERIFIED_TTL_MS = 30_000;

/** Far longer than any Supabase access token: anything bigger is not one. */
const MAX_TOKEN_LENGTH = 8192;
const MAX_REMEMBERED = 1000;
const AUTH_TIMEOUT_MS = 5_000;

export interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
}

export interface SessionVerifierDeps {
  fetchImpl?: typeof fetch;
  now?: () => number;
  /** Defaults to NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY; null when unset. */
  config?: () => SupabaseAuthConfig | null;
}

function configFromEnv(): SupabaseAuthConfig | null {
  const url = getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return url && anonKey ? { url, anonKey } : null;
}

async function digest(token: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createSessionVerifier(deps: SessionVerifierDeps = {}) {
  const fetchImpl = deps.fetchImpl ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));
  const now = deps.now ?? Date.now;
  const config = deps.config ?? configFromEnv;
  const remembered = new Map<string, number>();

  return async function verifySession(token: string | null): Promise<SessionVerdict> {
    const t = token?.trim();
    if (!t) return "missing";
    if (t.length > MAX_TOKEN_LENGTH) return "rejected";
    // No Supabase, no way to sign in: nobody can be verified, so nobody gets the key.
    const auth = config();
    if (!auth) return "unavailable";

    const key = await digest(t);
    const until = remembered.get(key);
    if (until !== undefined) {
      if (until > now()) return "verified";
      remembered.delete(key);
    }

    let res: Response;
    try {
      res = await fetchImpl(`${auth.url.replace(/\/+$/, "")}/auth/v1/user`, {
        headers: { apikey: auth.anonKey, Authorization: `Bearer ${t}` },
        cache: "no-store",
        signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
      });
    } catch {
      return "unavailable";
    }
    void res.body?.cancel().catch(() => {});
    // 4xx is Auth refusing the token; 429 and 5xx mean it could not answer.
    if (res.status >= 400 && res.status < 500 && res.status !== 429) return "rejected";
    if (!res.ok) return "unavailable";

    if (remembered.size >= MAX_REMEMBERED) {
      const oldest = remembered.keys().next().value;
      if (oldest !== undefined) remembered.delete(oldest);
    }
    remembered.set(key, now() + VERIFIED_TTL_MS);
    return "verified";
  };
}

/** The proxy's verifier: env-configured, one cache per server instance. */
export const verifySession = createSessionVerifier();
