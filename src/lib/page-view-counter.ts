/**
 * When a page view is counted.
 *
 * A route change counts once per normalized route (re-renders and query-only
 * changes do not re-count). A return through Back/Forward that the browser
 * serves from its back/forward cache counts too: the page resumes whole, no
 * effect re-runs and the pathname does not change, so without this the
 * load-time count never fires and every such return is missing from the
 * metric. Every public route is eligible for that restoration (measured
 * 2026-10-31: 12 of 12 public routes and the demo dashboard restored on Back
 * from another site in Chrome 156), so this is not an edge case.
 *
 * The first `pageshow` of a fresh load has `persisted: false` and is already
 * counted by the route, so only a restored show counts.
 */
export interface PageViewCounter {
  /** The current pathname, already normalized. Counts when it changed. */
  route(normalized: string): void;
  /** A `pageshow` event. Counts the current route again when the page was restored. */
  pageShow(event: { persisted?: boolean }): void;
}

export function createPageViewCounter(track: (page: string) => void): PageViewCounter {
  let current: string | null = null;
  return {
    route(normalized) {
      if (normalized === current) return;
      current = normalized;
      track(normalized);
    },
    pageShow(event) {
      if (event.persisted && current !== null) track(current);
    },
  };
}
