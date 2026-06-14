"use client";

import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { NW, NH, type FlowNodeDef } from "./data";

export type NodeState = "done" | "active" | "pending";

/**
 * A single React-Flow-style persona node, drawn as an HTML card inside an SVG
 * foreignObject so it shares the canvas coordinate space with the wires.
 * State is computed by the parent from the run cascade; "active" pulses (the
 * parent only assigns it when motion is allowed).
 */
export default function FlowNode({ node, state }: { node: FlowNodeDef; state: NodeState }) {
  const Icon = node.icon;
  const accent = BRAND_VAR[node.brand];
  const lit = state !== "pending";

  return (
    <foreignObject
      x={node.x - NW / 2}
      y={node.y - NH / 2}
      width={NW}
      height={NH}
      style={{ overflow: "visible" }}
    >
      <div
        className={`flex h-full w-full items-center gap-2.5 rounded-xl border px-3 transition-all duration-500 ${
          lit ? "" : "border-glass opacity-50"
        } ${state === "active" ? "animate-pulse" : ""}`}
        style={{
          borderColor: lit ? accent : undefined,
          backgroundColor: "rgba(var(--surface-overlay), 0.05)",
          boxShadow: lit ? brandShadow(node.brand, 16, state === "active" ? 30 : 14) : undefined,
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: tint(node.brand, 14), color: accent }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
            {node.label}
          </span>
          <span className="block truncate text-[11px] leading-tight text-muted">{node.sub}</span>
        </span>
      </div>
    </foreignObject>
  );
}
