/**
 * The both-ways path probe's verdicts: every desktop<->web path reported as
 * working, broken, blocked or retired (docs/features/infrastructure/desktop-web-paths.md).
 *
 * Pure: an observation goes in, a verdict comes out. All I/O lives in
 * `scripts/probe-paths.mjs`, which imports this file directly (Node strips the
 * types), so it has no `@/` imports, no imports at all, and only erasable
 * TypeScript syntax. A body is read here only for ids, statuses, error tokens
 * and stamps; a reason never carries row content beyond those.
 *
 * - `blocked`: the probe could not look (desktop not listening, web not
 *   running, no session, key refused, env unset). Never working or broken.
 * - `retired`: only for a path a decision record retires. None does today.
 */

export type PathState = "working" | "broken" | "blocked" | "retired";
export type Direction = "web->desktop" | "desktop->web" | "web->desktop->web" | "both";

export interface Verdict {
  id: string;
  direction: Direction;
  state: PathState;
  reason: string;
}

/** One request, reduced to what the classifiers need. */
export type Obs =
  /** A precondition env var is not set. */
  | { kind: "unset"; name: string }
  /** No Supabase session; `reason` says why (default 'no session'). */
  | { kind: "no-session"; reason?: string }
  /** ECONNREFUSED: nothing listens there. */
  | { kind: "refused" }
  /** Any other network failure (timeout, DNS, reset); `code` is the error code only. */
  | { kind: "network"; code: string }
  | { kind: "status"; status: number; body?: unknown };

/** Copy of `DEVICE_FRESH_MS` in src/lib/sync/reachability.ts (this module may not import it); a test asserts they are equal. */
export const PROBE_DEVICE_FRESH_MS = 120_000;

/** How far back a command-plane row counts. */
export const COMMAND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const COMMAND_VERBS = [
  "pause_persona",
  "resume_persona",
  "run_persona",
  "cancel_execution",
  "chat_send",
  "review_decide",
] as const;
export type CommandVerb = (typeof COMMAND_VERBS)[number];

/** The refusals that mean the desktop does not trust the phone's key. */
export const PAIRING_REFUSALS: ReadonlySet<string> = new Set(["controller_not_paired", "controller_revoked"]);

/**
 * Routes `personas://` is handled for today, read from personas
 * `src-tauri/src/boot/deep_link.rs` on master 654263d997 (2026-10-07).
 */
export const DESKTOP_DEEP_LINKS: readonly { id: string; route: string }[] = [
  { id: "deep-links.auth-callback", route: "auth/callback" },
  { id: "deep-links.share", route: "share" },
  { id: "deep-links.import", route: "import/<slug>" },
  { id: "deep-links.ref", route: "ref/<code>" },
  { id: "deep-links.pair", route: "pair" },
];

/** Links the web would need with no web builder and no desktop handler today (milestone 4 goal 3 is open). */
export const UNHANDLED_DEEP_LINKS: readonly string[] = ["deep-links.persona", "deep-links.execution"];

const verdict = (id: string, direction: Direction, state: PathState, reason: string): Verdict => ({
  id,
  direction,
  state,
  reason,
});

/** The text before the first ':' of an error message, trimmed; the only part of it the probe prints. */
export function errorToken(message: unknown): string {
  if (typeof message !== "string" || message.trim() === "") return "no error message";
  return message.split(":")[0].trim() || "no error message";
}

/** "45s", "12m", "3h", "2d". */
export function formatAge(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 120) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 120) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

/**
 * The shared non-success verdicts: null when `obs` is a 2xx and the caller
 * should go on to read its body. `what` names the far side in reasons.
 */
function gate(obs: Obs, what: string): { state: PathState; reason: string } | null {
  switch (obs.kind) {
    case "unset":
      return { state: "blocked", reason: `${obs.name} unset` };
    case "no-session":
      return { state: "blocked", reason: obs.reason ?? "no session" };
    case "refused":
      return { state: "blocked", reason: `${what} not listening` };
    case "network":
      return { state: "broken", reason: `${what} network ${obs.code}` };
    case "status":
      if (obs.status === 401 || obs.status === 403) {
        return { state: "blocked", reason: `${what} refused the key (${obs.status})` };
      }
      if (obs.status < 200 || obs.status >= 300) {
        return { state: "broken", reason: `${what} answered ${obs.status}` };
      }
      return null;
  }
}

/** Persona ids from the desktop's `{success,data:[{id}]}` envelope or a bare array; null when the body is neither. */
export function personaIdsFromBody(body: unknown): string[] | null {
  let rows: unknown = body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const env = body as { success?: unknown; data?: unknown };
    if (env.success !== true) return null;
    rows = env.data;
  }
  if (!Array.isArray(rows)) return null;
  const ids: string[] = [];
  for (const r of rows) {
    const id = (r as { id?: unknown } | null)?.id;
    if (typeof id !== "string") return null;
    ids.push(id);
  }
  return ids;
}

/** True when the body is an envelope that says it failed. */
function envelopeFailed(body: unknown): boolean {
  return !!body && typeof body === "object" && (body as { success?: unknown }).success === false;
}

const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && [...sa].every((x) => sb.has(x));
};

/** (1) desktop-api.direct: GET /health, /api/status and /api/personas with the team key. `ids` is the desktop's persona set, null unless working. */
export function classifyDirect(obs: { health: Obs; status: Obs; personas: Obs }): {
  verdict: Verdict;
  ids: string[] | null;
} {
  const id = "desktop-api.direct";
  const steps: [string, Obs][] = [
    ["/health", obs.health],
    ["/api/status", obs.status],
    ["/api/personas", obs.personas],
  ];
  for (const [path, o] of steps) {
    const g = gate(o, "desktop");
    if (g) return { verdict: verdict(id, "web->desktop", g.state, `${path}: ${g.reason}`), ids: null };
  }
  if (envelopeFailed((obs.status as { body?: unknown }).body)) {
    return { verdict: verdict(id, "web->desktop", "broken", "/api/status: success false"), ids: null };
  }
  const ids = personaIdsFromBody((obs.personas as { body?: unknown }).body);
  if (!ids) return { verdict: verdict(id, "web->desktop", "broken", "/api/personas: unrecognized body"), ids: null };
  return { verdict: verdict(id, "web->desktop", "working", `health ok, ${ids.length} personas`), ids };
}

/** The proxy's own refusals that mean its env is not set up, so the probe could not look through it. */
const PROXY_BLOCKED_ERRORS: ReadonlySet<string> = new Set(["orchestrator_not_configured", "auth_unavailable"]);

/** (2) desktop-api.proxy: GET {web}/api/orchestrator/api/personas with x-user-token. Milestone 2 goal 1's measure. */
export function classifyProxy(obs: Obs, directIds: readonly string[] | null): Verdict {
  const id = "desktop-api.proxy";
  if (obs.kind === "refused") return verdict(id, "web->desktop", "blocked", "web not running");
  if (obs.kind === "status" && obs.status === 503) {
    const err = (obs.body as { error?: unknown } | null)?.error;
    if (typeof err === "string" && PROXY_BLOCKED_ERRORS.has(err)) {
      return verdict(id, "web->desktop", "blocked", `web answered 503 ${err}`);
    }
  }
  const g = gate(obs, "web");
  if (g) return verdict(id, "web->desktop", g.state, g.reason);
  const ids = personaIdsFromBody((obs as { body?: unknown }).body);
  if (!ids) return verdict(id, "web->desktop", "broken", "proxy body has no persona ids");
  if (!directIds) return verdict(id, "web->desktop", "blocked", "cannot compare without the desktop");
  if (!sameSet(ids, directIds)) {
    return verdict(id, "web->desktop", "broken", `proxy ids (${ids.length}) differ from direct ids (${directIds.length})`);
  }
  return verdict(id, "web->desktop", "working", `${ids.length} persona ids equal the desktop's`);
}

/** (3) mirror.devices: the user's synced_devices rows. Working when the freshest stamp is within PROBE_DEVICE_FRESH_MS of `now`. */
export function classifyDevices(obs: Obs, now: number): Verdict {
  const id = "mirror.devices";
  const g = gate(obs, "supabase");
  if (g) return verdict(id, "desktop->web", g.state, g.reason);
  const body = (obs as { body?: unknown }).body;
  if (!Array.isArray(body)) return verdict(id, "desktop->web", "broken", "unrecognized body");
  if (body.length === 0) return verdict(id, "desktop->web", "blocked", "no device synced yet");
  const stamps = body
    .map((r) => Date.parse((r as { last_seen_at?: unknown })?.last_seen_at as string))
    .filter((t) => Number.isFinite(t));
  if (stamps.length === 0) return verdict(id, "desktop->web", "broken", `mirror stale (${body.length} devices, never seen)`);
  const age = now - Math.max(...stamps);
  if (age > PROBE_DEVICE_FRESH_MS) {
    return verdict(id, "desktop->web", "broken", `mirror stale (newest of ${body.length} devices seen ${formatAge(age)} ago)`);
  }
  return verdict(id, "desktop->web", "working", `device seen ${formatAge(age)} ago`);
}

/** (4) mirror.personas: the user's synced_personas ids must include every desktop id. Milestone 3 goal 2's measure. */
export function classifyMirrorPersonas(obs: Obs, directIds: readonly string[] | null): Verdict {
  const id = "mirror.personas";
  const g = gate(obs, "supabase");
  if (g) return verdict(id, "desktop->web", g.state, g.reason);
  const body = (obs as { body?: unknown }).body;
  if (!Array.isArray(body)) return verdict(id, "desktop->web", "broken", "unrecognized body");
  if (!directIds) return verdict(id, "desktop->web", "blocked", "cannot compare without the desktop");
  const mirrored = new Set(body.map((r) => (r as { id?: unknown })?.id).filter((x) => typeof x === "string"));
  const missing = directIds.filter((x) => !mirrored.has(x)).length;
  if (missing > 0) {
    return verdict(id, "desktop->web", "broken", `${missing} of ${directIds.length} desktop ids missing from the mirror`);
  }
  return verdict(id, "desktop->web", "working", `all ${directIds.length} desktop ids mirrored (${mirrored.size} rows)`);
}

/** (5) command-plane.<verb>: the newest pending_commands row of that verb in the last 7 days (newest first). */
export function classifyCommand(verb: string, obs: Obs): Verdict {
  const id = `command-plane.${verb}`;
  const dir: Direction = "web->desktop->web";
  const g = gate(obs, "supabase");
  if (g) return verdict(id, dir, g.state, g.reason);
  const body = (obs as { body?: unknown }).body;
  if (!Array.isArray(body)) return verdict(id, dir, "broken", "unrecognized body");
  if (body.length === 0) return verdict(id, dir, "blocked", "no command issued yet");
  const row = body[0] as { status?: unknown; error_message?: unknown };
  switch (row?.status) {
    case "completed":
      return verdict(id, dir, "working", "newest command completed");
    case "rejected":
    case "failed":
      return verdict(id, dir, "broken", `${row.status} ${errorToken(row.error_message)}`);
    case "expired":
      return verdict(id, dir, "broken", "desktop did not answer");
    default:
      // pending / approved / executing: no outcome to read yet.
      return verdict(id, dir, "blocked", `newest command still ${String(row?.status)}`);
  }
}

/**
 * (6) pairing: working when a controller is active (not revoked) and no signed
 * command newer than the newest activation was refused as not paired / revoked.
 * `refusals` is the user's signed, rejected commands, newest first.
 */
export function classifyPairing(controllers: Obs, refusals: Obs): Verdict {
  const id = "pairing";
  const g = gate(controllers, "supabase");
  if (g) return verdict(id, "both", g.state, g.reason);
  const rows = (controllers as { body?: unknown }).body;
  if (!Array.isArray(rows)) return verdict(id, "both", "broken", "unrecognized body");
  if (rows.length === 0) return verdict(id, "both", "blocked", "no controller paired");
  type Row = { status?: unknown; revoked_at?: unknown; activated_at?: unknown; created_at?: unknown };
  const active = (rows as Row[]).filter((r) => r?.status === "active" && !r.revoked_at);
  if (active.length === 0) return verdict(id, "both", "broken", `no active controller (${rows.length} not active)`);
  const since = Math.max(
    ...active.map((r) => Date.parse((r.activated_at ?? r.created_at) as string)).filter((t) => Number.isFinite(t)),
  );
  const rg = gate(refusals, "supabase");
  if (rg) return verdict(id, "both", rg.state, `refusal read: ${rg.reason}`);
  const refused = (refusals as { body?: unknown }).body;
  if (!Array.isArray(refused)) return verdict(id, "both", "broken", "unrecognized refusal body");
  for (const r of refused as { error_message?: unknown; requested_at?: unknown }[]) {
    const token = errorToken(r?.error_message);
    const at = Date.parse(r?.requested_at as string);
    if (PAIRING_REFUSALS.has(token) && (!Number.isFinite(since) || at > since)) {
      return verdict(id, "both", "broken", `newer signed command refused ${token}`);
    }
  }
  return verdict(id, "both", "working", `${active.length} active controller(s), no refusal since`);
}

/** Whether `personas://` is registered for the current user (HKCU on Windows). */
export type SchemeObs = "registered" | "absent" | "not-windows";

/** (7) deep-links: one row for the scheme, one per handled route, one per link with no handler. */
export function classifyDeepLinks(scheme: SchemeObs): Verdict[] {
  const dir: Direction = "web->desktop";
  const out: Verdict[] = [];
  const blockedReason =
    scheme === "absent" ? "personas:// not registered on this machine" : "registry check is Windows-only";
  out.push(
    scheme === "registered"
      ? verdict("deep-links.scheme", dir, "working", "personas:// registered (HKCU)")
      : verdict("deep-links.scheme", dir, "blocked", blockedReason),
  );
  for (const link of DESKTOP_DEEP_LINKS) {
    out.push(
      scheme === "registered"
        ? verdict(link.id, dir, "working", `handled: ${link.route} (deep_link.rs, 2026-10-07)`)
        : verdict(link.id, dir, "blocked", blockedReason),
    );
  }
  for (const id of UNHANDLED_DEEP_LINKS) out.push(verdict(id, dir, "broken", "no handler"));
  return out;
}

/** 0 every path working or retired; 1 any broken; 3 none broken but any blocked. (2, a config refusal, is decided before any path runs.) */
export function exitCodeFor(verdicts: readonly Verdict[]): 0 | 1 | 3 {
  if (verdicts.some((v) => v.state === "broken")) return 1;
  if (verdicts.some((v) => v.state === "blocked")) return 3;
  return 0;
}

export const EXIT_CONFIG_REFUSAL = 2;

const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

/** null when PROBE_DESKTOP_URL is an http(s) loopback URL; otherwise the name of the check that failed. */
export function desktopUrlRefusal(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "PROBE_DESKTOP_URL is not a URL";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "PROBE_DESKTOP_URL is not http(s)";
  if (url.username || url.password) return "PROBE_DESKTOP_URL carries credentials";
  if (!LOOPBACK_HOSTS.has(url.hostname)) return "PROBE_DESKTOP_URL is not a loopback URL";
  return null;
}

/** null when PROBE_WEB_URL is an http(s) URL without credentials; otherwise the check that failed. */
export function webUrlRefusal(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "PROBE_WEB_URL is not a URL";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "PROBE_WEB_URL is not http(s)";
  if (url.username || url.password) return "PROBE_WEB_URL carries credentials";
  return null;
}

/**
 * null when NEXT_PUBLIC_SUPABASE_URL is the test project (host starts with
 * `pvfw`, decision 2026-10-07) or a local stack; otherwise the check that
 * failed. Unset is not a refusal: then nothing touches Supabase and every
 * session path is blocked.
 */
export function supabaseUrlRefusal(raw: string | undefined): string | null {
  if (raw === undefined || raw === "") return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is not a URL";
  }
  if (url.username || url.password) return "NEXT_PUBLIC_SUPABASE_URL carries credentials";
  const host = url.hostname.toLowerCase();
  if (host.startsWith("pvfw") || host === "localhost" || host === "127.0.0.1") return null;
  return "NEXT_PUBLIC_SUPABASE_URL host is not the pvfw test project or localhost";
}

/** One aligned line per path, then a summary line. */
export function formatReport(verdicts: readonly Verdict[]): string {
  const w = (k: keyof Verdict) => Math.max(...verdicts.map((v) => v[k].length));
  const [wi, wd, ws] = [w("id"), w("direction"), w("state")];
  const lines = verdicts.map(
    (v) => `${v.id.padEnd(wi)}  ${v.direction.padEnd(wd)}  ${v.state.padEnd(ws)}  ${v.reason}`,
  );
  return [...lines, summaryLine(verdicts)].join("\n");
}

export function summaryLine(verdicts: readonly Verdict[]): string {
  const n = (s: PathState) => verdicts.filter((v) => v.state === s).length;
  return `${verdicts.length} paths: ${n("working")} working, ${n("broken")} broken, ${n("blocked")} blocked, ${n("retired")} retired (exit ${exitCodeFor(verdicts)})`;
}
