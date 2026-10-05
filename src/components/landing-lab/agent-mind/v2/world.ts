import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, BEAT_ICON, TOOL_BRAND } from "../shared/beats";

/**
 * The live flowchart laid on its side as a dolly track the camera travels:
 * parse -> select -> tools (stacked) -> execute -> verify -> result, in world
 * pixels. The camera frames one beat at a time; the overview frames them all.
 */
export const WORLD = { w: 1380, h: 560 };
const COL = [120, 350, 610, 870, 1080, 1270];
const MID = 260;
const TOOL_GAP = 150;

export interface WNode {
  id: string;
  beat: number;
  label: string;
  icon: LucideIcon;
  brand: BrandKey;
  x: number;
  y: number;
}

export function worldNodes(run: MindRun): WNode[] {
  const { copy, example } = run;
  const spine = (beat: number): WNode => {
    const id = BEATS[beat] as Exclude<(typeof BEATS)[number], "tools">;
    return { id, beat, label: copy.nodes[id], icon: BEAT_ICON[id], brand: BEAT_BRAND[id], x: COL[beat], y: MID };
  };
  const n = example.tools.length;
  const tools = example.tools.map<WNode>((t, i) => ({
    id: `tool-${i}`,
    beat: 2,
    label: t.label,
    icon: t.icon,
    brand: TOOL_BRAND[i % TOOL_BRAND.length],
    x: COL[2],
    y: MID + (i - (n - 1) / 2) * TOOL_GAP,
  }));
  return [spine(0), spine(1), ...tools, spine(3), spine(4), spine(5)];
}

export function worldEdges(nodes: WNode[]): [WNode, WNode][] {
  const out: [WNode, WNode][] = [];
  for (let b = 0; b < 5; b++) {
    for (const a of nodes.filter((n) => n.beat === b))
      for (const c of nodes.filter((n) => n.beat === b + 1)) out.push([a, c]);
  }
  return out;
}

/** Horizontal cubic between two disc centres. */
export function edgePath(a: WNode, b: WNode): string {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

export function edgePoints(a: WNode, b: WNode, count = 12): { cx: number[]; cy: number[] } {
  const mx = (a.x + b.x) / 2;
  const cx: number[] = [];
  const cy: number[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const u = 1 - t;
    cx.push(u * u * u * a.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * b.x);
    cy.push(u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y);
  }
  return { cx, cy };
}

export interface Camera { x: number; y: number; scale: number }

/**
 * Where the camera sits for a stage of `w` x `h` (the part above the
 * subtitles): the overview frames the whole track; a beat is framed close,
 * centred, with its neighbours in the wings.
 */
export function cameraFor(run: MindRun, nodes: WNode[], w: number, h: number): Camera {
  if (w === 0 || nodes.length === 0) return { scale: 0.001, x: w / 2, y: h / 2 };
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const box = { x0: Math.min(...xs) - 115, x1: Math.max(...xs) + 115, y0: Math.min(...ys) - 50, y1: Math.max(...ys) + 85 };
  const fit = Math.min(1, w / (box.x1 - box.x0), h / (box.y1 - box.y0));
  if (run.phase !== "running") {
    return { scale: fit, x: w / 2 - ((box.x0 + box.x1) / 2) * fit, y: h / 2 - ((box.y0 + box.y1) / 2) * fit };
  }
  const focus = nodes.filter((n) => n.beat === run.focus);
  const cx = focus.reduce((s, n) => s + n.x, 0) / focus.length;
  const cy = focus.reduce((s, n) => s + n.y, 0) / focus.length + 20;
  const span = focus.length > 1 ? (focus.length - 1) * TOOL_GAP + 200 : 260;
  const scale = Math.min(1.2, Math.max(fit * 1.5, Math.min(w / 620, (h * 0.9) / span)));
  return { scale, x: w / 2 - cx * scale, y: h / 2 - cy * scale };
}
