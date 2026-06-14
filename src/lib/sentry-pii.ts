/**
 * PII scrubbing utilities for Sentry events and breadcrumbs.
 *
 * Mirrors the desktop Rust pii module — strips or redacts:
 * - UUIDs (execution_id, persona_id, etc.) → short hash prefix
 * - Quoted names (persona names, credential names) → [redacted]
 * - Full URLs → domain-only
 * - Sensitive breadcrumb data fields
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
  return `${url.slice(0, schemeEnd)}://${cleanHost}/\u2026`;
}

/** Scrub PII from a log message string. */
export function scrubPii(input: string): string {
  // 1. Replace UUIDs with a short prefix for correlation
  let result = input.replace(UUID_RE, (match) => `[id:${match.slice(0, 6)}]`);
  // 2. Redact bare email addresses (before quoted/URL passes so they're caught
  //    even when not quoted and not inside a URL)
  result = result.replace(EMAIL_RE, "[redacted-email]");
  // 3. Reduce URLs to scheme + host only
  result = result.replace(URL_RE, (match) => redactUrl(match));
  // 4. Redact quoted strings (credential names, persona names, etc.)
  result = result.replace(QUOTED_RE, "[redacted]");
  return result;
}

/**
 * Recursively scrub a free-form object payload (`contexts`, `extra`, `tags`,
 * stack-frame `vars`, etc.). Strings get the regex pass; objects/arrays get
 * walked; sensitive-field keys get deleted outright. Capped depth prevents
 * pathological structures (cyclic refs, very deep trees) from stalling the
 * beforeSend hook on the request thread.
 */
const MAX_SCRUB_DEPTH = 6;

function scrubData(value: unknown, depth = 0): unknown {
  if (depth > MAX_SCRUB_DEPTH) return value;
  if (typeof value === "string") return scrubPii(value);
  if (Array.isArray(value)) {
    return value.map((item) => scrubData(item, depth + 1));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) continue;
      out[key] = scrubData(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** Scrub PII from a Sentry event (used as beforeSend hook). */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // Strip user fields. user.id is often a Supabase UUID; reduce to a short
  // correlation prefix instead of leaking the whole identifier.
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
    if (typeof event.user.id === "string") {
      event.user.id = scrubPii(event.user.id);
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
  // Scrub PII from exception values + their stack-frame variables.
  if (event.exception?.values) {
    for (const exc of event.exception.values) {
      if (exc.value) {
        exc.value = scrubPii(exc.value);
      }
      const frames = exc.stacktrace?.frames;
      if (frames) {
        for (const frame of frames) {
          if (frame.vars) {
            frame.vars = scrubData(frame.vars) as Record<string, unknown>;
          }
        }
      }
    }
  }
  // Scrub PII from `contexts` — the most common leak path because
  // Sentry.captureException(err, { contexts: { persona: { id } } }) passes
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

/**
 * Pre-scrubs the error message and stack at the call site before handing it
 * to Sentry. The global `beforeSend` hook (`scrubEvent`) already runs on
 * every event, but it only touches `event.message` / `exception.values[].value`
 * / breadcrumbs — it does NOT touch the original error.message or
 * error.stack strings, and it does NOT scrub `extra` / `contexts` payloads
 * the caller passes in. Top-level error boundaries are the highest-volume
 * Sentry path on the site and the one most likely to fire on real user
 * sessions, so an explicit scrubbing wrapper here closes a privacy /
 * compliance gap that CLAUDE.md mandates.
 */
export function captureExceptionScrubbed(
  error: unknown,
  hint?: CaptureExceptionHint,
): string {
  let scrubbed: unknown = error;
  if (error instanceof Error) {
    scrubbed = new Error(scrubPii(error.message));
    if (error.stack) (scrubbed as Error).stack = scrubPii(error.stack);
    (scrubbed as Error).name = error.name;
  } else if (typeof error === "string") {
    scrubbed = scrubPii(error);
  }
  return Sentry.captureException(scrubbed, hint);
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
