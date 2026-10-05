"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { LabPlugin } from "../shared/roster";

export const CARTRIDGE_H = 104;
export const CARTRIDGE_GAP = 12;

/**
 * A plugin as a physical cartridge: pressing it slides it right until its two
 * prongs seat in the window's socket and light up. The tab of the live
 * section, made into the thing the heading promises - something you plug in.
 */
export default function Cartridge({
  plugin,
  tagline,
  active,
  still,
  onSelect,
}: {
  plugin: LabPlugin;
  tagline: string;
  active: boolean;
  still: boolean;
  onSelect: () => void;
}) {
  const c = BRAND_VAR[plugin.brand];
  const Icon = plugin.icon;
  return (
    <motion.button
      type="button"
      data-plugin-key={plugin.key}
      aria-pressed={active}
      onClick={onSelect}
      initial={false}
      animate={{ x: active ? 16 : 0 }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex w-full items-center gap-4 rounded-2xl border px-4 text-left outline-none transition-[background,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-brand-cyan"
      style={{
        height: CARTRIDGE_H,
        borderColor: active ? tint(plugin.brand, 55) : "color-mix(in srgb, var(--foreground) 10%, transparent)",
        background: active
          ? `linear-gradient(135deg, ${tint(plugin.brand, 18)}, color-mix(in srgb, var(--background) 92%, transparent) 75%)`
          : "color-mix(in srgb, var(--foreground) 3%, transparent)",
        boxShadow: active ? `0 12px 40px -12px ${tint(plugin.brand, 45)}, inset 0 1px 0 ${tint(plugin.brand, 35)}` : undefined,
      }}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
        style={{ borderColor: tint(plugin.brand, active ? 50 : 20), background: tint(plugin.brand, active ? 20 : 8) }}
      >
        <Icon className="h-6 w-6" style={{ color: c }} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={`block text-[19px] font-semibold leading-tight ${active ? "text-foreground" : "text-foreground/75 group-hover:text-foreground"}`}>
          {plugin.label}
        </span>
        <span className="mt-1 block text-[14px] leading-snug text-foreground/65">{tagline}</span>
      </span>
      <span aria-hidden="true" className="absolute -right-[26px] top-1/2 flex -translate-y-1/2 flex-col gap-2.5">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="block h-[7px] w-[26px] rounded-r-[3px] transition-[background,box-shadow] duration-300"
            style={{
              background: active
                ? `linear-gradient(90deg, ${tint(plugin.brand, 60)}, ${c})`
                : "color-mix(in srgb, var(--foreground) 22%, transparent)",
              boxShadow: active ? `0 0 12px ${tint(plugin.brand, 70)}` : undefined,
            }}
          />
        ))}
      </span>
    </motion.button>
  );
}
