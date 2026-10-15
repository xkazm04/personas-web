import { crewPersonaId } from "@/lib/demoCrew";
import { FLEET } from "../fleet-data";
import type { BoardEvent } from "../board/model";

export type SyncedPage = "executions" | "reviews";

export const SYNCED_HREF: Record<SyncedPage, string> = {
  executions: "/dashboard/executions",
  reviews: "/dashboard/reviews",
};

/**
 * The synced page an activity row's act also shows on (demo), or null. Only a
 * crew agent's acts from this session qualify, and only the ones the bridge
 * carries to a page: a run (Executions), a review raised or decided
 * (Reviews). A stage-only agent, the seeded history and the stage's own runs
 * link nowhere: no page holds them.
 */
export function syncedPageOf(e: Pick<BoardEvent, "agentId" | "kind" | "decision" | "tsMs">): SyncedPage | null {
  if (e.tsMs < FLEET.nowMs || !crewPersonaId(e.agentId)) return null;
  const act = e.decision?.act;
  if (act === "run") return "executions";
  if (act === "approve" || act === "sendback" || e.kind === "review_requested") return "reviews";
  return null;
}
