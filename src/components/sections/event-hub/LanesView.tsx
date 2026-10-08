"use client";

import { motion } from "framer-motion";
import type { QueueRouteMetric } from "@/lib/event-bus-demo";
import { TOOL_MAP } from "@/lib/tool-catalogue";
import { loopTransition } from "@/lib/motion/loop-gate";
import ToolMark from "./shared/ToolMark";
import { ink, laneFigures } from "./telemetry";
import { howSectionsCopy } from "@/i18n/pending/howSections";

function Endpoint({ id, align }: { id: string; align: "start" | "end" }) {
  const tool = TOOL_MAP.get(id)!;
  return (
    <div className={`flex items-center gap-[0.8cqw] ${align === "end" ? "flex-row-reverse text-right" : ""}`}>
      <span
        className="flex aspect-square w-[3.6cqw] min-w-9 items-center justify-center rounded-full border"
        style={{
          borderColor: `color-mix(in srgb, ${ink(tool.color)} 55%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${ink(tool.color)} 14%, var(--background))`,
        }}
      >
        <ToolMark id={id} className="h-1/2 w-1/2" />
      </span>
      <span className="font-mono text-[clamp(13px,1.2cqw,22px)] text-foreground">{tool.name}</span>
    </div>
  );
}

/**
 * Performance view: one lane per route. The pipe's fill is the backlog, the
 * packets are deliveries passing through the hub's node in the middle, and
 * the live figures sit at the end of each lane.
 */
export default function LanesView({ routes, run }: { routes: QueueRouteMetric[]; run: boolean }) {
  const copy = howSectionsCopy.events.v1;
  return (
    <div className="mx-auto flex h-full w-full max-w-[min(100%,calc(100cqh*2.6))] flex-col justify-center gap-[2.4cqh] [container-type:inline-size]">
      {routes.map((r, i) => {
        const fig = laneFigures(r);
        const color = ink(r.color, 75);
        return (
          <div
            key={r.id}
            className="grid grid-cols-[minmax(0,10fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,14fr)] items-center gap-[1.6cqw] rounded-2xl border border-glass bg-surface/40 px-[1.6cqw] py-[1.1cqw]"
          >
            <Endpoint id={r.producerId} align="start" />
            <div className="relative h-[1.5cqw] min-h-3 overflow-hidden rounded-full border border-glass-hover bg-background/60">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), color-mix(in srgb, var(--brand-cyan) 55%, transparent))` }}
                initial={false}
                animate={{ width: `${fig.fillPct}%` }}
                transition={{ duration: run ? 0.6 : 0, ease: "easeOut" }}
              />
              <span className="absolute left-1/2 top-1/2 h-[180%] w-[180%] max-w-[1.6cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-cyan bg-background" />
              {[0, 1].map((k) => (
                <motion.span
                  key={k}
                  className="absolute top-1/2 aspect-square h-[70%] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 1cqw ${color}` }}
                  initial={{ left: "2%" }}
                  animate={{ left: run ? ["2%", "96%"] : `${30 + k * 40}%` }}
                  transition={loopTransition(run, { duration: 2.6 + i * 0.35, delay: k * 1.4, ease: "linear" })}
                />
              ))}
            </div>
            <Endpoint id={r.consumerId} align="end" />
            <dl className="grid grid-cols-3 gap-[0.8cqw] font-mono">
              {[
                [fig.eps, copy.perSecond],
                [fig.depth, copy.backlog],
                [`${fig.deliveryMs} ms`, copy.delivery],
              ].map(([value, label]) => (
                <div key={String(label)} className="flex flex-col-reverse items-start">
                  <dt className="text-[clamp(12px,0.95cqw,17px)] uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="text-[clamp(16px,1.9cqw,34px)] font-semibold tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
