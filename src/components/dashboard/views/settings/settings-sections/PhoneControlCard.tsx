"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Loader2, Smartphone } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { useControllerStore, type ControllerPhase } from "@/stores/controllerStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { parsePairFragment, type PairFragment } from "@/lib/commands/pairing";
import { newestDevice } from "@/lib/sync/reachability";

const IS_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/**
 * Take the pairing fragment off the URL at once, before anything (a
 * breadcrumb, a copied link, the next pushState) can carry the secret on.
 * Returns what it held, parsed, or null.
 */
function takePairFragment() {
  const { hash, pathname, search } = window.location;
  if (!hash.startsWith("#pair=")) return null;
  window.history.replaceState(window.history.state, "", pathname + search);
  return parsePairFragment(hash);
}

/**
 * Settings > Phone control (PHASE2-SPEC.md 3.2, 3.4). The desktop's QR opens
 * `/dashboard/settings#pair=<pairing_id>.<secret>`; this card takes the
 * fragment, pairs this browser (a new non-extractable key + an HMAC proof),
 * and then shows the phase the desktop answers with. Live plane only.
 */
export function PhoneControlCard() {
  const { t } = useTranslation();
  const copy = t.mobile.pairing;
  const { isDemo, isAuthenticated } = useAuthStore(useShallow((s) => ({ isDemo: s.isDemo, isAuthenticated: s.isAuthenticated })));
  const live = IS_SUPABASE && isAuthenticated && !isDemo;
  const { phase, error } = useControllerStore(useShallow((s) => ({ phase: s.phase, error: s.error })));
  const [noDevice, setNoDevice] = useState(false);
  // Taken once; kept here so a session that resolves after mount (live flips
  // to true and the effect re-runs) still pairs with what the URL carried.
  const fragmentRef = useRef<PairFragment | null | undefined>(undefined);

  useEffect(() => {
    // Scrub first, in every mode: a demo or signed-out visit must not keep the secret either.
    if (fragmentRef.current === undefined) fragmentRef.current = takePairFragment();
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

  return (
    <GlowCard accent={phase === "active" ? "emerald" : "cyan"} variants={fadeUp} className="p-6">
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
      {paired && (
        <button
          type="button"
          onClick={() => void useControllerStore.getState().unpair()}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          {copy.unpair}
        </button>
      )}
    </GlowCard>
  );
}
