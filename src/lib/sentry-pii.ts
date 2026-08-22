/**
 * PII scrubbing utilities for Sentry events and breadcrumbs.
 *
 * Mirrors the desktop Rust pii module — strips or redacts:
 * - UUIDs (execution_id, persona_id, etc.) → keyed correlation marker
 * - Bare email addresses → [redacted-email]
 * - Quoted names (persona names, credential names) → [redacted]
 * - Full URLs in prose → domain-only
 * - Code locations (stack frames) → structurally redacted, path and
 *   `:line:col` kept — see the note above `redactLocation` for the split
 * - Sensitive breadcrumb / context / extra / tag fields
 *
 * ## The correlation marker
 * A UUID is replaced by `[id:<12 hex>]` where the hex is
 * `SHA-256(session_key ‖ 0x1f ‖ uuid)` truncated to 6 bytes. It is NOT a
 * prefix of the identifier: a prefix is a partial disclosure of the value —
 * against a known identifier space (a workspace's persona list, a page of
 * execution ids) it collapses the candidate set, and it survives into a
 * third-party store this codebase cannot purge. The marker is stable for the
 * lifetime of the process/tab, so two events about the same execution still
 * join, and it is meaningless outside that window. `session_key` is 32 bytes
 * from the platform CSPRNG, held only in memory, never persisted, never sent.
 *
 * This is a correlation token, not an authenticator: it is one-way and
 * unforgeable-without-the-key, but it is deliberately truncated, so it is not
 * a MAC and must never be used as one.
 *
 * ## Bounds
 * `scrubData` walks caller-supplied structures, so it enforces four caps —
 * depth, breadth (object keys / array items), per-string length, and a total
 * node budget — plus a real cycle guard (a path-local `Set`). The depth cap
 * alone cannot stand in for a cycle guard: on a cyclic structure it emits an
 * arbitrary prefix of an infinite walk rather than naming the cycle.
 *
 * ## Failure direction
 * `safeScrubEvent` / `safeScrubBreadcrumb` are the hooks wired into
 * `Sentry.init` (see `src/lib/sentry.ts`). A throwing scrubber must never
 * reach the SDK: transports commonly treat a thrown `beforeSend` as "send the
 * original", which is the one direction a privacy boundary may not take. On
 * throw the event is replaced by a payload-free skeleton and the breadcrumb is
 * dropped.
 */
import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent, Breadcrumb } from "@sentry/nextjs";

type CaptureExceptionHint = Parameters<typeof Sentry.captureException>[1];

// ── Regex patterns (match the Rust pii module) ──────────────────────────────

const UUID_RE =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

const QUOTED_RE = /'[^']{1,200}'|"[^"]{1,200}"/g;

const URL_RE = /https?:\/\/[^\s,)}\]]+/g;

// Bare email addresses — the scrubber's denylist drops known PII *keys*, but a
// free-text value (an off-list `extra`/`tag`/message field, a stack-frame var)
// can still carry an email that no UUID/URL/quoted pattern catches. Redacting
// it everywhere is the safe direction for a PII scrubber.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// A cut string can end mid-token; a half email/UUID is still a partial
// disclosure, so the trailing (possibly partial) token is dropped after a
// truncation rather than left dangling.
const TRAILING_TOKEN_RE = /[A-Za-z0-9._%+@-]+$/;

const SENSITIVE_FIELDS = new Set([
  "execution_id",
  "persona_id",
  "persona_name",
  "trigger_id",
  "credential_id",
  "policy_id",
  "event_id",
  "source_persona_id",
  "tool_name",
  "api_url",
  "endpoint",
  "connector_name",
  "user_name",
  // Common PII keys whose values may not match a UUID/URL/quoted pattern.
  "email",
  "user_email",
  "workspace_id",
  "workspace_name",
  "full_name",
]);

// ── Keyed correlation marker ────────────────────────────────────────────────

// SHA-256 over 32-bit lanes. `crypto.subtle` is async and `node:crypto` is not
// resolvable from the client bundle, but `beforeSend` is synchronous and this
// module is imported by client components — so the digest is computed here.
// Only ever runs on error paths, over inputs of a few dozen bytes.
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** Synchronous SHA-256. Exported only so the spec can pin it to the FIPS vectors. */
export function sha256(bytes: Uint8Array): Uint8Array {
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const len = bytes.length;
  const padded = new Uint8Array((((len + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  // Bit length as a 64-bit big-endian pair (len * 8 split across two words).
  view.setUint32(padded.length - 8, Math.floor(len / 0x20000000));
  view.setUint32(padded.length - 4, (len << 3) >>> 0);

  const w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15];
      const y = w[i - 2];
      const s0 = (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
      const s1 = (rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];
    for (let i = 0; i < 64; i++) {
      const s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (hh + s1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (s0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setUint32(i * 4, h[i]);
  return out;
}

/**
 * Session key for the correlation marker. 32 bytes of CSPRNG entropy, created
 * once per process (server/edge) or tab (client), never written anywhere.
 * Losing it on restart is intended: correlation is scoped to the window in
 * which it is useful, and markers from an older window cannot be re-derived.
 */
const SESSION_MARKER_KEY: Uint8Array = (() => {
  const key = new Uint8Array(32);
  const webcrypto = globalThis.crypto;
  if (webcrypto && typeof webcrypto.getRandomValues === "function") {
    webcrypto.getRandomValues(key);
  } else {
    // No CSPRNG in this runtime. Math.random is a weak key, but the marker is
    // still a hash rather than a slice of the identifier, so this fallback is
    // strictly better than the substring it replaces.
    for (let i = 0; i < key.length; i++) key[i] = (Math.random() * 256) | 0;
  }
  return key;
})();

const MARKER_BYTES = 6;
const encoder = new TextEncoder();

/**
 * Keyed, session-stable, non-invertible stand-in for an identifier.
 * Same input → same marker within a session; different sessions → unrelated
 * markers; no substring of the input survives.
 */
export function correlationMarker(value: string): string {
  const valueBytes = encoder.encode(value);
  // key ‖ 0x1f ‖ value — the separator keeps the key/value boundary
  // unambiguous so two different (key, value) splits cannot collide.
  const input = new Uint8Array(SESSION_MARKER_KEY.length + 1 + valueBytes.length);
  input.set(SESSION_MARKER_KEY, 0);
  input[SESSION_MARKER_KEY.length] = 0x1f;
  input.set(valueBytes, SESSION_MARKER_KEY.length + 1);

  const digest = sha256(input);
  let hex = "";
  for (let i = 0; i < MARKER_BYTES; i++) {
    hex += digest[i].toString(16).padStart(2, "0");
  }
  return `[id:${hex}]`;
}

// ── String scrubbing ────────────────────────────────────────────────────────

/** Reduce a URL to scheme + host only (strips path, query, fragment, userinfo). */
function redactUrl(url: string): string {
  const schemeEnd = url.indexOf("://");
  if (schemeEnd === -1) return "[redacted-url]";
  const afterScheme = url.slice(schemeEnd + 3);
  const hostEnd = afterScheme.indexOf("/");
  const hostPart = hostEnd === -1 ? afterScheme : afterScheme.slice(0, hostEnd);
  // Strip userinfo (user:pass@host)
  const atPos = hostPart.indexOf("@");
  const cleanHost = atPos === -1 ? hostPart : hostPart.slice(atPos + 1);
  return `${url.slice(0, schemeEnd)}://${cleanHost}/…`;
}

/**
 * Longest string this scrubber will process. The cap runs BEFORE the regex
 * passes: `EMAIL_RE`'s `[A-Za-z0-9._%+-]+@` scans quadratically over a long
 * run of matching characters with no `@`, so an attacker-influenced megabyte
 * string would otherwise stall the hook on the request thread.
 */
const MAX_STRING_LEN = 2048;

/** Scrub PII from a log message string. */
export function scrubPii(input: string): string {
  let result = input;
  if (result.length > MAX_STRING_LEN) {
    result =
      result.slice(0, MAX_STRING_LEN).replace(TRAILING_TOKEN_RE, "") +
      "…[truncated]";
  }
  // 1. Reduce URLs to scheme + host only. This runs FIRST on purpose: URL_RE
  //    stops at `]`, so if a UUID inside the URL had already been replaced by
  //    `[id:…]` the match would end at that bracket and the rest of the URL —
  //    including its query string, i.e. any token in it — would survive.
  result = result.replace(URL_RE, (match) => redactUrl(match));
  // 2. Redact bare email addresses (before the quoted pass so they're caught
  //    even when not quoted)
  result = result.replace(EMAIL_RE, "[redacted-email]");
  // 3. Replace UUIDs with a keyed correlation marker (never a slice of the id)
  result = result.replace(UUID_RE, (match) => correlationMarker(match));
  // 4. Redact quoted strings (credential names, persona names, etc.)
  result = result.replace(QUOTED_RE, "[redacted]");
  return result;
}

// ── Structural scrubbing: locations, not prose ──────────────────────────────

/**
 * There are two redaction paths in this module and the split is deliberate.
 *
 * - A URL in PROSE — a message, an `extra`, a `tag`, a context or breadcrumb
 *   value — is redacted AGGRESSIVELY by `scrubPii`/`redactUrl`, down to
 *   `scheme://host/…`. Prose is unstructured: nothing downstream can rely on
 *   the path a human happened to interpolate into a log line, and the path and
 *   query are exactly where tokens and identifiers ride.
 *
 * - A URL or native path that IS A CODE LOCATION — `frame.filename`,
 *   `frame.abs_path`, `frame.module`, and the `at …` lines of `error.stack` —
 *   is redacted STRUCTURALLY by `redactLocation`. Here the path is the entire
 *   signal: it is this bundle's own coordinates, and it is what lets the error
 *   tracker group by file and line instead of collapsing every frame to
 *   `origin/…` and grouping by function name. So the shape is preserved and
 *   only the parts that carry personal data are removed.
 *
 * `redactLocation` is therefore NOT a weaker `scrubPii`; it is a different
 * decision about a different kind of string. Neither may be swapped for the
 * other: prose on the structural path leaks (a token in a sentence survives),
 * and a location on the aggressive path destroys the frame.
 */

/**
 * A frame's trailing `:line:col` (or `:line`). Split off before anything else
 * so no rule below can mistake a position for a port or a path segment, and
 * re-appended verbatim: a line number is a coordinate, never personal data.
 */
const POSITION_SUFFIX_RE = /:\d{1,9}(?::\d{1,9})?$/;

/** Scheme + authority of a location: `https://user:pass@host`, `webpack://`. */
const LOCATION_AUTHORITY_RE = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/\\?#]*)/;

/**
 * A home-directory root followed by the segment that names its owner:
 * `/Users/<name>`, `/home/<name>`, `C:\Users\<name>`, `/C:/Users/<name>`
 * (what a `file://` URL looks like on Windows). Anchored at the START of the
 * path so it matches a filesystem root and not a website route that happens to
 * be called `/home/...`.
 */
const HOME_DIR_RE =
  /^([\\/]?(?:[A-Za-z]:)?[\\/])(Users|home|Documents and Settings)([\\/])([^\\/]+)/i;

const REDACTED_USER = "[redacted-user]";

/**
 * Redact a code location while keeping it usable as one.
 *
 * Preserved: scheme, host, path, and any trailing `:line:col`. Those are the
 * bundle's own coordinates and they are the entire point of a stack frame.
 *
 * Removed or rewritten:
 * - the query string and the fragment, entirely — a frame URL's `?token=…`,
 *   `?id=<uuid>` or `#access_token=…` carries secrets and contributes nothing
 *   to grouping
 * - userinfo (`https://user:pass@host/…`)
 * - the username in a home directory (`/Users/<name>/`, `/home/<name>/`,
 *   `C:\Users\<name>\`). This is the real personal data in a stack: it rides in
 *   `file://` frames and in source-mapped `abs_path`, and nothing else in this
 *   pipeline catches it. The name segment is replaced; the rest of the path
 *   stays, so two machines' frames now agree instead of splintering.
 * - anything the identifier/address passes still find in what remains, so a
 *   UUID or an email inside a path segment becomes a marker.
 */
export function redactLocation(value: string): string {
  if (!value) return value;

  const position = POSITION_SUFFIX_RE.exec(value)?.[0] ?? "";
  let body = position ? value.slice(0, value.length - position.length) : value;

  // Same bound as `scrubPii`, and for the same reason: `EMAIL_RE` scans
  // quadratically over a long run of matching characters with no `@`, and a
  // frame location is as caller-influenced as any other string here.
  if (body.length > MAX_STRING_LEN) {
    body =
      body.slice(0, MAX_STRING_LEN).replace(TRAILING_TOKEN_RE, "") +
      "…[truncated]";
  }

  const fragment = body.indexOf("#");
  if (fragment !== -1) body = body.slice(0, fragment);
  const query = body.indexOf("?");
  if (query !== -1) body = body.slice(0, query);

  let prefix = "";
  let path = body;
  let scheme = "";
  const authority = LOCATION_AUTHORITY_RE.exec(body);
  if (authority) {
    scheme = authority[1].toLowerCase();
    const host = authority[2];
    // Last `@`, not first: an encoded `%40` inside userinfo would make the
    // first one the wrong boundary.
    const at = host.lastIndexOf("@");
    prefix = `${authority[1]}://${at === -1 ? host : host.slice(at + 1)}`;
    path = body.slice(authority[0].length);
  }

  // Home-directory redaction is skipped for http(s), where `/home/<x>` is a
  // route on a public site, not somebody's home directory. Every other scheme
  // (`file:`, `webpack:`, `app:`) and every bare native path is a filesystem
  // coordinate, where that segment is a username.
  if (scheme !== "http" && scheme !== "https") {
    path = path.replace(
      HOME_DIR_RE,
      (_match, root: string, home: string, separator: string) =>
        `${root}${home}${separator}${REDACTED_USER}`,
    );
  }

  let out = `${prefix}${path}`.replace(EMAIL_RE, "[redacted-email]");
  out = out.replace(UUID_RE, (match) => correlationMarker(match));
  return `${out}${position}`;
}

/**
 * A frame line: V8's `    at fn (loc)` / `    at loc`, or the `fn@loc` shape
 * Firefox and Safari emit. The Firefox shape allows no whitespace before the
 * `@`, which is what keeps a prose line containing an email address from being
 * mistaken for a frame.
 */
const V8_FRAME_RE = /^\s*at\s/;
const AT_FRAME_RE = /^[^\s@]*@\S/;

/**
 * A location token inside a frame line: any `scheme://` URL, a Windows path,
 * or an absolute/relative POSIX path. It runs to the next whitespace or `)` so
 * the surrounding `at fn (` … `)` scaffolding — the grouping input — is left
 * exactly as the runtime wrote it.
 */
const STACK_LOCATION_RE =
  /(?:[A-Za-z][A-Za-z0-9+.-]*:\/\/|[A-Za-z]:[\\/]|\.{0,2}\/)[^\s)]*/g;

/**
 * Bounds on a stack string. The old `scrubPii(error.stack)` got these for free
 * from `MAX_STRING_LEN` (it capped the whole stack at one string); redacting
 * per line has to restate them, because `error.stack` is writable and a frame
 * line is therefore as caller-shaped as any other input here. A line longer
 * than the string cap is not a frame this code can trust, so it falls back to
 * the aggressive path — which truncates — rather than running the regex passes
 * over it. Sentry's own parser keeps 50 frames by default; 200 lines is well
 * clear of any real stack.
 */
const MAX_STACK_LINES = 200;

/**
 * Redact an `error.stack` STRING, line by line, splitting it the way the two
 * paths above split: the header (`Name: message`, and any continuation of a
 * multi-line message) is prose and takes the aggressive path; the frames are
 * locations and take the structural one.
 *
 * Lines are classified independently rather than latching at the first frame,
 * so a trailing `Caused by: …` line goes back to the aggressive path. Anything
 * this code cannot recognise as a frame is treated as prose, which is the safe
 * direction. Line 0 may only be claimed by the `fn@loc` shape: a V8 stack's
 * first line is always the header, and a message that happens to begin with
 * "at " must not be mistaken for a frame.
 */
export function redactStack(stack: string): string {
  const lines = stack.split("\n");
  const out = lines.slice(0, MAX_STACK_LINES).map((line, index) => {
    const isFrame =
      line.length <= MAX_STRING_LEN &&
      (AT_FRAME_RE.test(line) || (index > 0 && V8_FRAME_RE.test(line)));
    if (!isFrame) return scrubPii(line);
    return (
      line
        .replace(STACK_LOCATION_RE, (match) => redactLocation(match))
        // Belt and braces for the one thing that is never a coordinate: an
        // address outside a location token (a misclassified line, an odd
        // runtime's frame format) still goes.
        .replace(EMAIL_RE, "[redacted-email]")
    );
  });
  if (lines.length > MAX_STACK_LINES) {
    out.push(`    … [redacted-depth: ${lines.length - MAX_STACK_LINES} more lines]`);
  }
  return out.join("\n");
}

// ── Structured payload scrubbing ────────────────────────────────────────────

/**
 * Recursively scrub a free-form object payload (`contexts`, `extra`, `tags`,
 * stack-frame `vars`, etc.). Strings get the regex pass; objects/arrays get
 * walked; sensitive-field keys get deleted outright.
 *
 * Every bound below exists because the input is caller-shaped and this runs on
 * the request thread inside `beforeSend`:
 * - depth   — bounds nesting
 * - breadth — bounds keys per object / items per array
 * - nodes   — bounds the whole walk (a wide *and* deep tree beats the two above)
 * - cycles  — a path-local `Set`, because a depth cap on a cyclic structure
 *             emits an arbitrary prefix of an infinite walk instead of a cycle
 */
const MAX_SCRUB_DEPTH = 6;
const MAX_SCRUB_KEYS = 64;
const MAX_SCRUB_ITEMS = 100;
const MAX_SCRUB_NODES = 5000;

interface ScrubState {
  nodes: number;
  path: Set<object>;
}

function scrubValue(value: unknown, depth: number, state: ScrubState): unknown {
  if (state.nodes++ > MAX_SCRUB_NODES) return "[redacted-budget]";
  // At the depth cap, DROP rather than passthrough: returning the raw subtree
  // would ship un-scrubbed emails/UUIDs/denylisted keys nested deeper than the
  // cap straight to Sentry. For a PII boundary the safe direction is to redact.
  if (depth > MAX_SCRUB_DEPTH) return "[redacted-depth]";
  if (typeof value === "string") return scrubPii(value);
  if (value === null || typeof value !== "object") {
    // Numbers/booleans/undefined pass through; functions and symbols are not
    // serializable payload and are dropped rather than described.
    return typeof value === "function" || typeof value === "symbol"
      ? "[redacted-nonserializable]"
      : value;
  }

  const container = value as object;
  if (state.path.has(container)) return "[redacted-cycle]";
  state.path.add(container);
  try {
    if (Array.isArray(container)) {
      const items = container.slice(0, MAX_SCRUB_ITEMS).map((item) =>
        scrubValue(item, depth + 1, state),
      );
      if (container.length > MAX_SCRUB_ITEMS) {
        items.push(`[redacted-breadth: ${container.length - MAX_SCRUB_ITEMS} more]`);
      }
      return items;
    }
    const out: Record<string, unknown> = {};
    let kept = 0;
    let dropped = 0;
    for (const [key, v] of Object.entries(container as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) continue;
      if (kept >= MAX_SCRUB_KEYS) {
        dropped++;
        continue;
      }
      kept++;
      out[key] = scrubValue(v, depth + 1, state);
    }
    if (dropped > 0) out["[redacted-breadth]"] = `${dropped} more keys`;
    return out;
  } finally {
    // Path-local, not global: the same object appearing twice as siblings is a
    // DAG, not a cycle, and must still be scrubbed the second time.
    state.path.delete(container);
  }
}

function scrubData(value: unknown): unknown {
  return scrubValue(value, 0, { nodes: 0, path: new Set() });
}

/** Scrub PII from a Sentry event (used as beforeSend hook, via safeScrubEvent). */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // Strip user fields. user.id is often a Supabase UUID, but it can also be an
  // opaque provider id that matches no pattern — so the WHOLE id is replaced by
  // a keyed marker rather than run through the regex pass.
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
    if (typeof event.user.id === "string") {
      event.user.id = correlationMarker(event.user.id);
    } else if (typeof event.user.id === "number") {
      event.user.id = correlationMarker(String(event.user.id));
    }
  }
  // Strip request body and headers
  if (event.request) {
    delete event.request.headers;
    delete event.request.data;
  }
  // Scrub PII from the event message
  if (event.message) {
    event.message = scrubPii(event.message);
  }
  // Scrub PII from exception values + their stack frames.
  //
  // A frame is scrubbed along the two paths described above `redactLocation`:
  // its LOCATIONS (`filename`, `abs_path`, `module`) go structurally, keeping
  // path and position while losing query string, userinfo and home-directory
  // username; its `vars` are free-text local values and stay on the aggressive
  // path. `function`, `lineno`, `colno` and `in_app` are untouched — they are
  // the grouping inputs and carry nothing personal.
  //
  // This runs after the SDK's own event processors (`beforeSend` is last), so
  // it also covers whatever `RewriteFrames`-style integrations produced.
  if (event.exception?.values) {
    for (const exc of event.exception.values) {
      if (exc.value) {
        exc.value = scrubPii(exc.value);
      }
      const frames = exc.stacktrace?.frames;
      if (frames) {
        for (const frame of frames) {
          if (frame.filename) frame.filename = redactLocation(frame.filename);
          if (frame.abs_path) frame.abs_path = redactLocation(frame.abs_path);
          if (frame.module) frame.module = redactLocation(frame.module);
          if (frame.vars) {
            frame.vars = scrubData(frame.vars) as Record<string, unknown>;
          }
        }
      }
    }
  }
  // Scrub PII from `contexts` — the most common leak path because
  // captureException(err, { contexts: { persona: { id } } }) passes
  // raw UUIDs that the message-only scrubber never sees.
  if (event.contexts) {
    const next: Record<string, Record<string, unknown>> = {};
    for (const [name, ctx] of Object.entries(event.contexts)) {
      if (ctx && typeof ctx === "object") {
        next[name] = scrubData(ctx) as Record<string, unknown>;
      }
    }
    event.contexts = next;
  }
  // Scrub PII from `extra`
  if (event.extra) {
    event.extra = scrubData(event.extra) as Record<string, unknown>;
  }
  // Scrub PII from `tags` — tag values are strings; sensitive-field keys
  // are dropped wholesale.
  if (event.tags) {
    const tags = event.tags as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(tags)) {
      if (SENSITIVE_FIELDS.has(key)) continue;
      next[key] = typeof v === "string" ? scrubPii(v) : v;
    }
    event.tags = next as ErrorEvent["tags"];
  }
  // Scrub PII from breadcrumbs attached to the event
  if (event.breadcrumbs) {
    for (const bc of event.breadcrumbs) {
      if (bc.message) {
        bc.message = scrubPii(bc.message);
      }
      if (bc.data) {
        for (const key of Object.keys(bc.data)) {
          if (SENSITIVE_FIELDS.has(key)) {
            delete bc.data[key];
            continue;
          }
          const val = bc.data[key];
          if (typeof val === "string") {
            bc.data[key] = scrubPii(val);
          } else if (val && typeof val === "object") {
            bc.data[key] = scrubData(val);
          }
        }
      }
    }
  }
  return event;
}

/** Scrub PII from a standalone breadcrumb (used as beforeBreadcrumb hook). */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.message) {
    breadcrumb.message = scrubPii(breadcrumb.message);
  }
  if (breadcrumb.data) {
    for (const key of Object.keys(breadcrumb.data)) {
      if (SENSITIVE_FIELDS.has(key)) {
        delete breadcrumb.data[key];
      }
    }
  }
  return breadcrumb;
}

// ── Fail-closed hook wrappers ───────────────────────────────────────────────

/**
 * `beforeSend` as wired into `Sentry.init`. If `scrubEvent` throws — a hostile
 * getter, a frozen object, an SDK shape this code does not expect — the
 * partially-scrubbed event is discarded and a payload-free skeleton takes its
 * place. Returning the original (what the SDK does for a thrown callback in
 * several transports) would ship exactly the payload this hook exists to
 * remove; returning `null` would make a broken scrubber a silent telemetry
 * blackout. The skeleton keeps the "something is wrong" signal and carries no
 * caller data.
 */
export function safeScrubEvent(event: ErrorEvent): ErrorEvent {
  try {
    return scrubEvent(event);
  } catch {
    try {
      return {
        // `type: undefined` is what makes this an ErrorEvent rather than a
        // transaction event in the SDK's discriminated union.
        type: undefined,
        event_id: event?.event_id,
        timestamp: event?.timestamp,
        platform: event?.platform,
        level: "error",
        message: "[scrub-failed] event dropped by PII boundary",
        tags: { scrub_failed: "true" },
      } as ErrorEvent;
    } catch {
      return {
        type: undefined,
        level: "error",
        message: "[scrub-failed] event dropped by PII boundary",
      } as ErrorEvent;
    }
  }
}

/**
 * `beforeBreadcrumb` as wired into `Sentry.init`. A breadcrumb carries no
 * standalone diagnostic value, so a throwing scrub drops it outright.
 */
export function safeScrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  try {
    return scrubBreadcrumb(breadcrumb);
  } catch {
    return null;
  }
}

// ── The capture wrapper (the house rule) ────────────────────────────────────

/**
 * Scrubs the error message and stack at the call site before handing them to
 * the SDK. Use this instead of `Sentry.captureException` everywhere; a
 * `src/lib/no-raw-sentry-capture.test.ts` spec enforces it.
 *
 * The message takes the aggressive path (`scrubPii`); the stack takes the
 * structural one (`redactStack` → `redactLocation` per frame location). See the
 * note above `redactLocation` for why those are different decisions.
 *
 * The global `beforeSend` hook (`safeScrubEvent`) already scrubs the serialized
 * event — `message`, `exception.values[].value`, frame locations and `vars`,
 * `contexts`, `extra`, `tags` and breadcrumbs. What it cannot reach:
 * - The pre-send window. A raw `Error` sits in the SDK's in-memory event queue
 *   (and its offline/replay buffers) un-scrubbed until the hook fires;
 *   scrubbing at the call site means the identifier is destroyed before the
 *   vendor's code ever holds it.
 * - Defence in depth: `beforeSend` is a single global switch. An SDK upgrade,
 *   a second `Sentry.init`, or an integration that captures on its own path
 *   silently removes it. This wrapper is per-call and cannot be un-wired.
 *
 * Cost, stated plainly — what a converted call site still loses:
 * - The query string of every frame URL. Grouping and artifact matching are on
 *   the path, so releases are unaffected, but a dev-server URL whose only
 *   cache-buster lives in `?v=…` no longer resolves to a unique asset.
 * - A UUID embedded in a frame path becomes a session-keyed marker, so such a
 *   frame's string differs between sessions and can splinter its group. Paths
 *   with ids in them are rare; a token in one is not.
 * - The error identity: this constructs a plain `Error`, so an `Error`
 *   subclass, its `cause`, and any own properties do not survive. That is
 *   pre-existing and independent of which redaction path the stack takes.
 * What it no longer loses (this was the old trade, now reversed): the frame
 * path and its `:line:col`, so converted call sites group by file and line
 * again instead of by function name.
 */
export function captureExceptionScrubbed(
  error: unknown,
  hint?: CaptureExceptionHint,
): string {
  let scrubbed: unknown = error;
  if (error instanceof Error) {
    scrubbed = new Error(scrubPii(error.message));
    if (error.stack) (scrubbed as Error).stack = redactStack(error.stack);
    (scrubbed as Error).name = error.name;
  } else if (typeof error === "string") {
    scrubbed = scrubPii(error);
  }
  // The ONE legitimate raw capture in the codebase: this is the wrapper's own
  // delegation, and its argument has already been through `scrubPii`.
  return Sentry.captureException(scrubbed, hint);
}
