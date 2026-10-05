import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import { BEATS } from "../shared/useMindRun";
import type { MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, BEAT_ICON, TOOL_BRAND } from "../shared/beats";

/** A flowchart node placed in percent space (0-100 on both axes of the pane). */
export interface GNode {
  id: string;
  beat: number;
  label: string;
  icon: LucideIcon;
  brand: BrandKey;
  x: number;
  y: number;
}

export interface GEdge {
  from: GNode;
  to: GNode;
}

const rowY = (row: number) => 6 + row * 17.6;

/** The live flowchart's shape: a spine of five beats with the tools fanned out on row three. */
export function graphNodes(run: MindRun): GNode[] {
  const { copy, example } = run;
  const spine = (beat: number, row: number): GNode => {
    const id = BEATS[beat] as Exclude<(typeof BEATS)[number], "tools">;
    return { id, beat, label: copy.nodes[id], icon: BEAT_ICON[id], brand: BEAT_BRAND[id], x: 50, y: rowY(row) };
  };
  const n = example.tools.length;
  const spread = n === 3 ? 33 : 36;
  const tools = example.tools.map<GNode>((tool, i) => ({
    id: `tool-${i}`,
    beat: 2,
    label: tool.label,
    icon: tool.icon,
    brand: TOOL_BRAND[i % TOOL_BRAND.length],
    x: 50 + (i - (n - 1) / 2) * spread,
    y: rowY(2),
  }));
  return [spine(0, 0), spine(1, 1), ...tools, spine(3, 3), spine(4, 4), spine(5, 5)];
}

export function graphEdges(nodes: GNode[]): GEdge[] {
  const byBeat = (b: number) => nodes.filter((n) => n.beat === b);
  const edges: GEdge[] = [];
  for (let b = 0; b < 5; b++) {
    for (const from of byBeat(b)) for (const to of byBeat(b + 1)) edges.push({ from, to });
  }
  return edges;
}

/** Cubic from centre to centre, vertical tangents (the live ConnectionLine). */
export function curve(a: GNode, b: GNode): string {
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
}

/** Points along `curve`, for a light packet riding the edge (percent space). */
export function samples(a: GNode, b: GNode, count = 10): { left: string[]; top: string[] } {
  const my = (a.y + b.y) / 2;
  const left: string[] = [];
  const top: string[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const u = 1 - t;
    const x = u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x;
    const y = u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y;
    left.push(`${x}%`);
    top.push(`${y}%`);
  }
  return { left, top };
}
