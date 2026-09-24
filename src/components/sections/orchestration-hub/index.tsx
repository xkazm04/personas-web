"use client";

import { useEffect, useReducer, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useLoopGate } from "@/hooks/useLoopGate";
import { TRIGGERS, AUTO_CYCLE_MS } from "./data";
import { initialPlayback, nextDeadline, reducePlayback } from "./playback";
import HubRing from "./HubRing";
import TriggerDetail from "./TriggerDetail";
import PlaybackControls from "./PlaybackControls";

/**
 * Landing section — redesigned from the old single-chain "Pipelines" concept
 * into a radial hub showing all 10 real trigger types that start Personas.
 * The active trigger auto-advances, but the visitor owns playback
 * (playback.ts): selecting a trigger, stepping, or Pause is a stop that only
 * Play lifts; hover, focus, scrolling away and a hidden tab are holds that
 * lift on their own.
 */

export default function OrchestrationHub() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const { still, vetoedBy } = useLoopGate(diagramRef);
  const systemHeld = vetoedBy.includes("foreground") || vetoedBy.includes("in-view");
  // The clock is read once, in a lazy initializer - never in render.
  const [mountedAt] = useState(() => Date.now());
  const [state, dispatch] = useReducer(reducePlayback, mountedAt, (now) =>
    initialPlayback(TRIGGERS.length, { now, intervalMs: AUTO_CYCLE_MS }),
  );

  // The reduced-motion preference is only known after hydration (useStillMotion
  // answers the server snapshot first): when it arrives, it stops the hub the
  // way a visitor's Pause would, so Play can still start it deliberately.
  const [prevStill, setPrevStill] = useState(still);
  if (still !== prevStill) {
    setPrevStill(still);
    if (still) dispatch({ type: "PREFER_STILL" });
  }

  // One timer: first carry a changed system hold into the machine (it needs
  // the clock, so it is dispatched from a callback, never in render), then
  // wake at the machine's next deadline.
  useEffect(() => {
    if (systemHeld !== state.systemHeld) {
      const t = setTimeout(() => dispatch({ type: systemHeld ? "SYSTEM_HOLD" : "SYSTEM_RELEASE", now: Date.now() }), 0);
      return () => clearTimeout(t);
    }
    const due = nextDeadline(state);
    if (due === null) return;
    const t = setTimeout(() => dispatch({ type: "TICK", now: Date.now() }), Math.max(0, due - Date.now()));
    return () => clearTimeout(t);
  }, [state, systemHeld]);

  const activeTrigger = TRIGGERS[state.active] ?? TRIGGERS[0];
  const stopped = state.mode === "stopped";

  const handleSelect = (id: string) => {
    const index = TRIGGERS.findIndex((t) => t.id === id);
    if (index !== -1) dispatch({ type: "SELECT", index });
  };
  // Touch has no pointerleave after a tap; the machine's pointer hold also
  // self-expires, but only hover-capable pointers take one at all.
  const onPointer = (type: "POINTER_ENTER" | "POINTER_LEAVE") => (e: PointerEvent) => {
    if (e.pointerType !== "touch") dispatch({ type, now: Date.now() });
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) dispatch({ type: "FOCUS_OUT", now: Date.now() });
  };

  return (
    <SectionWrapper
      id="orchestration-hub"
      aria-labelledby="orchestration-hub-heading"
    >
      <SectionIntro
        id="orchestration-hub-heading"
        heading="Orchestration"
        gradient="hub"
        description="Ten trigger types, one persona hub. Any signal can wake any agent — or launch one yourself. Pick a trigger to see it fire."
      />

      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-5xl">
        <div
          className="rounded-3xl border p-6 sm:p-10 overflow-hidden"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          }}
        >
          {/* data-tour-diagram spans both the ring and the trigger detail
              panel so the tour spotlight frames the description too. */}
          <div
            ref={diagramRef}
            data-tour-diagram="orchestration"
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center"
          >
            <div>
              <div
                className="relative mx-auto w-full max-w-[560px] aspect-square"
                onPointerEnter={onPointer("POINTER_ENTER")}
                onPointerLeave={onPointer("POINTER_LEAVE")}
                onFocus={() => dispatch({ type: "FOCUS_IN", now: Date.now() })}
                onBlur={onBlur}
              >
                <HubRing active={activeTrigger.id} onSelect={handleSelect} userStopped={stopped} />
              </div>
              <PlaybackControls
                playing={!stopped}
                active={state.active}
                count={TRIGGERS.length}
                onToggle={() => dispatch(stopped ? { type: "USER_PLAY", now: Date.now() } : { type: "USER_PAUSE" })}
                onPrev={() => dispatch({ type: "PREV" })}
                onNext={() => dispatch({ type: "NEXT" })}
              />
            </div>
            <TriggerDetail activeId={activeTrigger.id} announce={stopped} />
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
