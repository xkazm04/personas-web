import type { FleetAgent } from "../fleet-data";
import { DW, type CityLayout, type WinBox } from "./city-layout";
import { reasonShort, type CityCopy } from "./vocab";

export const TAG_H = 28;
const STEP = 33;
/** Highest a tag may sit (design units); the frame's own controls live above. */
const SKY_TOP = 12;

/* Type sizes in DESIGN units. The stage scales down to ~0.78 on a 1280-wide
   viewport, so labels are >= 16 and reading text >= 21 to stay >= 12 / 16 px. */
export const LABEL = 16;
export const READING = 21;

export interface Rect { x: number; y: number; w: number; h: number }

export interface Lantern {
  a: FleetAgent;
  wv: WinBox;
  x: number;
  y: number;
  w: number;
  /** Compact tags show the callsign and a reason-coloured lantern only. */
  compact: boolean;
  text: string;
  color: string;
  key: string;
}

/** Tag width from its text: mono callsign, reason label, padding and lantern. */
const fullWidth = (callsign: string, reason: string) => Math.round(callsign.length * 10 + reason.length * 8.2 + 48);
const compactWidth = (callsign: string) => Math.round(callsign.length * 10 + 36);

/**
 * The sky's fixed occupants, estimated from their text in the same design
 * units the tags are placed in: the summary block top-left, the moon with its
 * labels top-right, and the frame's controls above it.
 */
export function skyObstacles(headline: string, sub: string, moonLines: string[]): Rect[] {
  const headW = 110 + headline.length * 23;
  const subW = sub.length * READING * 0.5;
  const summary = { x: 30, y: 62, w: Math.max(headW, subW) + 30, h: 160 };
  // Titles are READING-sized, verdict lines LABEL-sized (alternating).
  const labelW = Math.max(...moonLines.map((l, i) => l.length * (i % 2 ? LABEL * 0.53 : READING * 0.5)));
  const moonLeft = DW - 180 - labelW - 16;
  const moon = { x: moonLeft, y: 62, w: DW - moonLeft, h: 160 };
  const controls = { x: DW - 440, y: 0, w: 440, h: 58 };
  return [summary, moon, controls];
}

/** An agent that needs you but found no room for a tag: its window glows. */
export interface Halo { id: string; wv: WinBox; color: string }

/**
 * Places one lantern tag per agent that needs you, in urgency order: the most
 * urgent get full tags in the slots nearest their own roof. Each tag stays
 * clear of the sky's occupants, every roof and every tag placed before it.
 * When the sky runs out, a tag shrinks to its callsign, then may borrow a
 * neighbouring column; if even that fails, the agent keeps its beam and window
 * glow with no tag (it is still counted, and `N` still reaches it) — tags
 * never overlap. Pure, so it runs in render with no DOM measuring.
 */
export function placeLanterns(L: CityLayout, rankedAgents: FleetAgent[], copy: CityCopy, obstacles: Rect[]): { tags: Lantern[]; halos: Halo[] } {
  const placed: Rect[] = [...obstacles];
  for (const b of L.teams) placed.push({ x: b.cx - b.w / 2 - 8, y: b.anchor - 4, w: b.w + 16, h: b.top - b.anchor + 4 });
  const hit = (r: Rect) => placed.some((p) => r.x < p.x + p.w + 6 && r.x + r.w + 6 > p.x && r.y < p.y + p.h + 4 && r.y + r.h + 4 > p.y);
  const clampX = (x: number, w: number) => Math.max(26, Math.min(DW - 26 - w, x));

  const search = (wv: WinBox, w: number, centres: number[]): Rect | null => {
    for (const cx of centres) {
      const xs = [cx - w / 2, cx - 14, cx - w + 14].map((x) => clampX(x, w));
      for (let y = wv.b.anchor - 16 - TAG_H; y >= SKY_TOP; y -= STEP) {
        for (const x of xs) {
          const r = { x, y, w, h: TAG_H };
          if (!hit(r)) return r;
        }
      }
    }
    return null;
  };

  const out: Lantern[] = [];
  const halos: Halo[] = [];
  for (const a of rankedAgents) {
    const wv = L.win.get(a.id);
    if (!wv) continue;
    const reason = reasonShort(copy, a);
    const bx = wv.x + wv.w / 2;
    const near = [bx];
    const wide = [bx, bx - L.pitch, bx + L.pitch, bx - 2 * L.pitch, bx + 2 * L.pitch];
    let compact = false;
    let best = search(wv, fullWidth(a.callsign, reason.text), near);
    if (!best) {
      compact = true;
      best = search(wv, compactWidth(a.callsign), wide);
    }
    if (!best) {
      halos.push({ id: a.id, wv, color: reason.color });
      continue;
    }
    placed.push(best);
    out.push({ a, wv, x: Math.round(best.x), y: Math.round(best.y), w: best.w, compact, text: reason.text, color: reason.color, key: reason.key });
  }
  return { tags: out, halos };
}
