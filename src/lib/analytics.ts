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

function trackEvent(name: string, attributes?: Record<string, string>) {
  if (hasAnalyticsConsent()) {
    Sentry.metrics.count(name, 1, { attributes });
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
    try {
      Sentry.metrics.count(ev.name, 1, { attributes: ev.attributes });
    } catch {
      // Swallow per-event SDK errors so one failure does not drop the rest
      // of the queue (and turn a transient hiccup into a permanent blackout).
    }
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
