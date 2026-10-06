"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NARROW_QUERY, STAGE_QUERY, useMedia } from "./useMedia";

/** A composition's authored size, in CSS px at scale 1. */
export interface Design {
  w: number;
  h: number;
}

/** Below the stage the scene flows at its own height; past this it would
 *  turn into a poster on a tablet. */
const FLOW_MAX = 1.3;

/**
 * The stage slot, and the one scaled box every fleet-lab scene is drawn in.
 *
 * Each scene is authored ONCE at a fixed design size - cards, type and the SVG
 * threads in one pixel space - and this box zooms that whole composition to
 * the room the stage leaves under the intro. `zoom` (not a transform) so type
 * is re-rasterised crisp and the scaled size is what layout reserves. That is
 * what lets the art grow on a 2560 screen instead of floating small, and why a
 * thread can never miss the card it feeds: nothing reflows between sizes.
 *
 * The wide design is sized so its scale is ~1 at the smallest stage
 * (1366x657), which keeps reading type on the floor; narrow viewports switch
 * to the compact design rather than shrinking the wide one.
 */
export default function FitBox({
  wide,
  compact,
  label,
  children,
}: {
  wide: Design;
  compact: Design;
  label: string;
  children: (narrow: boolean) => ReactNode;
}) {
  const stage = useMedia(STAGE_QUERY);
  const narrow = useMedia(NARROW_QUERY);
  const d = narrow ? compact : wide;
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale =
    box.w === 0 ? 0 : stage ? Math.min(box.w / d.w, box.h / d.h) : Math.min(box.w / d.w, FLOW_MAX);

  return (
    <div
      ref={ref}
      data-stage-slot
      className="relative flex w-full items-center justify-center"
      style={stage ? undefined : { height: scale ? d.h * scale : d.h }}
    >
      <div
        role="img"
        aria-label={label}
        className="relative shrink-0"
        style={{ width: d.w, height: d.h, zoom: scale || 1, visibility: scale ? undefined : "hidden" }}
      >
        {children(narrow)}
      </div>
    </div>
  );
}
