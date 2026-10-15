import type {
  HealthActionKind,
  HealthCheckItem,
  HealthCheckSection,
} from "@/lib/mock-dashboard-data";
import type { ResolvedCauses } from "@/lib/settleThread";

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
 * Adds the session's fixed incident causes to the local resolutions: a check
 * whose `causeKey` is fixed reads as done with the action that fixed it, so it
 * shows the localized "done" line the moment the fix lands. Same reference
 * back when no check on screen carries a fixed cause.
 */
export function withFixedCauses(
  sections: HealthCheckSection[],
  resolutions: HealthResolutions,
  fixed: ResolvedCauses,
): HealthResolutions {
  let next: Record<string, HealthActionKind> | null = null;
  for (const section of sections) {
    for (const item of section.items) {
      const cause = item.causeKey ? fixed[item.causeKey] : undefined;
      if (!cause || resolutions[item.id] === cause.kind) continue;
      next ??= { ...resolutions };
      next[item.id] = cause.kind;
    }
  }
  return next ?? resolutions;
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
