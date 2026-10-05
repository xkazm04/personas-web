import type { DimKey } from "../shared/dims";
import { BUBBLE, CLOCK, CORE, GATE, LOOP, MAST, PIPE_Y, PLUG_HEAD, PLUGS, TANK } from "./geometry";

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
const arrowR = (x: number, y: number) => `M${x - 9} ${y - 6} L${x} ${y} L${x - 9} ${y + 6}`;

const ticks = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r0 = i % 3 === 0 ? CLOCK.r - 10 : CLOCK.r - 6;
  return `M${(CLOCK.cx + c * r0).toFixed(1)} ${(CLOCK.cy + s * r0).toFixed(1)} L${(CLOCK.cx + c * CLOCK.r).toFixed(1)} ${(CLOCK.cy + s * CLOCK.r).toFixed(1)}`;
}).join(" ");

const TB = TANK.top + TANK.h;
const L = TANK.cx - TANK.rx;

/**
 * Each dimension's part of the machine, as stroke paths (drawn on as the
 * decision is made). The first path of a part is its main outline.
 */
export const PART_PATHS: Record<DimKey, string[]> = {
  triggers: [
    circle(CLOCK.cx, CLOCK.cy, CLOCK.r),
    ticks,
    `M${CLOCK.cx} ${CLOCK.cy} V${CLOCK.cy - 28} M${CLOCK.cx} ${CLOCK.cy} L${CLOCK.cx + 20} ${CLOCK.cy + 10}`,
    `M${CLOCK.cx + CLOCK.r} ${PIPE_Y} H${CORE.x - 2} ${arrowR(CORE.x - 2, PIPE_Y)}`,
  ],
  tasks: [rrect(CORE.x, CORE.y, CORE.w, CORE.h, 14), `M${CORE.x} ${CORE.y + 30} H${CORE.x + CORE.w}`],
  apps: PLUGS.flatMap((p) => [
    `M${p.x} ${CORE.y} V${PLUG_HEAD.top + PLUG_HEAD.h}`,
    rrect(p.x - PLUG_HEAD.w / 2, PLUG_HEAD.top, PLUG_HEAD.w, PLUG_HEAD.h, 5),
    `M${p.x - 8} ${PLUG_HEAD.top} V${PLUG_HEAD.top - 10} M${p.x + 8} ${PLUG_HEAD.top} V${PLUG_HEAD.top - 10}`,
  ]),
  review: [
    `M${CORE.x + CORE.w} ${PIPE_Y} H${GATE.a - 4} ${arrowR(GATE.a - 4, PIPE_Y)}`,
    `M${GATE.a} ${GATE.top} V${GATE.bottom} M${GATE.b} ${GATE.top} V${GATE.bottom} M${GATE.a - 12} ${GATE.bottom} H${GATE.b + 12}`,
    circle((GATE.a + GATE.b) / 2, GATE.top - 2, 9),
    `M${(GATE.a + GATE.b) / 2 - 4} ${GATE.top - 2} l3 3 l6 -6`,
  ],
  messages: [
    `M${GATE.b} ${PIPE_Y} H${BUBBLE.x - 2} ${arrowR(BUBBLE.x - 2, PIPE_Y)}`,
    `${rrect(BUBBLE.x, BUBBLE.y, BUBBLE.w, BUBBLE.h, 12)} M${BUBBLE.x + 26} ${BUBBLE.y + BUBBLE.h} l-8 16 l24 -16`,
    `M${BUBBLE.x + 18} ${BUBBLE.y + 20} H${BUBBLE.x + 112} M${BUBBLE.x + 18} ${BUBBLE.y + 33} H${BUBBLE.x + 94} M${BUBBLE.x + 18} ${BUBBLE.y + 46} H${BUBBLE.x + 76}`,
  ],
  memory: [
    `M${L} ${TANK.top} a${TANK.rx} ${TANK.ry} 0 1 0 ${2 * TANK.rx} 0 a${TANK.rx} ${TANK.ry} 0 1 0 ${-2 * TANK.rx} 0 M${L} ${TANK.top} V${TB} a${TANK.rx} ${TANK.ry} 0 0 0 ${2 * TANK.rx} 0 V${TANK.top}`,
    `M${TANK.cx - 15} ${CORE.y + CORE.h} V${TANK.top - 14} m-6 -8 l6 8 l6 -8 M${TANK.cx + 15} ${TANK.top - 12} V${CORE.y + CORE.h + 2} m-6 8 l6 -8 l6 8`,
  ],
  errors: [
    `M${LOOP.cx} ${PIPE_Y} V${LOOP.cy - LOOP.r}`,
    `M${LOOP.cx - LOOP.r} ${LOOP.cy} a${LOOP.r} ${LOOP.r} 0 1 0 ${LOOP.r} ${-LOOP.r}`,
    `M${LOOP.cx - LOOP.r - 7} ${LOOP.cy - 7} L${LOOP.cx - LOOP.r} ${LOOP.cy + 2} L${LOOP.cx - LOOP.r + 8} ${LOOP.cy - 6}`,
  ],
  events: [
    `M${BUBBLE.x + BUBBLE.w} ${PIPE_Y} H${MAST.x} V${MAST.top}`,
    `M${MAST.x - 12} ${MAST.top - 12} A16 16 0 0 0 ${MAST.x - 12} ${MAST.top + 12} M${MAST.x + 12} ${MAST.top - 12} A16 16 0 0 1 ${MAST.x + 12} ${MAST.top + 12}`,
    `M${MAST.x - 22} ${MAST.top - 22} A30 30 0 0 0 ${MAST.x - 22} ${MAST.top + 22} M${MAST.x + 22} ${MAST.top - 22} A30 30 0 0 1 ${MAST.x + 22} ${MAST.top + 22}`,
  ],
};

/** A soft fill under a resolved part's main outline (closed shapes only). */
export const PART_FILL: Partial<Record<DimKey, string>> = {
  triggers: circle(CLOCK.cx, CLOCK.cy, CLOCK.r),
  tasks: rrect(CORE.x, CORE.y, CORE.w, CORE.h, 14),
  messages: rrect(BUBBLE.x, BUBBLE.y, BUBBLE.w, BUBBLE.h, 12),
  memory: `M${L} ${TANK.top} V${TB} a${TANK.rx} ${TANK.ry} 0 0 0 ${2 * TANK.rx} 0 V${TANK.top} a${TANK.rx} ${TANK.ry} 0 0 0 ${-2 * TANK.rx} 0 Z`,
};
