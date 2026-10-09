/**
 * The phone side of the pairing ceremony (PHASE2-SPEC.md 3.2). The desktop
 * shows a QR of `/dashboard/settings#pair=<pairing_id>.<secret>`; a fragment
 * never reaches a server. The phone proves it saw the QR by sending
 * `proof = base64url(HMAC-SHA256(secret, "<pairing_id>|<controller_id>|<public_key>"))`
 * with its new public key. Pure apart from WebCrypto; no key storage here.
 */
import { fromBase64Url, toBase64Url } from "./envelope";

export interface PairFragment {
  pairingId: string;
  /** base64url of the desktop's 32-byte secret, exactly as the QR carried it. */
  secret: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read `#pair=<uuid>.<base64url 32 bytes>` from a location hash; null for anything else. */
export function parsePairFragment(hash: string): PairFragment | null {
  const match = /^#?pair=([^.&]+)\.([A-Za-z0-9_-]+)$/.exec(hash.trim());
  if (!match) return null;
  const [, pairingId, secret] = match;
  if (!UUID.test(pairingId)) return null;
  try {
    if (fromBase64Url(secret).length !== 32) return null;
  } catch {
    return null;
  }
  return { pairingId: pairingId.toLowerCase(), secret };
}

/**
 * Take the pairing fragment off the URL at once, before anything (a
 * breadcrumb, a copied link, the next pushState) can carry the secret on.
 * Returns what it held, parsed, or null; a malformed fragment is still scrubbed.
 * The state is null on purpose: Next's replaceState patch hands data that
 * carries __NA straight to the browser without syncing the router, so passing
 * window.history.state would leave the secret in the router's URL.
 */
export function takePairFragment(
  loc: { hash: string; pathname: string; search: string },
  history: Pick<History, "replaceState">,
): PairFragment | null {
  if (!loc.hash.startsWith("#pair=")) return null;
  history.replaceState(null, "", loc.pathname + loc.search);
  return parsePairFragment(loc.hash);
}

/** The exact message the proof covers. */
export function proofMessage(pairingId: string, controllerId: string, publicKey: string): string {
  return `${pairingId}|${controllerId}|${publicKey}`;
}

/** HMAC-SHA256 keyed with the decoded secret; the imported key is dropped when this returns. */
export async function pairingProof(secret: string, pairingId: string, controllerId: string, publicKey: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", fromBase64Url(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(proofMessage(pairingId, controllerId, publicKey)));
  return toBase64Url(mac);
}

/** A readable default name for the controller row, from the user agent: "iPhone · Safari". */
export function controllerName(userAgent: string): string {
  const device = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Macintosh|Mac OS X/.test(userAgent)
          ? "Mac"
          : /Windows/.test(userAgent)
            ? "Windows"
            : /Linux/.test(userAgent)
              ? "Linux"
              : "Browser";
  const browser = /EdgA?\//.test(userAgent)
    ? "Edge"
    : /Firefox\/|FxiOS\//.test(userAgent)
      ? "Firefox"
      : /CriOS\/|Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : null;
  return browser ? `${device} · ${browser}` : device;
}
