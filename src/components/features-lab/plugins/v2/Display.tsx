"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { pluginTagline, type LabPlugin, type LabPluginKey } from "../shared/roster";
import BrainArt from "./art/BrainArt";
import DriveArt from "./art/DriveArt";
import FleetArt from "./art/FleetArt";
import TwinArt from "./art/TwinArt";

const ART: Record<LabPluginKey, React.ComponentType<{ step: number; run: boolean }>> = {
  "dev-tools": FleetArt,
  "obsidian-brain": BrainArt,
  drive: DriveArt,
  twin: TwinArt,
};

/**
 * What the plugged-in plugin adds, lit in its colour: name, tagline, the
 * three things it gives your agents, and a drawn scene of it at work. The
 * whole panel powers on (a crossfade with a light wipe) on every switch.
 */
export default function Display({
  plugin,
  index,
  total,
  step,
  run,
  still,
}: {
  plugin: LabPlugin;
  index: number;
  total: number;
  step: number;
  run: boolean;
  still: boolean;
}) {
  const { t } = useTranslation();
  const lab = t.featuresLab.plugins;
  const c = BRAND_VAR[plugin.brand];
  const Art = ART[plugin.key];
  return (
    <div
      className="relative h-[300px] overflow-hidden rounded-[28px] border transition-[border-color,box-shadow] duration-500"
      style={{
        borderColor: tint(plugin.brand, 32),
        background: `radial-gradient(120% 140% at 80% 50%, ${tint(plugin.brand, 12)}, transparent 60%), color-mix(in srgb, var(--background) 92%, var(--foreground))`,
        boxShadow: `0 30px 90px -40px ${tint(plugin.brand, 50)}, inset 0 1px 0 color-mix(in srgb, var(--foreground) 8%, transparent)`,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={plugin.key}
          className="absolute inset-0 grid grid-cols-[1fr_1.25fr] items-center gap-6 px-10"
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: still ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em] text-foreground/65">
              <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} aria-hidden="true" />
              {fillTemplate(t.pluginShowcase.counter, { current: index + 1, total })} · {lab.v2.powered}
            </div>
            <h3 className="mt-3 text-[clamp(2rem,3vw,2.75rem)] font-semibold leading-none tracking-tight text-foreground">{plugin.label}</h3>
            <p className="mt-3 text-[18px] leading-snug text-foreground/75">{pluginTagline(t, plugin.copyKey)}</p>
            <ul className="mt-5 space-y-2">
              {lab.adds[plugin.copyKey].map((line) => (
                <li key={line} className="flex items-center gap-3 text-[17px] text-foreground/90">
                  <span aria-hidden="true" className="h-[6px] w-[14px] rounded-r-full" style={{ background: c }} />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-[240px] min-w-0">
            <Art step={step} run={run} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
