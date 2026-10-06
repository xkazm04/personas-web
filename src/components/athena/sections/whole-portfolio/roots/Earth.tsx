"use client";

import { tint } from "@/lib/brand-theme";

/**
 * The sky, the soil and the lit horizon, painted across the WHOLE slot behind
 * the garden. The garden itself is a fixed-aspect box centred in the slot;
 * on a tall stage (a 1440p monitor) or a narrow one (a phone) that box leaves
 * bands above, below or beside it, and a garden floating in a void reads as a
 * card. So the world is continuous: the ground line sits wherever the box's
 * ground is (`--g`, computed from the box's height the same way the stage
 * sizes it), and sky and soil run out to every edge.
 *
 * Every colour is a brand tint over the page background: night in the dark
 * themes, a pale cut-away in the light ones.
 */

/** Ground line within the art box: 320 / 720 of its height. */
const G = 320 / 720;

export default function Earth() {
  // The art box is centred and (sm+) as tall as min(slot, width / aspect);
  // phones pin it at 60rem wide, so 27rem tall.
  const lift = (0.5 - G).toFixed(4);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl [--art-h:27rem] sm:[--art-h:min(100cqh,100cqw/2.2222)]"
      style={{ ["--g" as string]: `calc(50% - ${lift} * var(--art-h))` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${tint("purple", 11)} 0%, ${tint("cyan", 7)} var(--g), ${tint("cyan", 8)} var(--g), ${tint("purple", 5)} 100%)`,
        }}
      />
      {/* Grain in the soil */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: "var(--g)",
          backgroundImage: `radial-gradient(${tint("cyan", 14)} 1.2px, transparent 1.4px)`,
          backgroundSize: "22px 22px",
        }}
      />
      {/* The lit horizon */}
      <div
        className="absolute inset-x-0 h-12 -translate-y-full"
        style={{ top: "var(--g)", background: `linear-gradient(to bottom, transparent, ${tint("cyan", 16)})` }}
      />
      <div className="absolute inset-x-0 h-0.5 -translate-y-1/2" style={{ top: "var(--g)", backgroundColor: tint("cyan", 55) }} />
    </div>
  );
}
