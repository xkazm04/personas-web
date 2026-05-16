/**
 * Date formatters used across blog, changelog, and other content pages.
 * Keeps locale + format strings in one place so they can be updated globally.
 *
 * All formatters parse the date as UTC midnight and format in UTC so SSR
 * (always UTC) and client (any local zone) produce identical strings — no
 * hydration mismatch and no west-of-UTC user seeing the previous day for
 * a release dated YYYY-MM-DD.
 */

/** "Mar 15, 2026" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "March 15, 2026" */
export function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
