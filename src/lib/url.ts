/**
 * Sanitizes a URL intended for use in an external <a href>. Returns the
 * original value only if it parses as an absolute http(s) URL; otherwise
 * returns "#" so dangerous schemes (javascript:, data:, vbscript:, etc.)
 * cannot reach the DOM.
 *
 * Use at the trust boundary for any URL that might originate from data,
 * a CMS, or user input — even if today's source is a hardcoded constant.
 */
export function sanitizeExternalUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return value;
    }
  } catch {
    // Not a parseable absolute URL — fall through to reject.
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[sanitizeExternalUrl] Rejected non-http(s) URL: ${value}`);
  }
  return "#";
}
