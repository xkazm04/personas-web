"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { LabPlugin } from "../shared/roster";

/** How far a plug stands above the strip, and the cable from its top up to the display. */
export const PLUG_RISE = 80;
export const CABLE = 30;

/**
 * One plugin as a plug seated in the strip. It drops into its socket on
 * arrival (in order, like plugging things in one by one); pressing it lights
 * its cable up into the display. The button is the whole plug.
 */
export default function Plug({
  plugin,
  index,
  active,
  run,
  still,
  onSelect,
}: {
  plugin: LabPlugin;
  index: number;
  active: boolean;
  run: boolean;
  still: boolean;
  onSelect: () => void;
}) {
  const c = BRAND_VAR[plugin.brand];
  const Icon = plugin.icon;
  return (
    <motion.div
      className="absolute left-1/2 z-10 -translate-x-1/2"
      style={{ top: -PLUG_RISE - CABLE }}
      initial={{ y: -70, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 15, delay: 0.25 + index * 0.18 }}
    >
      <motion.button
        type="button"
        data-plugin-key={plugin.key}
        aria-pressed={active}
        aria-label={plugin.label}
        onClick={onSelect}
        className="group relative flex flex-col items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        initial={false}
        animate={{ y: active ? -4 : 0 }}
        whileHover={still ? undefined : { y: active ? -4 : -3 }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* cable up to the display */}
        <span
          aria-hidden="true"
          className="relative block w-[12px] overflow-hidden rounded-t-[4px] transition-[background,box-shadow] duration-300"
          style={{
            height: CABLE,
            background: active ? `linear-gradient(0deg, ${c}, ${tint(plugin.brand, 50)})` : "color-mix(in srgb, var(--foreground) 14%, transparent)",
            boxShadow: active ? `0 0 16px ${tint(plugin.brand, 70)}` : undefined,
          }}
        >
          <motion.span
            className="absolute inset-x-0 h-3 rounded-full bg-background/80"
            initial={false}
            animate={active && run ? { top: ["100%", "-30%"] } : { top: "-40%" }}
            transition={active && run ? { duration: 1.2, repeat: Infinity, ease: "easeIn" } : { duration: 0 }}
          />
        </span>
        {/* plug body */}
        <span
          className="relative flex h-[92px] w-[84px] flex-col items-center justify-center rounded-[18px] border transition-[background,border-color,box-shadow] duration-300"
          style={{
            borderColor: active ? c : tint(plugin.brand, 40),
            background: `linear-gradient(180deg, ${tint(plugin.brand, active ? 34 : 18)}, color-mix(in srgb, var(--background) 86%, transparent))`,
            boxShadow: active ? `0 0 34px ${tint(plugin.brand, 45)}, inset 0 1px 0 ${tint(plugin.brand, 60)}` : `inset 0 1px 0 ${tint(plugin.brand, 25)}`,
          }}
        >
          <span aria-hidden="true" className="absolute top-2.5 flex gap-1">
            {[0, 1, 2].map((g) => (
              <span key={g} className="h-[3px] w-3 rounded-full" style={{ background: tint(plugin.brand, active ? 70 : 35) }} />
            ))}
          </span>
          <Icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" style={{ color: c }} aria-hidden="true" />
        </span>
        {/* collar that sits in the socket */}
        <span aria-hidden="true" className="h-[18px] w-[58px] rounded-b-lg" style={{ background: tint(plugin.brand, active ? 45 : 22) }} />
      </motion.button>
    </motion.div>
  );
}
