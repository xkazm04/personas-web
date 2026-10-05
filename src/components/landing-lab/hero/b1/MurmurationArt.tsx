"use client";

import { useMemo, useRef, type PointerEvent } from "react";
import { Zap, FastForward } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useSwarm } from "./useSwarm";

/**
 * The swarm layer: a full-bleed canvas of AI agents in teams. The visitor's
 * pointer draws agents in, a press drops "your event" where it lands, and a
 * real button sends one from the keyboard. Motion gating lives in useSwarm.
 */
export default function MurmurationArt() {
  const { t } = useTranslation();
  const copy = t.landingLab.heroB.b1;
  const still = useStillMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labels = useMemo(
    () => ({ events: copy.events, handled: copy.handled, yourEvent: copy.yourEvent }),
    [copy],
  );
  const { introOn, skip, send, point } = useSwarm(wrapRef, canvasRef, labels);

  const local = (e: PointerEvent<HTMLDivElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  return (
    <>
      <div
        ref={wrapRef}
        role="img"
        aria-label={copy.aria}
        className="absolute inset-0 cursor-crosshair touch-pan-y"
        onPointerMove={still ? undefined : (e) => point(local(e))}
        onPointerLeave={() => point(null)}
        onPointerDown={(e) => send(local(e))}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-end gap-3 px-6 pb-6 sm:px-10 stage:pb-[4svh]">
        {introOn && (
          <button
            type="button"
            onClick={skip}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-glass-hover bg-background/70 px-4 py-2 font-mono text-sm uppercase tracking-wider text-muted-dark backdrop-blur-md transition-colors hover:text-foreground focus-ring"
          >
            <FastForward className="h-4 w-4" aria-hidden="true" />
            {copy.skipIntro}
          </button>
        )}
        <button
          type="button"
          onClick={() => send()}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-brand-cyan/50 bg-background/70 px-4 py-2 font-mono text-sm uppercase tracking-wider text-brand-cyan backdrop-blur-md transition-colors hover:border-brand-cyan hover:bg-brand-cyan/10 focus-ring"
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          {copy.sendEvent}
        </button>
      </div>
    </>
  );
}
