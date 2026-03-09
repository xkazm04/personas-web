import * as Sentry from "@sentry/nextjs";

// ── Analytics provider (single place to swap the backing service) ────────────

function trackEvent(name: string, attributes?: Record<string, string>) {
  Sentry.metrics.count(name, 1, { attributes });
}

// ── Public API (signatures stay unchanged) ───────────────────────────────────

/**
 * Track a page view. Call from client components on mount / route change.
 */
export function trackPageView(page: string) {
  trackEvent("page_view", { page });
}

/**
 * Track a download button click.
 */
export function trackDownloadClick(platform: string) {
  trackEvent("download_click", { platform });
}

/**
 * Track a feature vote (upvote or undo).
 */
export function trackFeatureVote(featureId: string, action: "upvote" | "undo") {
  trackEvent("feature_vote", { feature: featureId, action });
}

/**
 * Track a custom feature request submission.
 */
export function trackFeatureRequest(text?: string) {
  trackEvent("feature_request", text ? { text: text.slice(0, 200) } : undefined);
}

/**
 * Track a comment on a feature vote card.
 */
export function trackFeatureComment(featureId: string, action: "add" | "reply") {
  trackEvent("feature_comment", { feature: featureId, action });
}
