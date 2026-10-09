import { create } from "zustand";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import type { PairFragment } from "@/lib/commands/pairing";

/**
 * Is this browser a paired controller (PHASE2-SPEC.md 3.2-3.4)? The key lives
 * in IndexedDB behind `lib/commands/signer`; this store holds only what the UI
 * needs: the phase and the controller id. The desktop's local trust list is
 * the authority; `command_controllers.status` is its answer, read once and
 * then followed over Realtime. All crypto loads lazily, on the live plane only.
 */
export type ControllerPhase =
  | "unknown"
  | "loading"
  | "none"
  | "pairing"
  | "pending"
  | "active"
  | "refused"
  | "revoked"
  | "unsupported"
  | "error";

interface ControllerState {
  phase: ControllerPhase;
  controllerId: string | null;
  error: string | null;
  load: () => Promise<void>;
  pair: (fragment: PairFragment, deviceId: string) => Promise<void>;
  unpair: () => Promise<void>;
  /** A Realtime change on `command_controllers`. */
  applyRow: (row: Record<string, unknown> | null | undefined) => void;
  reset: () => void;
}

const plane = () => import("@/lib/commands/controllerPlane");

function phaseOf(row: { status: string; revoke_requested_at?: unknown } | null): ControllerPhase {
  if (!row) return "revoked";
  if (row.revoke_requested_at) return "revoked";
  return row.status === "active" || row.status === "pending" || row.status === "refused" || row.status === "revoked"
    ? row.status
    : "error";
}

/** One read at a time: a load() made during a load shares its promise. */
let inflightLoad: Promise<void> | null = null;

/** Would pairing now replace a pairing worth keeping? Only phases with none to lose say no. */
export function replaceNeedsConfirm(phase: ControllerPhase): boolean {
  return !(phase === "none" || phase === "revoked" || phase === "refused" || phase === "unsupported");
}

export const useControllerStore =create<ControllerState>((set, get) => ({
  phase: "unknown",
  controllerId: null,
  error: null,
  load: () => {
    if (inflightLoad) return inflightLoad;
    if (get().phase === "pairing") return Promise.resolve();
    set({ phase: "loading", error: null });
    inflightLoad = (async () => {
      try {
        const p = await plane();
        const identity = await p.loadController();
        if (!identity) {
          set({ phase: (await p.signingSupported()) ? "none" : "unsupported", controllerId: null });
          return;
        }
        const row = await p.fetchControllerRow(identity.controllerId);
        set({ phase: phaseOf(row), controllerId: identity.controllerId });
      } catch (err) {
        captureExceptionScrubbed(err, { tags: { scope: "controllerLoad" } });
        set({ phase: "error", error: err instanceof Error ? err.message : String(err) });
      } finally {
        inflightLoad = null;
      }
    })();
    return inflightLoad;
  },
  pair: async (fragment, deviceId) => {
    set({ phase: "pairing", error: null });
    try {
      const p = await plane();
      if (!(await p.signingSupported())) {
        set({ phase: "unsupported" });
        return;
      }
      const identity = await p.pairController(fragment, deviceId, navigator.userAgent, new Date().toISOString());
      set({ phase: "pending", controllerId: identity.controllerId });
    } catch (err) {
      captureExceptionScrubbed(err, { tags: { scope: "controllerPair" } });
      set({ phase: "error", error: err instanceof Error ? err.message : String(err) });
    }
  },
  unpair: async () => {
    try {
      const p = await plane();
      await p.unpairController(new Date().toISOString());
      set({ phase: "none", controllerId: null, error: null });
    } catch (err) {
      captureExceptionScrubbed(err, { tags: { scope: "controllerUnpair" } });
      set({ phase: "error", error: err instanceof Error ? err.message : String(err) });
    }
  },
  applyRow: (row) => {
    if (!row || row.controller_id !== get().controllerId || typeof row.status !== "string") return;
    set({ phase: phaseOf(row as { status: string; revoke_requested_at?: unknown }) });
  },
  reset: () => set({ phase: "unknown", controllerId: null, error: null }),
}));
