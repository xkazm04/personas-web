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
  canDecide: (review: Pick<ManualReviewItem, "personaId" | "deviceId" | "deskOnly"> | null) => boolean;
  /** Show the reachability notice: verdicts are commands here and the desktop cannot take them now. */
  blocked: boolean;
}

export interface GateInputs {
  commandPlane: boolean;
  desktopPlane: boolean;
  ready: boolean;
  tierFor: SyncReachability["tierFor"];
  personaDeviceId: (personaId: string) => string | null | undefined;
}

/**
 * The gate's decision, pure. A desk-only review (App Master packet or ask) is
 * refused on every plane before the click: the desktop would answer `desk_only`.
 */
export function canDecideReview(review: Parameters<ReviewGate["canDecide"]>[0], g: GateInputs): boolean {
  if (review?.deskOnly) return false;
  if (!g.commandPlane && !g.desktopPlane) return true;
  if (!g.ready) return false;
  const device = review ? reviewTargetDevice(review.deviceId, g.personaDeviceId(review.personaId)) : null;
  return verdictsEnabled(g.tierFor(device).tier, g.commandPlane, g.desktopPlane);
}

/**
 * Who may give a verdict right now (PLAN M20 + M7/M12, PHASE2-SPEC.md 4.3).
 * On a command plane a verdict is a `review_decide` to the desktop that raised
 * the review (else the persona's), so it is enabled only where that desktop
 * is online and this browser is paired (or in the demo). The orchestrator
 * plane writes verdicts directly and is never gated. The desktop plane cannot
 * take a verdict (`desktopUnsupported`), so it is off there in every tier.
 */
export function useReviewGate(): ReviewGate {
  const reach = useSyncReachability();
  const personasById = usePersonaStore((s) => s.personasById);
  const { commandPlane, desktopPlane, ready, tierFor } = reach;

  const canDecide = useCallback<ReviewGate["canDecide"]>(
    (review) => canDecideReview(review, { commandPlane, desktopPlane, ready, tierFor, personaDeviceId: (id) => personasById[id]?.deviceId }),
    [commandPlane, desktopPlane, ready, tierFor, personasById],
  );

  const blocked = ready && !verdictsEnabled(reach.tier, commandPlane, desktopPlane);
  return { reach, canDecide, blocked };
}
