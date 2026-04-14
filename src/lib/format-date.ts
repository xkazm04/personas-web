/**
 * Date formatters used across blog, changelog, and other content pages.
 * Keeps locale + format strings in one place so they can be updated globally.
 */

/** "Mar 15, 2026" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "March 15, 2026" */
export function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
