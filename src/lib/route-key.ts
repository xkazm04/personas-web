import { scrubPii } from "@/lib/sentry-pii";

/** The route key shared by page-view and web-vital analytics. */
const UUID_SEGMENT_RE =
  /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\/|$)/g;

export function normalizePathname(pathname: string): string {
  return scrubPii(pathname.replace(UUID_SEGMENT_RE, "/:id"));
}
