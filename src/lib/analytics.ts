import * as Sentry from "@sentry/nextjs";
import { COOKIE_CONSENT_KEY } from "@/lib/constants";

// ── Consent-gated analytics (respects cookie consent state) ─────────────────

type QueuedEvent = { name: string; attributes?: Record<string, string> };

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

function trackEvent(name: string, attributes?: Record<string, string>) {
  if (hasAnalyticsConsent()) {
    safeCount(name, attributes);
  } else {
    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift();
    }
    queue.push({ name, attributes });
  }
}

export function flushAnalyticsQueue() {
  if (!hasAnalyticsConsent()) return;
  while (queue.length > 0) {
    const ev = queue.shift()!;
    safeCount(ev.name, ev.attributes);
  }
}

// ── Public API (signatures stay unchanged) ───────────────────────────────────

export function trackPageView(page: string) {
  trackEvent("page_view", { page });
}

export function trackDownloadClick(platform: string) {
  trackEvent("download_click", { platform });
}

export function trackFeatureVote(featureId: string, action: "upvote" | "undo") {
  trackEvent("feature_vote", { feature: featureId, action });
}

export function trackFeatureRequest(text?: string) {
  trackEvent("feature_request", text ? { text: text.slice(0, 200) } : undefined);
}

export function trackFeatureComment(featureId: string, action: "add" | "reply") {
  trackEvent("feature_comment", { feature: featureId, action });
}
