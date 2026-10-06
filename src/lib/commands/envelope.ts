/**
 * Command contract v1: the signed envelope (PHASE2-SPEC.md 2.2, 3.3).
 *
 * The desktop verifies the signature over the EXACT bytes of the envelope text
 * and parses the command from it, never from the `pending_commands` columns
 * (jsonb reorders keys). The key order below is therefore part of the
 * contract, pinned by `fixtures/command-envelope-v1.json`, which both repos
 * test against. Pure and isomorphic: no key, no clock, no DOM.
 */

/** The v1 verbs a paired controller may send. The queue verbs stay desktop-approved and are not sent from here. */
export type CommandVerb = "pause_persona" | "resume_persona" | "cancel_execution" | "run_persona" | "chat_send";

/** Commands never queue (PLAN M12): an envelope is valid for 60 s from `iat`. */
export const COMMAND_TTL_MS = 60_000;

/** The web marks a row still `pending` this long after `exp` as expired (spec 2.3). */
export const EXPIRY_GRACE_MS = 15_000;

export interface EnvelopeFields {
  /** The command id, minted by the web; also the row's primary key and the idempotency key. */
  id: string;
  /** `target_device_id`: the desktop that owns the persona. */
  dev: string;
  type: CommandVerb;
  persona: string;
  /** Verb payload, camelCase; the same object goes in the row's `params`. */
  params: Record<string, unknown>;
  /** ISO 8601 with milliseconds (Date#toISOString). */
  iat: string;
  exp: string;
  /** The controller id this browser was paired under. */
  ctl: string;
}

/** The exact text that is signed and stored in `pending_commands.envelope`. */
export function buildEnvelope(f: EnvelopeFields): string {
  // Built field by field so the order is the contract's, not the caller's.
  return JSON.stringify({
    v: 1,
    id: f.id,
    dev: f.dev,
    type: f.type,
    persona: f.persona,
    params: f.params,
    iat: f.iat,
    exp: f.exp,
    ctl: f.ctl,
  });
}

/** `iat` / `exp` for a command issued at `nowMs`. */
export function envelopeTimes(nowMs: number): { iat: string; exp: string } {
  return { iat: new Date(nowMs).toISOString(), exp: new Date(nowMs + COMMAND_TTL_MS).toISOString() };
}

/** RFC 4648 base64url without padding (the encoding of keys, proofs and signatures). */
export function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inverse of toBase64Url; throws on characters outside the alphabet. */
export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error("not base64url");
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
