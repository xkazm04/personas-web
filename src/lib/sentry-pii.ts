/**
 * PII scrubbing utilities for Sentry events and breadcrumbs.
 *
 * Mirrors the desktop Rust pii module — strips or redacts:
 * - UUIDs (execution_id, persona_id, etc.) → short hash prefix
 * - Quoted names (persona names, credential names) → [redacted]
 * - Full URLs → domain-only
 * - Sensitive breadcrumb data fields
 */
import type { ErrorEvent, Breadcrumb } from "@sentry/nextjs";

// ── Regex patterns (match the Rust pii module) ──────────────────────────────

const UUID_RE =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

const QUOTED_RE = /'[^']{1,200}'|"[^"]{1,200}"/g;

const URL_RE = /https?:\/\/[^\s,)}\]]+/g;

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
  // 2. Reduce URLs to scheme + host only
  result = result.replace(URL_RE, (match) => redactUrl(match));
  // 3. Redact quoted strings (credential names, persona names, etc.)
  result = result.replace(QUOTED_RE, "[redacted]");
  return result;
}

/** Scrub PII from a Sentry event (used as beforeSend hook). */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // Strip user fields
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
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
  // Scrub PII from exception values
  if (event.exception?.values) {
    for (const exc of event.exception.values) {
      if (exc.value) {
        exc.value = scrubPii(exc.value);
      }
    }
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
