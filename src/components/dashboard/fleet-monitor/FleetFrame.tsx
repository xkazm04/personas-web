"use client";

import type { ReactNode } from "react";

interface FleetFrameProps {
  /** Thin status strip across the top (~44px): verdict, state mix, meters, clock. */
  top: ReactNode;
  /** The agent field. Owns all remaining space; nothing else may push it. */
  main: ReactNode;
  /** Thin right rail (~260px): the needs-you queue, then optional context. */
  rail?: ReactNode;
  /** Thin strip across the bottom (~32px): live ticker, system processes. */
  bottom?: ReactNode;
  /** Accessible name for the field. */
  label: string;
}

/**
 * The shared L0 layout of every playground prototype: the agents get the
 * whole frame and all text and stats live in thin edges around them, so the
 * three views read the same way and differ only in how they draw a fleet.
 * Deeper levels (team, agent) are free to replace `main` or overlay the frame.
 */
export default function FleetFrame({ top, main, rail, bottom, label }: FleetFrameProps) {
  return (
    <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="col-span-2 flex min-h-11 items-center gap-4 border-b border-glass px-4">{top}</div>
      <div role="group" aria-label={label} className="relative min-h-0 min-w-0">
        {main}
      </div>
      {rail ? (
        <aside className="flex min-h-0 w-[clamp(220px,18vw,300px)] flex-col border-l border-glass">{rail}</aside>
      ) : (
        <div />
      )}
      {bottom && (
        <div className="col-span-2 flex min-h-8 items-center gap-4 overflow-hidden border-t border-glass px-4">{bottom}</div>
      )}
    </div>
  );
}
