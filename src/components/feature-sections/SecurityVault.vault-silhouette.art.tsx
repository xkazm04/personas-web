"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { CloudOff, KeyRound, Lock, RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CredentialRow, ROWS, SEAL } from "./SecurityVault.vault-silhouette.row";
import { ShieldBadge, StatusChip } from "./SecurityVault.vault-silhouette.shield";

/*
 * Beats (one progress value p, 0 -> 1, played once in view):
 *   0.00-0.08  the vault card at rest: six credential rows in plaintext, locks open (amber)
 *   0.08-0.75  rows seal top to bottom: lock snaps shut (emerald), the name bar dissolves
 *              into a dot cipher, the matching segment of the shield ring lights
 *   0.75-0.83  ring complete: the shield fills and its check appears
 *   0.86-1.00  the two status chips (encrypted, local only) come up
 * Server render and reduced motion show p = 1: every row sealed, ring full.
 */

const DURATION = 5.2;

export default function VaultSilhouetteArt() {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  // The resting value is the resolved end state, so the server render shows every row sealed.
  const p = useMotionValue(1);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    controls.current?.stop();
    p.set(0);
    controls.current = animate(p, 1, { duration: DURATION, ease: "linear" });
  }, [p]);

  useEffect(() => {
    if (inView && !still) play();
  }, [inView, still, play]);

  useEffect(() => {
    if (!still) return;
    controls.current?.stop();
    p.set(1);
  }, [still, p]);

  useEffect(() => () => controls.current?.stop(), []);

  return (
    <div
      ref={ref}
      data-illustrate-art
      role="figure"
      aria-label="A vault list of six credentials whose locks close one by one, filling a shield ring, with nothing sent to a cloud."
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-glass bg-white/[0.03] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
    >
      {/* window chrome */}
      <div aria-hidden className="flex items-center gap-1.5 border-b border-glass px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      </div>
      <button
        type="button"
        onClick={play}
        disabled={still}
        aria-label="Replay the vault animation"
        className="absolute right-2 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex">
        {/* app sidebar, reduced to shape; the vault entry is the lit one */}
        <div aria-hidden className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-glass py-5 md:flex">
          {[0, 1, 2, 3, 4].map((k) =>
            k === 3 ? (
              <span
                key={k}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: tint(SEAL, 16) }}
              >
                <KeyRound className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} />
              </span>
            ) : (
              <span key={k} className="h-8 w-8 rounded-lg bg-foreground/[0.06]" />
            ),
          )}
        </div>

        <div className="grid flex-1 gap-6 p-4 sm:p-6 md:grid-cols-[1fr_240px] md:gap-8">
          {/* credential list */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: tint(SEAL, 14) }}
              >
                <KeyRound className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} />
              </span>
              <span className="text-lg font-semibold text-foreground">Vault</span>
              <span aria-hidden className="ml-auto hidden h-7 w-40 rounded-lg border border-glass bg-white/[0.02] sm:block" />
              <span aria-hidden className="h-7 w-7 rounded-lg bg-foreground/[0.08] max-sm:ml-auto" />
            </div>
            <div className="flex flex-col gap-2">
              {ROWS.map((row, i) => (
                <CredentialRow key={i} row={row} i={i} p={p} />
              ))}
            </div>
          </div>

          {/* shield badge and status */}
          <div className="flex flex-row items-center justify-center gap-5 md:flex-col md:gap-6">
            <div className="h-28 w-28 shrink-0 sm:h-36 sm:w-36 md:h-52 md:w-52">
              <ShieldBadge p={p} />
            </div>
            <div className="flex flex-col items-start gap-2 md:items-center">
              <StatusChip p={p} at={0.86} icon={Lock} label="Encrypted" />
              <StatusChip p={p} at={0.9} icon={CloudOff} label="Local only" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
