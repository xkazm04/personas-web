export function formatDuration(ms: number | null): string {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

export function formatCost(usd: number | null): string {
  if (usd == null) return "-";
  if (usd === 0) return "$0.0000";
  return `$${usd.toFixed(4)}`;
}

/**
 * Normalize blank/whitespace strings to undefined so `??` chains fall through.
 * Empty `full_name` from partial OAuth profiles otherwise produces an empty avatar.
 */
export function nonBlank(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : value;
}

// Tolerance for "future" timestamps before we treat them as real clock skew.
// Below this threshold we still render "just now" — covers ordinary jitter
// between server and client clocks without surfacing diagnostic noise.
const FUTURE_SKEW_TOLERANCE_MS = 60_000;
let skewBreadcrumbReported = false;

export function relativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "-";
  const diff = Date.now() - ts;

  if (diff < -FUTURE_SKEW_TOLERANCE_MS) {
    // Persistent future timestamps mean either upstream clock skew or wrong
    // user clock — silently clamping to "just now" hides the diagnostic.
    // Fall back to the absolute UTC date and breadcrumb once per session.
    if (!skewBreadcrumbReported) {
      skewBreadcrumbReported = true;
      void import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.addBreadcrumb({
            category: "format",
            level: "warning",
            message: "relativeTime received future timestamp beyond tolerance",
            data: { skewMs: diff },
          });
        })
        .catch(() => {
          // Swallow — Sentry isn't required for the format fallback.
        });
    }
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  const positive = Math.max(0, diff);
  const mins = Math.floor(positive / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
