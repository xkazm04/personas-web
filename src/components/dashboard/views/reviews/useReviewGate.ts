"use client";

import { useCallback } from "react";
import { useSyncReachability, type SyncReachability } from "@/hooks/useSyncReachability";
import { usePersonaStore } from "@/stores/personaStore";
import { reviewTargetDevice } from "@/lib/commands/reviewDecide";
import { verdictsEnabled } from "@/lib/sync/reachability";
import type { ManualReviewItem } from "@/lib/types";

export interface ReviewGate {
  reach: SyncReachability;
  /** Approve / Reject on this review (null: the bulk toolbar, judged on the newest desktop). */
  canDecide: (review: Pick<ManualReviewItem, "personaId" | "deviceId"> | null) => boolean;
  /** Show the reachability notice: verdicts are commands here and the desktop cannot take them now. */
  blocked: boolean;
}

/**
 * Who may give a verdict right now (PLAN M20 + M7/M12, PHASE2-SPEC.md 4.3).
 * On a command plane a verdict is a `review_decide` to the desktop that raised
 * the review (else the persona's), so it is enabled only where that desktop
 * is online and this browser is paired (or in the demo). The orchestrator
 * plane writes verdicts directly and is never gated.
 */
export function useReviewGate(): ReviewGate {
  const reach = useSyncReachability();
  const personasById = usePersonaStore((s) => s.personasById);
  const { commandPlane, ready, tierFor } = reach;

  const canDecide = useCallback<ReviewGate["canDecide"]>(
    (review) => {
      if (!commandPlane) return true;
      if (!ready) return false;
      const device = review ? reviewTargetDevice(review.deviceId, personasById[review.personaId]?.deviceId) : null;
      return verdictsEnabled(tierFor(device).tier, true);
    },
    [commandPlane, ready, tierFor, personasById],
  );

  const blocked = commandPlane && ready && !verdictsEnabled(reach.tier, true);
  return { reach, canDecide, blocked };
}
