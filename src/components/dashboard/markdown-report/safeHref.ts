/**
 * The link targets `MarkdownReport` will render as a link: web and mail links,
 * and same-site paths and fragments. Anything else (`javascript:`, `data:`,
 * `vbscript:`, a protocol-relative `//host`) renders as plain text. The
 * reports it draws are not all ours: synced note bodies and chat replies can
 * quote what a persona read through its connectors (mail, docs, tickets).
 */
export function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url.startsWith("#")) return url;
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
  return null;
}
