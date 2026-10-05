"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { LabPlugin, LabPluginKey } from "../shared/roster";
import ConnectorBank from "./ConnectorBank";
import Plug from "./Plug";

/**
 * The power strip itself: Personas is the strip (its mark on the end cap,
 * its cord leaving the frame), the four shipped plugins sit in the first
 * sockets and the connector bank fills the rest. A slow light runs along the
 * strip's edge while it is on screen - current, not decoration.
 */
export default function Strip({
  plugins,
  active,
  onSelect,
  run,
  still,
}: {
  plugins: LabPlugin[];
  active: LabPluginKey;
  onSelect: (key: LabPluginKey) => void;
  run: boolean;
  still: boolean;
}) {
  return (
    <div
      className="relative flex h-[140px] items-stretch rounded-[30px] border px-5"
      style={{
        borderColor: "color-mix(in srgb, var(--foreground) 13%, transparent)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--foreground) 8%, var(--background)), color-mix(in srgb, var(--foreground) 3%, var(--background)))",
        boxShadow:
          "0 24px 60px -24px color-mix(in srgb, var(--background) 40%, black), inset 0 1px 0 color-mix(in srgb, var(--foreground) 14%, transparent), inset 0 -3px 0 color-mix(in srgb, var(--foreground) 5%, transparent)",
      }}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute -left-[130px] top-1/2 h-[200px] w-[136px]" viewBox="0 0 136 200" fill="none">
        <defs>
          <linearGradient id="flab-cord" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="color-mix(in srgb, var(--foreground) 26%, transparent)" />
            <stop offset="1" stopColor="color-mix(in srgb, var(--foreground) 0%, transparent)" />
          </linearGradient>
        </defs>
        <path d="M136 0 C 80 0, 70 50, 60 110 S 30 200, 0 200" stroke="url(#flab-cord)" strokeWidth={10} strokeLinecap="round" />
      </svg>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px overflow-hidden">
        <motion.span
          className="absolute top-0 h-px w-40"
          style={{ background: "linear-gradient(90deg, transparent, var(--brand-cyan), transparent)" }}
          initial={false}
          animate={run ? { left: ["-15%", "100%"], opacity: 1 } : { left: "-15%", opacity: 0 }}
          transition={run ? { duration: 3.6, repeat: Infinity, ease: "linear", repeatDelay: 0.6 } : { duration: 0 }}
        />
      </span>

      <div className="flex w-[118px] shrink-0 flex-col items-center justify-center gap-2 border-r border-foreground/[0.08] pr-5">
        <Image src="/icons/icon-192.png" alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-xl" />
        <span className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-brand-emerald shadow-[0_0_8px_var(--brand-emerald)]" aria-hidden="true" />
          Personas
        </span>
      </div>

      {plugins.map((p, i) => {
        const on = p.key === active;
        return (
          <div key={p.key} className="relative flex w-[128px] shrink-0 flex-col items-center justify-end pb-3.5">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[8px] h-[34px] w-[84px] -translate-x-1/2 rounded-xl"
              style={{ background: "color-mix(in srgb, var(--background) 90%, var(--foreground))", boxShadow: "inset 0 3px 8px color-mix(in srgb, black 40%, transparent)" }}
            />
            <Plug plugin={p} index={i} active={on} run={run} still={still} onSelect={() => onSelect(p.key)} />
            <span className={`flex items-center gap-2 text-[16px] font-semibold ${on ? "text-foreground" : "text-foreground/70"}`}>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full transition-[box-shadow,opacity] duration-300"
                style={{ background: BRAND_VAR[p.brand], boxShadow: on ? `0 0 10px ${BRAND_VAR[p.brand]}` : undefined, opacity: on ? 1 : 0.55 }}
              />
              {p.label}
            </span>
          </div>
        );
      })}

      <span aria-hidden="true" className="mx-4 my-6 w-px bg-foreground/[0.1]" />
      <ConnectorBank still={still} />
    </div>
  );
}
