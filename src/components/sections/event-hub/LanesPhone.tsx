"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { QueueRouteMetric } from "@/lib/event-bus-demo";
import { TOOL_MAP } from "@/lib/tool-catalogue";
import { loopTransition } from "@/lib/motion/loop-gate";
import ToolMark from "./shared/ToolMark";
import { ink, laneFigures } from "./telemetry";
import { howSectionsCopy } from "@/i18n/pending/howSections";

function End({ id }: { id: string }) {
  const tool = TOOL_MAP.get(id)!;
  return (
    <span className="flex items-center gap-2">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: `color-mix(in srgb, ${ink(tool.color)} 55%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${ink(tool.color)} 14%, var(--background))`,
        }}
      >
        <ToolMark id={id} className="h-1/2 w-1/2" />
      </span>
      <span className="font-mono text-base text-foreground">{tool.name}</span>
    </span>
  );
}

/**
 * The Performance view on phones: one card per route, stacked - who sends to
 * whom, the pipe (fill = backlog, packets through the hub's node), and the
 * three live figures in a row underneath.
 */
export default function LanesPhone({ routes, run }: { routes: QueueRouteMetric[]; run: boolean }) {
  const copy = howSectionsCopy.events.v1;
  return (
    <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-3">
      {routes.map((r, i) => {
        const fig = laneFigures(r);
        const color = ink(r.color, 75);
        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-glass bg-surface/40 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <End id={r.producerId} />
              <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <End id={r.consumerId} />
            </div>
            <div className="relative h-3">
              <div className="absolute inset-0 overflow-hidden rounded-full border border-glass-hover bg-background/60">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), color-mix(in srgb, var(--brand-cyan) 55%, transparent))` }}
                  initial={false}
                  animate={{ width: `${fig.fillPct}%` }}
                  transition={{ duration: run ? 0.6 : 0, ease: "easeOut" }}
                />
                {[0, 1].map((k) => (
                  <motion.span
                    key={k}
                    className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                    initial={{ left: "2%" }}
                    animate={{ left: run ? ["2%", "96%"] : `${30 + k * 40}%` }}
                    transition={loopTransition(run, { duration: 2.6 + i * 0.35, delay: k * 1.4, ease: "linear" })}
                  />
                ))}
              </div>
              <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-cyan bg-background" />
            </div>
            <dl className="grid grid-cols-3 gap-2 font-mono">
              {[
                [fig.eps, copy.perSecond],
                [fig.depth, copy.backlog],
                [`${fig.deliveryMs} ms`, copy.delivery],
              ].map(([value, label]) => (
                <div key={String(label)} className="flex flex-col-reverse">
                  <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
