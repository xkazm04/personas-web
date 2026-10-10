/**
 * The phone -> computer hand-off, computer side. The phone landings (/m, /m2) cannot know which
 * computer their visitor owns, so they send one link for everyone; the link is marked with two
 * fixed tokens (`?via=phone&from=m|m2`, before the `#download-section` hash, so arrival still
 * scrolls there) and the computer's download section, which CAN see its own OS, resolves the
 * installer vs the waitlist itself.
 *
 * Pure. The query carries no identifier and nothing reads it but DownloadCTA's one lazy
 * initializer: no analytics, no storage, nothing sent anywhere.
 */
import type { DownloadPlan, ReleasePlatform } from "@/lib/release";

export const HANDOFF_SOURCES = ["m", "m2"] as const;
export type HandoffSource = (typeof HANDOFF_SOURCES)[number];

export interface HandoffArrival {
  /** Which phone landing sent the link; null when the token is missing or not on the allow-list. */
  from: HandoffSource | null;
}

export interface ArrivalPlan {
  action: "download" | "waitlist";
  platform: ReleasePlatform;
}

/** The query a phone landing appends to its hand-off link. */
export function handoffQuery(source: HandoffSource): string {
  return `?via=phone&from=${source}`;
}

/** A phone hand-off arrival from `location.search`, or null for every other visitor. */
export function parseHandoffArrival(search: string): HandoffArrival | null {
  const q = new URLSearchParams(search);
  if (q.get("via") !== "phone") return null;
  const from = q.get("from");
  return { from: (HANDOFF_SOURCES as readonly string[]).includes(from ?? "") ? (from as HandoffSource) : null };
}

/** What the download section should lead with for an arrival on `platform`; null = no change. */
export function arrivalPlan(arrival: HandoffArrival | null, plan: DownloadPlan, platform: ReleasePlatform): ArrivalPlan | null {
  if (!arrival) return null;
  return { action: plan.platforms[platform] === "download" ? "download" : "waitlist", platform };
}
