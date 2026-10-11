import * as Sentry from "@sentry/nextjs";
import { COOKIE_CONSENT_KEY } from "@/lib/constants";
import type { DownloadPlan } from "@/lib/release";

// ── Consent-gated analytics (respects cookie consent state) ─────────────────

type QueuedEvent =
  | { kind: "count"; name: string; attributes?: Record<string, string> }
  | { kind: "distribution"; name: string; value: number; unit: string; attributes?: Record<string, string> };

const MAX_QUEUE_SIZE = 50;
const queue: QueuedEvent[] = [];

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "all";
}

// Telemetry must never throw into the caller — a click handler / route effect
// must not break because the SDK is mid-init, metrics are disabled, or the
// `metrics` API is unavailable in this build. Both call sites go through this.
function safeCount(name: string, attributes?: Record<string, string>) {
  try {
    Sentry.metrics.count(name, 1, { attributes });
  } catch {
    // Swallow SDK errors so analytics can never turn a transient hiccup (or a
    // missing metrics API) into a permanent blackout or a crashed UI handler.
  }
}

function safeDistribution(name: string, value: number, unit: string, attributes?: Record<string, string>) {
  try {
    Sentry.metrics.distribution(name, value, { unit, attributes });
  } catch {
    // Same contract as safeCount: a missing metrics API must not reach the caller.
  }
}

function dispatch(ev: QueuedEvent) {
  if (ev.kind === "count") safeCount(ev.name, ev.attributes);
  else safeDistribution(ev.name, ev.value, ev.unit, ev.attributes);
}

function enqueueOrSend(ev: QueuedEvent) {
  if (hasAnalyticsConsent()) {
    dispatch(ev);
  } else {
    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift();
    }
    queue.push(ev);
  }
}

function trackEvent(name: string, attributes?: Record<string, string>) {
  enqueueOrSend({ kind: "count", name, attributes });
}

export function flushAnalyticsQueue() {
  if (!hasAnalyticsConsent()) return;
  while (queue.length > 0) {
    dispatch(queue.shift()!);
  }
}

// ── Public API (signatures stay unchanged) ───────────────────────────────────

export function trackPageView(page: string) {
  trackEvent("page_view", { page });
}

export type WebVitalName = "LCP" | "INP" | "CLS";

/**
 * A real-user vital as a Sentry distribution, tagged by normalized route. Goes
 * through the same consent queue as every other event, so a visitor who has not
 * opted in is never measured. PII: metric name + route only.
 */
export function trackWebVital(name: WebVitalName, value: number, route: string) {
  if (!Number.isFinite(value)) return;
  enqueueOrSend({
    kind: "distribution",
    name: `web_vital.${name.toLowerCase()}`,
    value,
    unit: name === "CLS" ? "none" : "millisecond",
    attributes: { route },
  });
}

/** Which "Download" CTA was clicked. Every download CTA reports itself, so the
 *  funnel can tell the hero, the pricing offer, the download section and the
 *  navbar apart. The navbar reports only its installer branch: its waitlist
 *  branch opens the modal, which reports `waitlist_open` with `entry_point:
 *  "navbar"` instead. */
export type DownloadPlacement = "download-cta" | "hero" | "features-hero" | "pricing" | "navbar";

/**
 * `download_click` attributes under this build's release plan. `outcome` is
 * what the click did: `installer` (went to /api/download) or `waitlist` (no
 * installer is configured, so the CTA leads to the download section's
 * waitlist). `platform` is the installer's when one is live, otherwise the
 * visitor's own - the waitlist they will be offered, as the waitlist events
 * report it. PII: these three fields only.
 */
export function downloadClickAttributes(
  plan: DownloadPlan,
  placement: DownloadPlacement,
  visitorPlatform: string,
): Record<string, string> {
  return plan.primary.kind === "download"
    ? { platform: plan.primary.platform, placement, outcome: "installer" }
    : { platform: visitorPlatform, placement, outcome: "waitlist" };
}

export function trackDownloadClick(plan: DownloadPlan, placement: DownloadPlacement, visitorPlatform: string) {
  trackEvent("download_click", downloadClickAttributes(plan, placement, visitorPlatform));
}

/**
 * Where a waitlist modal was opened from. The waitlist is the only live
 * conversion path while no download URL is configured, so every entry point
 * reports itself and funnel drop-off is attributable.
 */
export type WaitlistEntryPoint = "download-cta" | "platform-pill" | "navbar";

// PII: waitlist events carry the platform + entry point ONLY. The email the
// user typed must never reach analytics (see src/lib/sentry-pii.ts).
export function trackWaitlistOpen(platform: string, entryPoint: WaitlistEntryPoint) {
  trackEvent("waitlist_open", { platform, entry_point: entryPoint });
}

export function trackWaitlistSubmit(platform: string, entryPoint: WaitlistEntryPoint) {
  trackEvent("waitlist_submit", { platform, entry_point: entryPoint });
}

export function trackWaitlistResult(
  platform: string,
  entryPoint: WaitlistEntryPoint,
  result: "success" | "duplicate",
) {
  trackEvent("waitlist_result", { platform, entry_point: entryPoint, result });
}

export function trackFeatureVote(featureId: string, action: "upvote" | "undo") {
  trackEvent("feature_vote", { feature: featureId, action });
}

// Counts only. The request's text is user content, and it already has its home in
// /api/feature-requests; a copy here would be a second destination for it.
export function trackFeatureRequest() {
  trackEvent("feature_request");
}

export function trackFeatureComment(featureId: string, action: "add" | "reply") {
  trackEvent("feature_comment", { feature: featureId, action });
}
