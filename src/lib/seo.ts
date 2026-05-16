/** Shared SEO constants used across metadata, sitemap, and structured data. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://personas.ai";

export const SITE_NAME = "Personas";

export const SITE_DESCRIPTION =
  "Build and orchestrate multi-agent AI pipelines locally or in the cloud. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and 40+ integrations — no code required.";

export const SITE_LOCALE = "en_US";

export const TWITTER_HANDLE = "@PersonasAI";

/**
 * Stringify a JSON-LD payload safely for embedding inside a
 * `<script type="application/ld+json">` block.
 *
 * `JSON.stringify` does NOT escape the literal substring `</script>` (or
 * the HTML comment opener `<!--`), so any field containing one of those
 * sequences would terminate the script tag and inject arbitrary HTML into
 * the page — a stored-XSS vector the moment template/blog/security data
 * becomes editable. Escape both forms here so every JSON-LD callsite is
 * safe by construction.
 *
 * Usage:
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: safeJsonLd(payload) }}
 *   />
 */
export function safeJsonLd(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--");
}
