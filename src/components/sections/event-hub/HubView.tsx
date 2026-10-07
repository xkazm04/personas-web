"use client";

import { AnimatePresence, motion } from "framer-motion";
import ToolMark from "./shared/ToolMark";
import HubArt from "./HubArt";
import { ART_AR, HUB, VB_H, VB_W, WIDE, orbitNodes, pct } from "./geometry";
import { ORBIT_TOOLS, ROUTE_SEEDS, ink } from "./telemetry";
import { howSectionsCopy } from "@/i18n/pending/howSections";

const NODES = orbitNodes(ORBIT_TOOLS.length);
const COLORS = ORBIT_TOOLS.map((t) => t.color);
const indexOf = (id: string) => ORBIT_TOOLS.findIndex((t) => t.id === id);

/**
 * Live connections: the tools on a perspective orbit around one lit hub. Each
 * step relays one route - the producer's message comets into the hub, the hub
 * pulses, and it comets out to the consumer - while every other tool keeps a
 * trickle of traffic flowing in.
 */
export default function HubView({ uid, step, run }: { uid: string; step: number; run: boolean }) {
  const copy = howSectionsCopy.events.v1;
  const route = ROUTE_SEEDS[step % ROUTE_SEEDS.length];
  const from = indexOf(route.producerId);
  const to = indexOf(route.consumerId);

  return (
    <div
      role="img"
      aria-label={copy.illustration}
      className="relative mx-auto aspect-[11/5] w-full min-w-[44rem] stage:min-w-0 stage:w-[min(100%,calc(100cqh*var(--hub-ar)))] [container-type:inline-size]"
      style={{ ["--hub-ar" as string]: ART_AR }}
    >
      <HubArt geo={WIDE} uid={uid} nodes={NODES} colors={COLORS} from={from} to={to} step={step} run={run} />

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center"
        style={{ ...pct(HUB.x, HUB.y), width: `${((HUB.r * 2) / VB_W) * 100}%` }}
      >
        <span className="font-mono text-[clamp(12px,1.25cqw,22px)] font-semibold uppercase leading-tight tracking-[0.14em] text-foreground">
          {copy.hub}
        </span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${((HUB.y + HUB.r + 24) / VB_H) * 100}%` }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={route.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: run ? 0.35 : 0 }}
            className="whitespace-nowrap rounded-full border px-[1.1cqw] py-[0.45cqw] text-[clamp(13px,1.5cqw,26px)] font-medium text-foreground backdrop-blur-sm"
            style={{
              borderColor: `color-mix(in srgb, ${ink(route.color, 75)} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${ink(route.color, 75)} 12%, var(--background))`,
            }}
          >
            {copy.routes[route.id]}
          </motion.p>
        </AnimatePresence>
      </div>

      {ORBIT_TOOLS.map((tool, i) => {
        const n = NODES[i];
        const active = i === from || i === to;
        const scale = 0.8 + n.depth * 0.32;
        return (
          <div
            key={tool.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ ...pct(n.x, n.y), zIndex: Math.round(n.depth * 10) + (active ? 20 : 0), opacity: active ? 1 : 0.78 + n.depth * 0.22 }}
          >
            <motion.div
              className="flex aspect-square items-center justify-center rounded-full border backdrop-blur-sm"
              style={{
                width: `${5.4 * scale}cqw`,
                borderColor: `color-mix(in srgb, ${ink(tool.color)} ${active ? 80 : 40}%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${ink(tool.color)} ${active ? 22 : 10}%, var(--background))`,
              }}
              animate={{
                scale: active ? 1.14 : 1,
                boxShadow: active ? `0 0 2.2cqw color-mix(in srgb, ${ink(tool.color)} 55%, transparent)` : "0 0 0cqw transparent",
              }}
              transition={{ duration: run ? 0.4 : 0, delay: run && i === to ? 2.1 : 0 }}
            >
              <ToolMark id={tool.id} className="h-[48%] w-[48%]" />
            </motion.div>
            <span
              className={`mt-[0.5cqw] whitespace-nowrap font-mono text-[clamp(12px,1.05cqw,19px)] ${active ? "text-foreground" : "text-foreground/70"}`}
            >
              {tool.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
