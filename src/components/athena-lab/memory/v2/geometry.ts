/**
 * WHERE everything sits in memory lab v2 - "Say it once". Pure, in design
 * units of an aspect-locked art box (see `../shared/LabShell`).
 *
 * The messages are FLOWED, not hand-placed: each row's ask and details are
 * pills laid left to right and wrapped at the row's width, so the staircase
 * the scene argues with (three lines, then two, then one) is produced by how
 * much you had to say rather than drawn to look that way. Pill widths come
 * from the words themselves (a generous per-character estimate), so a
 * translation reflows instead of overflowing.
 */

import { CARD_ORDER, GROUPS, KEEPS, ROWS, type GroupKey, type PhraseKey } from "./data";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Pill extends Box {
  key: PhraseKey | "ask";
}

export interface RowGeo {
  label: { x: number; y: number };
  /** The word count of the message, beside or under its label. */
  count: { x: number; y: number };
  slab: Box;
  pills: Pill[];
  reply: Box;
}

export interface Geo {
  W: number;
  H: number;
  fs: { pill: number; label: number; card: number };
  rows: RowGeo[];
  avatar: { x: number; y: number; size: number };
  header: { x: number; y: number };
  groups: Record<GroupKey, { x: number; y: number }>;
  cards: Record<PhraseKey, Box>;
}

export interface Words {
  ask: string;
  brief: string;
  phrases: Record<PhraseKey, string>;
  kept: readonly string[];
}

/** Average glyph advance, as a share of the font size - generous on purpose. */
const ADVANCE = 0.5;
const PAD_X = 14;
const GAP = 10;

const textW = (s: string, fs: number) => s.length * fs * ADVANCE;

interface Params {
  W: number;
  fs: Geo["fs"];
  pillH: number;
  slabX: number;
  maxW: number;
  y0: number;
  rowGap: number;
  /** Wide: the time label sits left of its slab. Compact: above it. */
  inlineLabel: boolean;
  replyX: number;
  trayX: number;
  trayW: number;
  /** Compact flows the column under the rows; wide starts it at the top. */
  trayY: number | null;
}

function flow(keys: Pill["key"][], text: (k: Pill["key"]) => string, p: Params, top: number) {
  const pills: Pill[] = [];
  let x = 0;
  let line = 0;
  let widest = 0;
  for (const key of keys) {
    // The ask is plain text, not a pill: no padding to leave a gap behind it.
    const w = key === "ask" ? textW(text(key), p.fs.pill) * 0.96 : textW(text(key), p.fs.pill) + PAD_X * 2;
    if (x > 0 && x + GAP + w > p.maxW) {
      line += 1;
      x = 0;
    }
    const px = x === 0 ? 0 : x + GAP;
    pills.push({ key, x: p.slabX + PAD_X + px, y: top + 12 + line * (p.pillH + 8), w, h: p.pillH });
    x = px + w;
    widest = Math.max(widest, x);
  }
  const h = 24 + (line + 1) * p.pillH + line * 8;
  return { pills, slab: { x: p.slabX, y: top, w: widest + PAD_X * 2, h } };
}

function build(p: Params, words: Words): Geo {
  const rows: RowGeo[] = [];
  let y = p.y0;
  for (const row of ROWS) {
    const keys: Pill["key"][] = ["ask", ...row.phrases];
    const text = (k: Pill["key"]) => (k === "ask" ? words[row.ask] : words.phrases[k]);
    const top = p.inlineLabel ? y : y + p.fs.label * 2;
    const { pills, slab } = flow(keys, text, p, top);
    const replyY = p.inlineLabel ? slab.y + slab.h - p.pillH - 12 : y;
    const label = p.inlineLabel ? { x: 0, y: slab.y + p.pillH / 2 + 12 } : { x: p.slabX, y: y + p.fs.label * 0.8 };
    rows.push({
      label,
      count: p.inlineLabel ? { x: 0, y: label.y + p.fs.label * 1.5 } : { x: p.slabX + p.fs.label * 7.5, y: label.y },
      slab,
      pills,
      reply: { x: p.replyX, y: p.inlineLabel ? replyY : y - 4, w: 96, h: p.inlineLabel ? p.pillH : p.fs.label * 1.9 },
    });
    y = slab.y + slab.h + p.rowGap;
  }

  // The column of what she carries: her face and its name, then each group.
  const top = p.trayY ?? y;
  const size = p.fs.card * 4;
  const cardPad = 14;
  const perLine = (p.trayW - cardPad * 2) / (p.fs.card * 0.52);
  let cy = top + size + 22;
  const groups = {} as Geo["groups"];
  const cards = {} as Geo["cards"];
  for (const g of GROUPS) {
    groups[g] = { x: p.trayX, y: cy + p.fs.label * 0.7 };
    cy += p.fs.label * 1.7;
    for (const k of CARD_ORDER.filter((c) => KEEPS[c].group === g)) {
      const lines = Math.ceil(words.kept[KEEPS[k].kept].length / perLine);
      const h = cardPad * 1.6 + lines * p.fs.card * 1.35;
      cards[k] = { x: p.trayX, y: cy, w: p.trayW, h };
      cy += h + 8;
    }
    cy += 6;
  }

  return {
    W: p.W,
    H: p.trayY === null ? Math.ceil(cy + 44) : 500,
    fs: p.fs,
    rows,
    avatar: { x: p.trayX, y: top, size },
    header: { x: p.trayX + size + 16, y: top + size / 2 },
    groups,
    cards,
  };
}

export const wideGeo = (w: Words): Geo =>
  build(
    {
      W: 1200,
      fs: { pill: 19, label: 14, card: 16.5 },
      pillH: 38,
      slabX: 104,
      maxW: 600,
      y0: 28,
      rowGap: 30,
      inlineLabel: true,
      replyX: 752,
      trayX: 900,
      trayW: 296,
      trayY: 14,
    },
    w,
  );

export const compactGeo = (w: Words): Geo =>
  build(
    {
      W: 600,
      fs: { pill: 24, label: 20, card: 23 },
      pillH: 46,
      slabX: 0,
      maxW: 560,
      y0: 10,
      rowGap: 26,
      inlineLabel: false,
      replyX: 500,
      trayX: 0,
      trayW: 600,
      trayY: null,
    },
    w,
  );
