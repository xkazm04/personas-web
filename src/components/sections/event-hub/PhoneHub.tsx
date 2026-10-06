"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { TOOL_MAP } from "@/lib/tool-catalogue";
import ToolMark from "./shared/ToolMark";
import HubArt from "./HubArt";
import { NARROW } from "./geometry";
import { ROUTE_SEEDS, ink } from "./telemetry";

/* Phones: the hub with only the four routes' eight tools, each route's ends
 * facing each other across it, so every relay crosses the hub. The caption
 * sits under the drawing, where it can wrap. Same stepper, same loop gate. */
const TOOLS = [...ROUTE_SEEDS.map((r) => r.producerId), ...ROUTE_SEEDS.map((r) => r.consumerId)].map((id) => TOOL_MAP.get(id)!);
const NODES = NARROW.nodes(TOOLS.length);
const COLORS = TOOLS.map((t) => t.color);
const { hub: HUB, pct } = NARROW;

export default function PhoneHub({ uid, step, run }: { uid: string; step: number; run: boolean }) {
  const copy = useTranslation().t.howSections.events.v1;
  const k = step % ROUTE_SEEDS.length;
  const route = ROUTE_SEEDS[k];
  const from = k;
  const to = k + ROUTE_SEEDS.length;

  return (
    <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center gap-3">
      <div role="img" aria-label={copy.illustration} className="relative aspect-square w-full [container-type:inline-size]">
        <HubArt geo={NARROW} uid={uid} nodes={NODES} colors={COLORS} from={from} to={to} step={step} run={run} />
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center font-mono text-xs font-semibold uppercase leading-tight tracking-[0.12em] text-foreground"
          style={{ ...pct(HUB.x, HUB.y), width: `${((HUB.r * 2) / NARROW.w) * 100}%` }}
        >
          {copy.hub}
        </span>
        {TOOLS.map((tool, i) => {
          const n = NODES[i];
          const active = i === from || i === to;
          return (
            <div
              key={tool.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ ...pct(n.x, n.y), zIndex: active ? 20 : 10, opacity: active ? 1 : 0.85 }}
            >
              <motion.div
                className="flex aspect-square w-[12.5cqw] items-center justify-center rounded-full border backdrop-blur-sm"
                style={{
                  borderColor: `color-mix(in srgb, ${ink(tool.color)} ${active ? 80 : 40}%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${ink(tool.color)} ${active ? 22 : 10}%, var(--background))`,
                }}
                animate={{
                  scale: active ? 1.12 : 1,
                  boxShadow: active ? `0 0 5cqw color-mix(in srgb, ${ink(tool.color)} 55%, transparent)` : "0 0 0cqw transparent",
                }}
                transition={{ duration: run ? 0.4 : 0, delay: run && i === to ? 2.1 : 0 }}
              >
                <ToolMark id={tool.id} className="h-[48%] w-[48%]" />
              </motion.div>
              <span className={`mt-1 whitespace-nowrap font-mono text-xs ${active ? "text-foreground" : "text-foreground/75"}`}>{tool.name}</span>
            </div>
          );
        })}
      </div>
      <div className="flex min-h-12 items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={route.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: run ? 0.35 : 0 }}
            className="rounded-full border px-4 py-1.5 text-center text-base font-medium text-foreground"
            style={{
              borderColor: `color-mix(in srgb, ${ink(route.color, 75)} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${ink(route.color, 75)} 12%, var(--background))`,
            }}
          >
            {copy.routes[route.id]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
