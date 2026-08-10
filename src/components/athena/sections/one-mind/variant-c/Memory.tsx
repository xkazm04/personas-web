"use client";

import { tint } from "@/lib/brand-theme";
import type { Glyph } from "./copy";

/**
 * What a conversation is holding, drawn at the size of a watermark.
 *
 * Three of these are the page's own earlier sections, seen from far enough
 * away that they are texture rather than detail — the workspace she set up
 * with you, the team she built out of one sentence, the projects she keeps in
 * view. That distance is the entire brief for this file: recognise them and
 * the closing argument lands (she was holding all of it the whole time);
 * READ them and the section has turned into a recap.
 *
 * So: no type, no colour but the page's own cyan at watermark strength, no
 * motion, and never more marks than the shape needs. The fourth glyph is the
 * ordinary texture of a thread you have been typing in, which is what makes
 * the other three read as memories rather than as decoration.
 *
 * Authored in a 40x20 box and scaled by CSS, so a card can be any size.
 */

const INK = tint("cyan", 32);
const FILL = tint("cyan", 17);

/** The workspace she set up with you — a window, a rail, a few modules. */
function Workspace() {
  return (
    <>
      <rect x="1" y="2" width="38" height="16" rx="2" />
      <path d="M11 2 V18" />
      <path d="M3.5 6 H8.5 M3.5 9.5 H8 M3.5 13 H8.5" />
      <rect x="14" y="5" width="10" height="5" rx="1" />
      <rect x="27" y="5" width="9" height="5" rx="1" />
      <rect x="14" y="12.5" width="22" height="3.5" rx="1" />
    </>
  );
}

/** The team one sentence turned into — one origin, four strands, four ends. */
function Team() {
  return (
    <>
      <circle cx="20" cy="3.5" r="1.7" fill={INK} stroke="none" />
      <path d="M20 5.2 C20 10, 6 10.5, 6 15" />
      <path d="M20 5.2 C20 10, 15 10.5, 15 15" />
      <path d="M20 5.2 C20 10, 25 10.5, 25 15" />
      <path d="M20 5.2 C20 10, 34 10.5, 34 15" />
      <rect x="3" y="15" width="6" height="3.4" rx="1" />
      <rect x="12" y="15" width="6" height="3.4" rx="1" />
      <rect x="22" y="15" width="6" height="3.4" rx="1" />
      <rect x="31" y="15" width="6" height="3.4" rx="1" />
    </>
  );
}

/** Everything you own, from the air — uneven bands, never a grid. */
function Portfolio() {
  return (
    <>
      <rect x="2" y="4" width="7" height="4.6" rx="1" />
      <rect x="12" y="2.6" width="6" height="4.6" rx="1" />
      <rect x="21" y="4.4" width="8" height="4.6" rx="1" />
      <rect x="32" y="3" width="6" height="4.6" rx="1" />
      <rect x="5" y="12.6" width="7" height="4.6" rx="1" />
      <rect x="16" y="11.8" width="8" height="4.6" rx="1" />
      <rect x="28" y="13" width="7" height="4.6" rx="1" />
    </>
  );
}

/** An ordinary thread — what you said, what she said, what you said. */
function Talk() {
  return (
    <>
      <rect x="2" y="2.5" width="22" height="4.2" rx="2.1" fill={FILL} stroke="none" />
      <rect x="14" y="8.2" width="24" height="4.2" rx="2.1" fill={FILL} stroke="none" />
      <rect x="2" y="13.9" width="16" height="4.2" rx="2.1" fill={FILL} stroke="none" />
    </>
  );
}

const GLYPHS: Record<Glyph, () => React.ReactElement> = {
  workspace: Workspace,
  team: Team,
  portfolio: Portfolio,
  talk: Talk,
};

export default function Memory({ glyph, className = "" }: { glyph: Glyph; className?: string }) {
  const Shape = GLYPHS[glyph];
  return (
    <svg
      viewBox="0 0 40 20"
      className={className}
      // Hangs off the card's left edge under its name, like a watermark on a
      // page rather than an icon centred in a tile.
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      stroke={INK}
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Shape />
    </svg>
  );
}
