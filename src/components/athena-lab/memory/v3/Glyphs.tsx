"use client";

import type { MarkKey } from "./data";

/**
 * The four landmarks, drawn for this map (24-unit glyphs centred on 0,0,
 * stroked in `currentColor`): a calendar with one day ringed - when you
 * ship; a flask - where things get tried; a shield - the thing to be careful
 * with; and lines getting shorter - the short version first.
 */
export function MarkGlyph({ k }: { k: MarkKey }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (k) {
    case "ship":
      return (
        <g {...common}>
          <rect x={-9} y={-7} width={18} height={16} rx={2.5} />
          <path d="M -9 -2 H 9 M -4.5 -10 V -5 M 4.5 -10 V -5" />
          <circle cx={3.5} cy={3.5} r={2.6} fill="currentColor" stroke="none" />
        </g>
      );
    case "test":
      return (
        <g {...common}>
          <path d="M -3.5 -10 H 3.5 M -2.5 -10 V -3 L -8.5 7.5 Q -9 9.5 -7 9.5 H 7 Q 9 9.5 8.5 7.5 L 2.5 -3 V -10" />
          <path d="M -6 4 H 6" />
          <circle cx={-1.5} cy={6.6} r={1} fill="currentColor" stroke="none" />
          <circle cx={2.5} cy={5.6} r={0.8} fill="currentColor" stroke="none" />
        </g>
      );
    case "careful":
      return (
        <g {...common}>
          <path d="M 0 -10 L 8.5 -6.5 V 0 Q 8.5 7 0 10.5 Q -8.5 7 -8.5 0 V -6.5 Z" />
          <path d="M 0 -4.5 V 1.5" />
          <circle cx={0} cy={5} r={1.1} fill="currentColor" stroke="none" />
        </g>
      );
    case "length":
      return (
        <g {...common}>
          <path d="M -9 -6 H 9 M -9 -1 H 4 M -9 4 H -1 M -9 9 H -5" />
        </g>
      );
  }
}

/** Where you are, on the map: a pin. */
export function Pin() {
  return (
    <path
      d="M 0 12 C -5 5 -9 1 -9 -4 A 9 9 0 0 1 9 -4 C 9 1 5 5 0 12 Z M 0 -7.5 A 3.2 3.2 0 1 0 0.01 -7.5 Z"
      fillRule="evenodd"
      fill="currentColor"
    />
  );
}

/** Where the errand ends: a flag. */
export function Flag() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M -6 11 V -11" />
      <path d="M -6 -10 H 8 L 5 -5 L 8 0 H -6" fill="currentColor" fillOpacity={0.35} />
    </g>
  );
}
