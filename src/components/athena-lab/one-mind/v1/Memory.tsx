"use client";

import type { ReactElement } from "react";
import { tint } from "@/lib/brand-theme";
import type { Glyph } from "./copy";

/**
 * What a conversation is holding, drawn at the size of a watermark.
 *
 * Three are the page's own earlier sections seen from far enough away to be
 * texture (the team, the portfolio, the workspace); `talk` is a typed thread
 * and `voice` a spoken one - the bars of a voice note rather than of text.
 * No type, no colour but the page's cyan, no motion. Authored in a 40x20 box.
 */

const INK = tint("cyan", 34);
const FILL = tint("cyan", 18);

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

function Talk() {
  return (
    <>
      <rect x="2" y="2.5" width="22" height="4.2" rx="2.1" fill={FILL} stroke="none" />
      <rect x="14" y="8.2" width="24" height="4.2" rx="2.1" fill={FILL} stroke="none" />
      <rect x="2" y="13.9" width="16" height="4.2" rx="2.1" fill={FILL} stroke="none" />
    </>
  );
}

/** A voice note: bars of uneven height, authored, never rolled. */
const VOICE = [3, 6, 10, 7, 13, 9, 15, 11, 7, 12, 8, 5, 9, 4, 6, 3];

function Voice() {
  return (
    <>
      {VOICE.map((h, i) => (
        <rect
          key={i}
          x={2 + i * 2.3}
          y={10 - h / 2}
          width="1.2"
          height={h}
          rx="0.6"
          fill={INK}
          stroke="none"
        />
      ))}
    </>
  );
}

const SHAPES: Record<Glyph, () => ReactElement> = {
  workspace: Workspace,
  team: Team,
  portfolio: Portfolio,
  talk: Talk,
  voice: Voice,
};

export default function Memory({ glyph, className = "" }: { glyph: Glyph; className?: string }) {
  const Shape = SHAPES[glyph];
  return (
    <svg
      viewBox="0 0 40 20"
      className={className}
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
