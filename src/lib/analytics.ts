import * as Sentry from "@sentry/nextjs";

/**
 * Track a page view. Call from client components on mount / route change.
 */
export function trackPageView(page: string) {
  Sentry.metrics.count("page_view", 1, { attributes: { page } });
}

/**
 * Track a download button click.
 */
export function trackDownloadClick(platform: string) {
  Sentry.metrics.count("download_click", 1, { attributes: { platform } });
}

/**
 * Track a feature vote (upvote or undo).
 */
export function trackFeatureVote(featureId: string, action: "upvote" | "undo") {
  Sentry.metrics.count("feature_vote", 1, {
    attributes: { feature: featureId, action },
  });
}

/**
 * Track a custom feature request submission.
 */
export function trackFeatureRequest(text?: string) {
  Sentry.metrics.count("feature_request", 1, {
    attributes: text ? { text: text.slice(0, 200) } : undefined,
  });
}
