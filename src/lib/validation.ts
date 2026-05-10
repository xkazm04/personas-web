/**
 * Shared email validation used by all API routes and client-side forms.
 *
 * Pattern blocks special characters (angle brackets, quotes, backticks,
 * semicolons, parentheses, braces, brackets, backslashes) and requires a
 * 2+ character alphabetic TLD. Intentionally simple to avoid ReDoS.
 */
const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
}

/**
 * Anonymous voter identifier. Generated client-side, persisted in
 * localStorage. Anyone can mint these — the server cannot distinguish a
 * real voter from a script that generates fresh IDs per request.
 *
 * What this validator does: rejects garbage that doesn't even *look* like
 * a client-generated ID, so accidentally-pasted strings, prototypes, or
 * obviously-malformed values are turned away cheaply at the route boundary.
 *
 * What this validator does NOT do: prevent vote-stuffing. The current
 * design has no signed-cookie binding, captcha, or DB-level UNIQUE
 * constraint, so a determined attacker can still mint thousands of fresh
 * IDs. The follow-up work for real voting integrity is to bind voterId to
 * an HttpOnly signed cookie (HMAC of a server-issued nonce) and add a
 * UNIQUE(feature_id, voter_id) constraint in Supabase.
 */
const VOTER_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;

export function isValidVoterId(value: unknown): value is string {
  return typeof value === "string" && VOTER_ID_RE.test(value);
}
