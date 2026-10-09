#!/usr/bin/env node
/**
 * Read-only both-ways path probe: reports every desktop<->web path as working,
 * broken, blocked or retired (docs/features/infrastructure/desktop-web-paths.md).
 *
 * This file does the I/O only; every verdict comes from
 * src/lib/pathProbe/classify.ts, imported directly (Node strips the types).
 * It issues GETs and one Supabase sign-in, never an insert, update, delete,
 * signature or command, never reads SUPABASE_SERVICE_ROLE_KEY, and prints
 * ids-free verdicts only: states, counts, error tokens and ages.
 *
 * Env, from process.env only. Run with:
 *   node --env-file=<path-to-.env> scripts/probe-paths.mjs [--json]
 *
 * Exit: 0 every path working or retired; 1 any broken; 3 none broken but any
 * blocked; 2 config refusal (prints only which check failed).
 */

import { execFileSync } from "node:child_process";
import process from "node:process";

// package.json has no "type", so Node warns that the .ts module is parsed as
// ESM after a retry. That is expected here; silence that one warning only. A
// static import would evaluate before this listener exists.
process.removeAllListeners("warning");
process.on("warning", (w) => {
  if (w.code !== "MODULE_TYPELESS_PACKAGE_JSON") console.warn(`${w.name}: ${w.message}`);
});

const {
  COMMAND_VERBS,
  COMMAND_WINDOW_MS,
  EXIT_CONFIG_REFUSAL,
  classifyCommand,
  classifyDeepLinks,
  classifyDevices,
  classifyDirect,
  classifyMirrorPersonas,
  classifyMirrorReviews,
  classifyPairing,
  classifyProxy,
  classifyReviewReports,
  pendingCouncilReportIds,
  desktopUrlRefusal,
  exitCodeFor,
  formatReport,
  supabaseUrlRefusal,
  webUrlRefusal,
} = await import("../src/lib/pathProbe/classify.ts");

// Pure, no imports: the phone's own parser of a review's context_data.
const { reviewReportId } = await import("../src/lib/commands/deskOnlyReview.ts");

const TIMEOUT_MS = 8000;
const json = process.argv.includes("--json");
const env = process.env;

const desktopUrl = env.PROBE_DESKTOP_URL || "http://127.0.0.1:9420";
const webUrl = env.PROBE_WEB_URL || "http://localhost:3000";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || undefined;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;
const teamKey = env.TEAM_API_KEY || undefined;

const refusal = desktopUrlRefusal(desktopUrl) ?? webUrlRefusal(webUrl) ?? supabaseUrlRefusal(supabaseUrl);
if (refusal) {
  console.error(`Refused: ${refusal}.`);
  process.exit(EXIT_CONFIG_REFUSAL);
}

/** The network error code of a failed fetch (Node wraps it in `cause`, sometimes an AggregateError). */
function networkCode(err) {
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return "timeout";
  const cause = err?.cause;
  const codes = [cause?.code, ...(Array.isArray(cause?.errors) ? cause.errors.map((e) => e?.code) : [])];
  if (codes.includes("ECONNREFUSED")) return "ECONNREFUSED";
  return codes.find(Boolean) ?? "fetch_failed";
}

/** One request reduced to an observation; the body is parsed for the classifiers and never printed. */
async function observe(url, init = {}) {
  let res;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const code = networkCode(err);
    return code === "ECONNREFUSED" ? { kind: "refused" } : { kind: "network", code };
  }
  let body;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }
  return { kind: "status", status: res.status, body };
}

/** The session: PROBE_ACCESS_TOKEN, else a password sign-in. Returns { token, userId } or { blocked }. */
async function getSession() {
  if (!supabaseUrl) return { blocked: { kind: "unset", name: "NEXT_PUBLIC_SUPABASE_URL" } };
  if (!anonKey) return { blocked: { kind: "unset", name: "NEXT_PUBLIC_SUPABASE_ANON_KEY" } };
  let token = env.PROBE_ACCESS_TOKEN || undefined;
  if (!token) {
    if (!env.PROBE_EMAIL || !env.PROBE_PASSWORD) return { blocked: { kind: "no-session" } };
    const signIn = await observe(new URL("/auth/v1/token?grant_type=password", supabaseUrl), {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: env.PROBE_EMAIL, password: env.PROBE_PASSWORD }),
    });
    if (signIn.kind !== "status") return { blocked: { kind: "no-session", reason: `no session (sign-in ${signIn.kind === "refused" ? "ECONNREFUSED" : signIn.code})` } };
    token = signIn.status === 200 ? signIn.body?.access_token : undefined;
    if (typeof token !== "string") return { blocked: { kind: "no-session", reason: `no session (sign-in refused, ${signIn.status})` } };
  }
  const user = await observe(new URL("/auth/v1/user", supabaseUrl), {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  const userId = user.kind === "status" && user.status === 200 ? user.body?.id : undefined;
  if (typeof userId !== "string") {
    const why = user.kind === "status" ? user.status : user.kind === "refused" ? "ECONNREFUSED" : user.code;
    return { blocked: { kind: "no-session", reason: `no session (token refused, ${why})` } };
  }
  return { token, userId };
}

/** A GET against PostgREST with the anon key and the user's session, so RLS applies. */
function rest(session, table, query) {
  if (session.blocked) return Promise.resolve(session.blocked);
  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  for (const [k, v] of Object.entries({ ...query, user_id: `eq.${session.userId}` })) url.searchParams.set(k, v);
  return observe(url, {
    headers: { apikey: anonKey, Authorization: `Bearer ${session.token}`, Accept: "application/json" },
  });
}

function schemeRegistration() {
  if (process.platform !== "win32") return "not-windows";
  try {
    execFileSync("reg", ["query", "HKCU\\Software\\Classes\\personas"], { stdio: "ignore" });
    return "registered";
  } catch {
    return "absent";
  }
}

async function main() {
  const now = Date.now();
  const keyed = { headers: teamKey ? { Authorization: `Bearer ${teamKey}` } : {} };
  const desktopGet = (path) =>
    teamKey ? observe(new URL(path, desktopUrl), keyed) : Promise.resolve({ kind: "unset", name: "TEAM_API_KEY" });

  // /health goes out even without the key, so "not listening" outranks "key unset".
  const [health, status, personas, session] = await Promise.all([
    observe(new URL("/health", desktopUrl), keyed),
    desktopGet("/api/status"),
    desktopGet("/api/personas"),
    getSession(),
  ]);
  const direct = classifyDirect({ health, status, personas });

  const proxyObs = session.blocked
    ? session.blocked.kind === "unset"
      ? { kind: "no-session" }
      : session.blocked
    : await observe(new URL("/api/orchestrator/api/personas", webUrl), {
        headers: { "x-user-token": session.token },
      });

  // Council reviews, then the reports of the pending ones (ids only: never content or metadata).
  const reviews = await rest(session, "synced_manual_reviews", { select: "execution_id,context_data,status,synced_at" });
  const wanted = pendingCouncilReportIds(reviews, reviewReportId);
  const reports = wanted.length
    ? await rest(session, "synced_messages", {
        select: "id",
        id: `in.(${wanted.map((x) => `"${x.replace(/["\\]/g, "\\$&")}"`).join(",")})`,
      })
    : null;

  const since = new Date(now - COMMAND_WINDOW_MS).toISOString();
  const [devices, mirrored, controllers, refusals, ...commands] = await Promise.all([
    rest(session, "synced_devices", { select: "last_seen_at" }),
    rest(session, "synced_personas", { select: "id" }),
    rest(session, "command_controllers", { select: "status,revoked_at,activated_at,created_at" }),
    rest(session, "pending_commands", {
      select: "error_message,requested_at",
      controller_id: "not.is.null",
      status: "eq.rejected",
      order: "requested_at.desc",
      limit: "50",
    }),
    ...COMMAND_VERBS.map((verb) =>
      rest(session, "pending_commands", {
        select: "status,error_message",
        command_type: `eq.${verb}`,
        requested_at: `gte.${since}`,
        order: "requested_at.desc",
        limit: "1",
      }),
    ),
  ]);

  const verdicts = [
    direct.verdict,
    classifyProxy(proxyObs, direct.ids),
    classifyDevices(devices, now),
    classifyMirrorPersonas(mirrored, direct.ids),
    classifyMirrorReviews(reviews, now, reviewReportId),
    classifyReviewReports(reviews, reports, reviewReportId),
    ...COMMAND_VERBS.map((verb, i) => classifyCommand(verb, commands[i])),
    classifyPairing(controllers, refusals),
    ...classifyDeepLinks(schemeRegistration()),
  ];

  console.log(json ? JSON.stringify(verdicts, null, 2) : formatReport(verdicts));
  process.exitCode = exitCodeFor(verdicts);
}

main().catch((err) => {
  // The message may carry a URL; print the error's name only.
  console.error("Probe failed:", err?.name ?? "Error");
  process.exit(1);
});
