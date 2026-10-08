/**
 * `redactText`: a faithful port of the desk's `redact_text`
 * (personas `src-tauri/src/cloud/sync/redact.rs`, with `key_is_secret` and
 * `value_looks_secret` from `cloud/sync/rows.rs`). It masks credential-looking
 * tokens in free text and keeps every other byte, whitespace included, so a
 * say is masked on the phone BEFORE it is signed and a pasted key never
 * reaches the cloud row. The desk masks again on arrival; the two must agree.
 *
 * Parity is pinned by `fixtures/redact-text-v1.json`, copied byte for byte from
 * personas (`ddae928324`; F3a `355b5d643a`, F3b `ddca92792b`, F3c `b0c13da5bf`).
 * Never edit the fixture or this port to make one case pass: change the Rust
 * first, then re-copy.
 *
 * Rust-to-JS notes: Rust `len()` is UTF-8 bytes (`byteLen`); whitespace is
 * Rust's `char::is_whitespace` (not JS `\s`, which differs at U+0085 and
 * U+FEFF); `is_ascii_*` are explicit ASCII ranges; every delimiter the
 * scanners look for is ASCII or BMP whitespace, so UTF-16 indexes are safe.
 */

const REDACTED = "[redacted]";
const MIN_PREFIX_TOKEN = 16;

const SECRET_KEY_NEEDLES = [
  "token",
  "secret",
  "password",
  "passwd",
  "api_key",
  "apikey",
  "authorization",
  "credential",
  "cookie",
  "private_key",
  "access_key",
  "client_secret",
  "bearer",
];

const PREFIXES = [
  "sk-",
  "sk_",
  "ghp_",
  "gho_",
  "ghs_",
  "github_pat_",
  "glpat-",
  "xox",
  "AKIA",
  "ASIA",
  "eyJ",
  "Bearer ",
  "-----BEGIN",
  "AIza",
  "npm_",
  "hf_",
  "rk_live_",
  "rk_test_",
  "whsec_",
  "shpat_",
  "glsa_",
  "xapp-",
];

const PEM_BEGIN = "-----BEGIN ";
const PEM_DASHES = "-----";
const WRAPPERS = ["\"", "'", "`", "(", ")", "[", "]", "{", "}", "<", ">", ",", ";", ".", "!", "?"];
const encoder = new TextEncoder();

function byteLen(s: string): number {
  return encoder.encode(s).length;
}

/** Rust `char::is_whitespace` (Unicode White_Space). */
function isWs(c: string): boolean {
  const n = c.charCodeAt(0);
  return (
    (n >= 9 && n <= 13) ||
    n === 32 ||
    n === 0x85 ||
    n === 0xa0 ||
    n === 0x1680 ||
    (n >= 0x2000 && n <= 0x200a) ||
    n === 0x2028 ||
    n === 0x2029 ||
    n === 0x202f ||
    n === 0x205f ||
    n === 0x3000
  );
}

const isUpper = (c: string) => c >= "A" && c <= "Z";
const isLower = (c: string) => c >= "a" && c <= "z";
const isDigit = (c: string) => c >= "0" && c <= "9";
const isAlnum = (c: string) => isUpper(c) || isLower(c) || isDigit(c);
const isWrapper = (c: string) => WRAPPERS.includes(c);
const isSep = (c: string) => c === "=" || c === ":";

function trimStartBy(s: string, pred: (c: string) => boolean): string {
  let i = 0;
  while (i < s.length && pred(s[i])) i++;
  return s.slice(i);
}

function trimEndBy(s: string, pred: (c: string) => boolean): string {
  let j = s.length;
  while (j > 0 && pred(s[j - 1])) j--;
  return s.slice(0, j);
}

function trimWs(s: string): string {
  return trimEndBy(trimStartBy(s, isWs), isWs);
}

function asciiLower(s: string): string {
  return s.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

/** (leading wrappers, core, trailing wrappers). */
function unwrapToken(tok: string): [string, string, string] {
  const start = tok.length - trimStartBy(tok, isWrapper).length;
  const rest = tok.slice(start);
  const coreLen = trimEndBy(rest, isWrapper).length;
  return [tok.slice(0, start), rest.slice(0, coreLen), rest.slice(coreLen)];
}

function keyIsSecret(key: string): boolean {
  const k = asciiLower(key);
  return SECRET_KEY_NEEDLES.some((n) => k.includes(n));
}

function allChars(s: string, pred: (c: string) => boolean): boolean {
  for (const c of s) if (!pred(c)) return false;
  return true;
}

function anyChar(s: string, pred: (c: string) => boolean): boolean {
  for (const c of s) if (pred(c)) return true;
  return false;
}

function valueLooksSecret(s: string): boolean {
  if (PREFIXES.some((p) => s.startsWith(p))) return true;
  const bytes = byteLen(s);
  if (bytes >= 60 && !anyChar(s, isWs)) {
    let dense = 0;
    for (const c of s) if (isAlnum(c) || c === "+" || c === "/" || c === "-" || c === "_" || c === "=") dense++;
    if (Math.floor((dense * 100) / bytes) >= 90) return true;
  }
  return false;
}

function looksMixedToken(core: string): boolean {
  const n = byteLen(core);
  return (
    n >= 32 &&
    n <= 59 &&
    allChars(core, isAlnum) &&
    anyChar(core, isUpper) &&
    anyChar(core, isLower) &&
    anyChar(core, isDigit)
  );
}

function looksLikeHash(core: string): boolean {
  const n = byteLen(core);
  return (n === 40 || n === 64) && allChars(core, (c) => isDigit(c) || (c >= "a" && c <= "f"));
}

function looksBareCloudKey(core: string): boolean {
  if (
    byteLen(core) !== 40 ||
    !allChars(core, (c) => isAlnum(c) || c === "+" || c === "/") ||
    !anyChar(core, (c) => c === "+" || c === "/") ||
    !anyChar(core, isUpper) ||
    !anyChar(core, isLower) ||
    !anyChar(core, isDigit)
  ) {
    return false;
  }
  let lower = 0;
  let runs = 0;
  let inRun = false;
  for (const c of core) {
    const l = isLower(c);
    if (l) {
      lower++;
      if (!inRun) runs++;
    }
    inRun = l;
  }
  // Mean lowercase run under 2.5, in integers.
  return 2 * lower < 5 * runs;
}

function looksSecret(core: string): boolean {
  if (looksLikeHash(core)) return false;
  return (
    (byteLen(core) >= MIN_PREFIX_TOKEN && valueLooksSecret(core)) ||
    looksMixedToken(core) ||
    looksBareCloudKey(core)
  );
}

/** `nameWithSep` (a key with its trailing `=` or `:`) names a secret. */
function namesASecret(nameWithSep: string): boolean {
  const bare = trimEndBy(nameWithSep, isSep);
  return keyIsSecret(trimEndBy(trimStartBy(bare, isWrapper), isWrapper));
}

/** Rust `split_inclusive(seps)`: each piece keeps its trailing separator. */
function splitInclusive(s: string, seps: string): string[] {
  const out: string[] = [];
  let from = 0;
  for (let i = 0; i < s.length; i++) {
    if (seps.includes(s[i])) {
      out.push(s.slice(from, i + 1));
      from = i + 1;
    }
  }
  if (from < s.length) out.push(s.slice(from));
  return out;
}

function splitSep(piece: string, seps: string): [string, string] {
  if (piece.length > 0 && seps.includes(piece[piece.length - 1])) {
    return [piece.slice(0, -1), piece.slice(-1)];
  }
  return [piece, ""];
}

function maskCore(core: string): string | null {
  for (let i = 0; i < core.length; i++) {
    if (!isSep(core[i])) continue;
    const name = core.slice(0, i + 1);
    const [vlead, vcore, vtrail] = unwrapToken(core.slice(i + 1));
    if (vcore.length > 0 && namesASecret(name)) return `${name}${vlead}${REDACTED}${vtrail}`;
  }
  for (let i = core.length - 1; i >= 0; i--) {
    if (!isSep(core[i])) continue;
    const name = core.slice(0, i + 1);
    const [vlead, vcore, vtrail] = unwrapToken(core.slice(i + 1));
    if (vcore.length > 0 && looksSecret(vcore)) return `${name}${vlead}${REDACTED}${vtrail}`;
    break;
  }
  return looksSecret(core) ? REDACTED : null;
}

/** Pairs joined in one token (`a=1;password=x`, `a=1&b=2`) are judged pair by pair. */
function maskPairs(core: string): string | null {
  const seps = ";&";
  const bodies = splitInclusive(core, seps)
    .map((p) => splitSep(p, seps)[0])
    .filter((b) => b.length > 0);
  if (bodies.length < 2 || !bodies.some((b) => b.includes("=") || b.includes(":"))) {
    return maskCore(core);
  }
  let out = "";
  let changed = false;
  for (const piece of splitInclusive(core, seps)) {
    const [body, sep] = splitSep(piece, seps);
    const m = maskCore(body);
    if (m !== null) {
      out += m;
      changed = true;
    } else {
      out += body;
    }
    out += sep;
  }
  return changed ? out : null;
}

/** The password in `scheme://user:pass@host`, judged by position. */
function maskUserinfo(url: string): string | null {
  const scheme = url.indexOf("://");
  if (scheme < 0) return null;
  const afterScheme = scheme + 3;
  let authorityLen = url.length - afterScheme;
  for (let i = afterScheme; i < url.length; i++) {
    if (url[i] === "/" || url[i] === "?" || url[i] === "#") {
      authorityLen = i - afterScheme;
      break;
    }
  }
  const authority = url.slice(afterScheme, afterScheme + authorityLen);
  const at = authority.lastIndexOf("@");
  if (at < 0) return null;
  const userinfo = authority.slice(0, at);
  const colon = userinfo.indexOf(":");
  if (colon < 0) return null;
  const user = userinfo.slice(0, colon);
  const password = userinfo.slice(colon + 1);
  if (password.length === 0 || password === REDACTED) return null;
  return `${url.slice(0, afterScheme)}${user}:${REDACTED}${url.slice(afterScheme + at)}`;
}

/** A link is judged segment by segment (path parts, query pairs, fragment). */
function maskUrl(input: string): string | null {
  const userinfo = maskUserinfo(input);
  const url = userinfo ?? input;
  const seps = "/?&#";
  let changed = userinfo !== null;
  let out = "";
  for (const piece of splitInclusive(url, seps)) {
    const [body, sep] = splitSep(piece, seps);
    const m = maskCore(body);
    if (m !== null) {
      out += m;
      changed = true;
    } else {
      out += body;
    }
    out += sep;
  }
  return changed ? out : null;
}

function maskToken(tok: string, forced: boolean): string | null {
  const [lead, core, trail] = unwrapToken(tok);
  if (core.length === 0) return null;
  if (forced) return `${lead}${REDACTED}${trail}`;
  const masked = core.includes("://") ? maskUrl(core) : maskPairs(core);
  return masked === null ? null : `${lead}${masked}${trail}`;
}

/** The token rule: mask every whitespace-delimited credential, keep all whitespace. */
function maskTokens(s: string): string {
  let out = "";
  let afterBearer = false;
  let afterSecretKey = false;
  let i = 0;
  while (i < s.length) {
    const wsStart = i;
    while (i < s.length && isWs(s[i])) i++;
    out += s.slice(wsStart, i);
    if (i >= s.length) break;
    let end = i;
    while (end < s.length && !isWs(s[end])) end++;
    const tok = s.slice(i, end);
    const core = unwrapToken(tok)[1];
    const isBearer = asciiLower(core) === "bearer";
    const forced = afterBearer || (afterSecretKey && !isBearer);
    const masked = maskToken(tok, forced);
    afterSecretKey = masked === null && core.length > 0 && isSep(core[core.length - 1]) && namesASecret(core);
    out += masked ?? tok;
    afterBearer = isBearer;
    i = end;
  }
  return out;
}

/** The next `-----BEGIN <LABEL>-----` at or after `from`: (start, end, label). */
function nextPemBegin(s: string, from: number): [number, number, string] | null {
  let at = from;
  for (;;) {
    const i = s.indexOf(PEM_BEGIN, at);
    if (i < 0) return null;
    const labelStart = i + PEM_BEGIN.length;
    let labelEnd = labelStart;
    while (labelEnd < s.length && (isUpper(s[labelEnd]) || isDigit(s[labelEnd]) || s[labelEnd] === " ")) {
      labelEnd++;
    }
    const label = s.slice(labelStart, labelEnd);
    if (label.trim().length > 0 && s.startsWith(PEM_DASHES, labelEnd)) {
      return [i, labelEnd + PEM_DASHES.length, label];
    }
    at = labelStart;
  }
}

/** Base64 only (whitespace allowed, `=` only as up to 2 trailing pad characters). */
function isBase64Body(body: string): boolean {
  let pad = 0;
  for (const c of body) {
    if (isWs(c)) continue;
    if (c === "=") {
      pad++;
      if (pad > 2) return false;
    } else if (pad !== 0 || !(isAlnum(c) || c === "+" || c === "/")) {
      return false;
    }
  }
  return true;
}

/** A private key body becomes `[redacted]`, keeping the whitespace that joins it to its markers. */
function maskBody(body: string): string {
  const core = trimWs(body);
  if (core.length === 0) return body;
  const lead = body.length - trimStartBy(body, isWs).length;
  return body.slice(0, lead) + REDACTED + body.slice(lead + core.length);
}

/** Mask credential-looking tokens in `text`, keeping all other text byte for byte. */
export function redactText(text: string): string {
  let out = "";
  let done = 0; // code units of `text` already written to `out`
  let from = 0; // where the next marker search starts
  for (;;) {
    const found = nextPemBegin(text, from);
    if (!found) break;
    const [start, bodyStart, label] = found;
    const endMarker = `-----END ${label}-----`;
    const idx = text.indexOf(endMarker, bodyStart);
    const bodyEnd = idx < 0 ? null : idx;
    if (label.includes("PRIVATE KEY")) {
      out += maskTokens(text.slice(done, start));
      out += text.slice(start, bodyStart);
      if (bodyEnd !== null) {
        out += maskBody(text.slice(bodyStart, bodyEnd));
        out += endMarker;
        done = bodyEnd + endMarker.length;
      } else {
        out += maskBody(text.slice(bodyStart));
        done = text.length;
      }
      from = done;
    } else if (bodyEnd !== null && isBase64Body(text.slice(bodyStart, bodyEnd))) {
      out += maskTokens(text.slice(done, start));
      done = bodyEnd + endMarker.length;
      out += text.slice(start, done);
      from = done;
    } else {
      from = bodyStart;
    }
  }
  return out + maskTokens(text.slice(done));
}
