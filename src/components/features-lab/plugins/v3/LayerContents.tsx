"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { LabPlugin, LabPluginKey } from "../shared/roster";
import { pickTools, FEATURED_IDS } from "../shared/catalog";
import ToolLogo from "../shared/ToolLogo";
import { AGENTS, BILLBOARD, KEY, KEY_GAP, KEY_PAD, PLATE, TILE, TILE_AT } from "./geometry";

const STAND = { transform: BILLBOARD, transformOrigin: "50% 100%" } as const;

/** Base plate: Personas itself, with your agents standing on it. */
export function AgentsLayer() {
  return (
    <>
      <div className="absolute flex items-center justify-center" style={{ left: PLATE / 2 - 34, top: PLATE / 2 - 34, width: 68, height: 68 }}>
        <Image src="/icons/icon-192.png" alt="" width={68} height={68} className="h-[68px] w-[68px] rounded-2xl" />
      </div>
      {AGENTS.map((a) => (
        <div key={a.src} className="absolute" style={{ left: a.x - 25, top: a.y - 50, width: 50, height: 50, ...STAND }}>
          <Image
            src={a.src}
            alt=""
            width={50}
            height={50}
            className="h-[50px] w-[50px] rounded-full border-2 border-brand-cyan/60 object-cover shadow-[0_0_18px_color-mix(in_srgb,var(--brand-cyan)_40%,transparent)]"
          />
        </div>
      ))}
    </>
  );
}

/** Middle plate: one block per shipped plugin; the chosen one rises and lights. */
export function PluginsLayer({ plugins, active, still }: { plugins: LabPlugin[]; active: LabPluginKey; still: boolean }) {
  return (
    <>
      {plugins.map((p) => {
        const on = p.key === active;
        const c = BRAND_VAR[p.brand];
        const Icon = p.icon;
        const at = TILE_AT[p.key];
        return [
          <div
            key={`${p.key}-socket`}
            aria-hidden="true"
            className="absolute rounded-[16px]"
            style={{ left: at.x - 6, top: at.y - 6, width: TILE + 12, height: TILE + 12, background: "color-mix(in srgb, var(--background) 70%, transparent)", boxShadow: `inset 0 0 0 1px ${tint(p.brand, 35)}` }}
          />,
          <motion.div
            key={p.key}
            className="absolute"
            style={{ left: at.x, top: at.y, width: TILE, height: TILE, transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ z: on ? 30 : 8 }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 18 }}
          >
            <div aria-hidden="true" className="absolute inset-0 rounded-[14px]" style={{ transform: "translateZ(-10px)", background: `color-mix(in srgb, ${c} 35%, var(--background))` }} />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[14px] border-2 transition-[box-shadow,background] duration-500"
              style={{
                borderColor: on ? c : tint(p.brand, 45),
                background: `linear-gradient(135deg, color-mix(in srgb, ${c} ${on ? 40 : 20}%, var(--background)), color-mix(in srgb, ${c} 8%, var(--background)))`,
                boxShadow: on ? `0 0 50px ${tint(p.brand, 60)}` : undefined,
              }}
            />
            <div className="absolute" style={{ left: TILE / 2 - 27, top: TILE / 2 - 54, width: 54, height: 54, ...STAND, transform: `translateZ(2px) ${BILLBOARD}` }}>
              <span
                className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl border-2 transition-shadow duration-500"
                style={{ borderColor: c, background: `color-mix(in srgb, ${c} 22%, var(--background))`, boxShadow: on ? `0 0 26px ${c}` : undefined }}
              >
                <Icon className="h-7 w-7" style={{ color: c }} aria-hidden="true" />
              </span>
            </div>
          </motion.div>,
        ];
      })}
    </>
  );
}

const KEYS = pickTools([...FEATURED_IDS, "microsoft_outlook", "microsoft_teams", "mixpanel", "canva", "cloudflare", "railway", "elevenlabs", "x_twitter", "youtube_data", "pipedrive", "neon", "mongodb"]).slice(0, 36);

/** Top plate: the connector catalog as keycaps; a few light up at a time as agents reach out. */
export function ConnectorsLayer({ lit }: { lit: ReadonlySet<number> }) {
  return (
    <>
      {KEYS.map((tool, i) => {
        const on = lit.has(i);
        return (
          <div
            key={tool.id}
            className="absolute flex items-center justify-center rounded-xl border transition-[background,border-color,box-shadow,color] duration-500"
            style={{
              left: KEY_PAD + (i % 6) * (KEY + KEY_GAP),
              top: KEY_PAD + Math.floor(i / 6) * (KEY + KEY_GAP),
              width: KEY,
              height: KEY,
              borderColor: on ? "var(--brand-cyan)" : "color-mix(in srgb, var(--foreground) 14%, transparent)",
              background: on ? "color-mix(in srgb, var(--brand-cyan) 26%, var(--background))" : "color-mix(in srgb, var(--background) 80%, var(--foreground))",
              boxShadow: on ? "0 0 20px color-mix(in srgb, var(--brand-cyan) 60%, transparent)" : undefined,
              color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 70%, transparent)",
            }}
          >
            <ToolLogo icon={tool.icon} className="h-5 w-5" />
          </div>
        );
      })}
    </>
  );
}

export const KEY_COUNT = KEYS.length;
