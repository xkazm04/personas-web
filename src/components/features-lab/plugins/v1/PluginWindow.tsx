"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import type { LabPlugin } from "../shared/roster";
import { CARTRIDGE_GAP, CARTRIDGE_H } from "./Cartridge";
import BrainScene from "./BrainScene";
import FleetScene from "./FleetScene";

const SCENES: Partial<Record<LabPlugin["key"], React.ComponentType>> = {
  "dev-tools": FleetScene,
  "obsidian-brain": BrainScene,
};

/**
 * The app window the cartridges plug into: a back plate for depth, a rim lit
 * in the seated plugin's colour, a socket per cartridge on the left edge (the
 * seated one glows) and a floor glow beneath. The body crossfades per plugin.
 */
export default function PluginWindow({
  plugins,
  plugin,
  tagline,
  still,
}: {
  plugins: LabPlugin[];
  plugin: LabPlugin;
  tagline: string;
  still: boolean;
}) {
  const copy = useTranslation().t.pluginShowcase;
  const c = BRAND_VAR[plugin.brand];
  const Scene = SCENES[plugin.key] ?? FleetScene;
  const Icon = plugin.icon;
  const index = plugins.findIndex((p) => p.key === plugin.key);
  return (
    <div className="relative min-w-0 flex-1">
      <div aria-hidden="true" className="absolute -bottom-10 left-[8%] right-[8%] h-20 rounded-[50%] blur-3xl transition-colors duration-700" style={{ background: tint(plugin.brand, 22) }} />
      <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[24px] border border-foreground/[0.06] bg-foreground/[0.02]" />
      <div
        className="relative flex h-[540px] flex-col overflow-hidden rounded-[24px] border transition-[border-color,box-shadow] duration-500"
        style={{
          borderColor: tint(plugin.brand, 30),
          background: "color-mix(in srgb, var(--background) 94%, var(--foreground))",
          boxShadow: `0 30px 80px -30px ${tint(plugin.brand, 35)}, inset 0 1px 0 color-mix(in srgb, var(--foreground) 8%, transparent)`,
        }}
      >
        <span aria-hidden="true" className="absolute inset-x-10 top-0 h-px transition-colors duration-500" style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }} />
        <span aria-hidden="true" className="absolute inset-y-8 left-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${tint(plugin.brand, 70)}, transparent)` }} />
        {/* Seating flash: one sweep of light across the rim each time a cartridge plugs in. */}
        <motion.span
          key={`flash-${plugin.key}`}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-10 h-[2px] w-1/3"
          style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)`, boxShadow: `0 0 18px ${c}` }}
          initial={{ left: "-33%", opacity: still ? 0 : 1 }}
          animate={{ left: "100%", opacity: 0 }}
          transition={{ duration: still ? 0 : 1.1, ease: "easeOut" }}
        />
        {plugins.map((p, i) => (
          <span
            key={p.key}
            aria-hidden="true"
            className="absolute left-0 h-[30px] w-[6px] -translate-y-1/2 rounded-r-md transition-[background,box-shadow] duration-300"
            style={{
              top: i * (CARTRIDGE_H + CARTRIDGE_GAP) + CARTRIDGE_H / 2,
              background: p.key === plugin.key ? BRAND_VAR[p.brand] : "color-mix(in srgb, var(--foreground) 14%, transparent)",
              boxShadow: p.key === plugin.key ? `0 0 16px ${tint(p.brand, 80)}` : undefined,
            }}
          />
        ))}

        <div className="flex items-center gap-3 border-b border-foreground/[0.07] px-5 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: tint(plugin.brand, 14) }}>
            <Icon className="h-5 w-5" style={{ color: c }} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-[17px] font-semibold leading-tight text-foreground">{plugin.label}</div>
            <div className="font-mono text-[13px] text-foreground/65">{tagline}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.16em] text-foreground/65">
            <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} aria-hidden="true" />
            {fillTemplate(copy.counter, { current: index + 1, total: plugins.length })}
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={plugin.key}
              className="absolute inset-0"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: still ? 0 : 0.35 }}
            >
              <Scene />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
