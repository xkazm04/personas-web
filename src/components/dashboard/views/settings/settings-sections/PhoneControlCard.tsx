"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Loader2, Smartphone } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { ArriveCell } from "./ArriveCell";
import { useAuthStore } from "@/stores/authStore";
import { replaceNeedsConfirm, useControllerStore, type ControllerPhase } from "@/stores/controllerStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { takePairFragment, type PairFragment } from "@/lib/commands/pairing";
import { newestDevice } from "@/lib/sync/reachability";
import { mobileCopy } from "@/i18n/pending/mobile";

const IS_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/**
 * Settings > Phone control (PHASE2-SPEC.md 3.2, 3.4). The desktop's QR opens
 * `/dashboard/settings#pair=<pairing_id>.<secret>`; this card takes the
 * fragment, pairs this browser (a new non-extractable key + an HMAC proof),
 * and then shows the phase the desktop answers with. Live plane only.
 */
export function PhoneControlCard({ arriveIndex }: { arriveIndex: number }) {
  const copy = mobileCopy.pairing;
  const { isDemo, isAuthenticated } = useAuthStore(useShallow((s) => ({ isDemo: s.isDemo, isAuthenticated: s.isAuthenticated })));
  const live = IS_SUPABASE && isAuthenticated && !isDemo;
  const { phase, error } = useControllerStore(useShallow((s) => ({ phase: s.phase, error: s.error })));
  const [noDevice, setNoDevice] = useState(false);
  // A fragment held back while the user decides whether to replace the current pairing.
  const [kept, setKept] = useState<{ fragment: PairFragment; deviceId: string } | null>(null);
  // Taken once; kept here so a session that resolves after mount (live flips
  // to true and the effect re-runs) still pairs with what the URL carried.
  const fragmentRef = useRef<PairFragment | null | undefined>(undefined);

  useEffect(() => {
    // Scrub first, in every mode: a demo or signed-out visit must not keep the secret either.
    if (fragmentRef.current === undefined) fragmentRef.current = takePairFragment(window.location, window.history);
    const fragment = fragmentRef.current;
    if (!live) return;
    let cancelled = false;
    void (async () => {
      await useDeviceStore.getState().fetchDevices();
      if (cancelled) return;
      if (!fragment) {
        if (useControllerStore.getState().phase === "unknown") await useControllerStore.getState().load();
        return;
      }
      // The QR names no device: the desktop showing it is the one that synced last.
      const device = newestDevice(useDeviceStore.getState().devices);
      if (!device) {
        setNoDevice(true);
        return;
      }
      fragmentRef.current = null; // one pairing per QR scan
      // The shared load promise answers even when another component started the read.
      const before = useControllerStore.getState().phase;
      if (before === "unknown" || before === "loading") await useControllerStore.getState().load();
      if (cancelled) return;
      if (replaceNeedsConfirm(useControllerStore.getState().phase)) {
        setKept({ fragment, deviceId: device.deviceId });
        return;
      }
      await useControllerStore.getState().pair(fragment, device.deviceId);
    })();
    return () => {
      cancelled = true;
    };
  }, [live]);

  if (!live) return null;

  const status: Partial<Record<ControllerPhase, string>> = {
    pairing: copy.pairing,
    pending: copy.pending,
    active: copy.active,
    refused: copy.refused,
    revoked: copy.revoked,
    unsupported: copy.unsupported,
    error: copy.error.replace("{reason}", error ?? ""),
  };
  const busy = phase === "pairing" || phase === "loading" || phase === "unknown";
  const paired = phase === "active" || phase === "pending";

  const buttonClass =
    "inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan";
  const answer = (replace: boolean) => {
    const held = kept;
    setKept(null);
    if (replace && held) void useControllerStore.getState().pair(held.fragment, held.deviceId);
  };

  return (
    <ArriveCell index={arriveIndex}>
      <GlowCard accent={phase === "active" ? "emerald" : "cyan"} className="flex-1 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Smartphone aria-hidden className="h-4 w-4 text-brand-cyan" />
          <h2 className="text-base font-semibold text-foreground">{copy.title}</h2>
        </div>
        <p className="text-sm text-muted">{copy.body}</p>
        <p aria-live="polite" className="mt-3 flex items-center gap-2 text-sm text-foreground">
          {busy && <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />}
          {noDevice ? copy.noDevice : status[phase] ?? ""}
        </p>
        {!paired && !busy && <p className="mt-2 text-sm text-muted-dark">{copy.howTo}</p>}
        {kept && (
          <div className="mt-4">
            <p className="text-sm text-foreground">{copy.replaceConfirm}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => answer(true)} className={buttonClass}>
                {copy.replaceYes}
              </button>
              <button type="button" onClick={() => answer(false)} className={buttonClass}>
                {copy.replaceNo}
              </button>
            </div>
          </div>
        )}
        {paired && !kept && (
          <button type="button" onClick={() => void useControllerStore.getState().unpair()} className={`mt-4 ${buttonClass}`}>
            {copy.unpair}
          </button>
        )}
      </GlowCard>
    </ArriveCell>
  );
}
