import type {
  HealthActionKind,
  HealthCheckItem,
  HealthCheckSection,
} from "@/lib/mock-dashboard-data";

/**
 * In-session outcome of the System Health demo actions: which checks the
 * visitor has Configured / Installed, keyed by check id. Demo-only - nothing
 * is probed or changed on a real host; the row just settles so the click has
 * a visible effect beyond its toast.
 */
export type HealthResolutions = Readonly<Record<string, HealthActionKind>>;

/** Record `item`'s action as done. Same reference back when nothing changes. */
export function resolveHealthAction(
  state: HealthResolutions,
  item: HealthCheckItem,
): HealthResolutions {
  if (!item.action || state[item.id] === item.action) return state;
  return { ...state, [item.id]: item.action };
}

/**
 * Project the resolutions onto a health snapshot: a resolved check reads
 * `ok`, loses its action button and shows the localized "done" line. Sections
 * with nothing resolved are returned by reference; the input is never mutated.
 */
export function applyHealthResolutions(
  sections: HealthCheckSection[],
  resolutions: HealthResolutions,
  detail: Readonly<Record<HealthActionKind, string>>,
): HealthCheckSection[] {
  if (Object.keys(resolutions).length === 0) return sections;
  return sections.map((section) => {
    if (!section.items.some((item) => resolutions[item.id])) return section;
    return {
      ...section,
      items: section.items.map((item) => {
        const done = resolutions[item.id];
        if (!done) return item;
        return { ...item, status: "ok" as const, action: undefined, detail: detail[done] };
      }),
    };
  });
}
