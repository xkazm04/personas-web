"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

export interface LogLine {
  stage: string;
  text: string;
  sub?: string;
  color: BrandKey;
}

/**
 * The run log beside the circuit: one line per phase, written as the failure
 * advances. All four rows are always laid out (constant height); unreached
 * rows stay transparent.
 */
export default function RunLog({
  title,
  status,
  statusColor,
  lines,
  reached,
  running,
}: {
  title: string;
  status: string;
  statusColor: BrandKey;
  lines: LogLine[];
  reached: number;
  running: boolean;
}) {
  return (
    <div className="flex h-full flex-col border-t border-glass bg-foreground/[0.025] p-[1em] md:border-l md:border-t-0">
      <div className="mb-[0.8em] flex items-center justify-between gap-[0.6em]">
        <span className="font-mono text-[0.8em] font-semibold uppercase tracking-[0.14em] text-foreground/80">{title}</span>
        <span
          className="inline-flex items-center gap-[0.4em] rounded-full border px-[0.7em] py-[0.15em] text-[0.8em] font-semibold"
          style={{ color: BRAND_VAR[statusColor], borderColor: tint(statusColor, 40), background: tint(statusColor, 10) }}
        >
          <span className="h-[0.45em] w-[0.45em] rounded-full" style={{ background: BRAND_VAR[statusColor] }} />
          {status}
        </span>
      </div>
      <ol className="relative flex flex-1 flex-col justify-between gap-[0.5em]">
        <span aria-hidden className="absolute bottom-[0.6em] left-[0.42em] top-[0.6em] w-px bg-foreground/15" />
        {lines.map((l, i) => {
          const on = i < reached;
          return (
            <motion.li
              key={i}
              className="relative pl-[1.5em]"
              initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : -6 }}
              transition={{ duration: running ? 0.35 : 0 }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-[0.3em] h-[0.85em] w-[0.85em] rounded-full border-2"
                style={{ borderColor: BRAND_VAR[l.color], background: i === reached - 1 ? BRAND_VAR[l.color] : "var(--background)" }}
              />
              <span className="block font-mono text-[0.8em] font-semibold uppercase tracking-[0.12em]" style={{ color: BRAND_VAR[l.color] }}>
                {l.stage}
              </span>
              <span className="block font-medium leading-snug text-foreground">{l.text}</span>
              {l.sub && <span className="block text-[0.8em] leading-snug text-foreground/70">{l.sub}</span>}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
