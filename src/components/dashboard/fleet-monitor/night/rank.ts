import { needsYou, topSeverity, type FleetAgent } from "../fleet-data";

/** Lower is more urgent: failed, waiting, critical review, draft, warning, info. */
export function rankOf(a: FleetAgent): number {
  const sev = topSeverity(a);
  if (a.state === "failed") return 0;
  if (a.state === "input_required") return 1;
  if (sev === "critical") return 2;
  if (a.state === "draft_ready") return 3;
  if (sev === "warning") return 4;
  if (sev === "info") return 5;
  return 9;
}

const oldestReview = (a: FleetAgent) => a.reviews.reduce((m, r) => Math.max(m, r.ageMin), 0);

/** Everyone who needs you, most urgent first; ties go to the oldest review. */
export function ranked<T extends FleetAgent>(agents: T[]): T[] {
  return agents
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => needsYou(a))
    .sort((x, y) => rankOf(x.a) - rankOf(y.a) || oldestReview(y.a) - oldestReview(x.a) || x.i - y.i)
    .map(({ a }) => a);
}
