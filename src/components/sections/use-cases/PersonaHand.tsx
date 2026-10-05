"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandInk, brandTint } from "./shared/catalog";
import ToolGlyph from "./shared/ToolGlyph";

/**
 * The persona as a character card: its portrait (the product's own persona
 * art), its name, and a hand of six capability slots. Each won reel deals its
 * tool into the next slot, sliding in from the reels' side.
 */
export default function PersonaHand({
  docked,
  moving,
  name,
  description,
  caption,
}: {
  docked: boolean[];
  moving: boolean;
  name: string;
  description: string;
  caption: string;
}) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[1.4cqw] border border-glass-hover"
      style={{ backgroundColor: "rgba(var(--surface-overlay), 0.04)", boxShadow: `0 0 4cqw ${tint("purple", 14)}` }}
    >
      <div className="relative w-full shrink-0" style={{ height: "14.5cqw" }}>
        <Image src="/personas/daily-standup-digest.png" alt="" fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover object-[50%_22%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0" style={{ padding: "0 1.3cqw 0.9cqw" }}>
          <p className="font-bold leading-tight text-foreground" style={{ fontSize: "max(16px, 1.75cqw)" }}>
            {name}
          </p>
          <p className="leading-snug text-foreground/80" style={{ fontSize: "max(12px, 1.02cqw)" }}>
            {description}
          </p>
        </div>
      </div>

      <p className="font-semibold uppercase tracking-widest text-muted-dark" style={{ fontSize: "max(12px, 0.95cqw)", padding: "1.1cqw 1.3cqw 0.5cqw" }}>
        {caption}
      </p>
      <ul className="flex flex-1 flex-col justify-between" style={{ padding: "0 1.3cqw 1.3cqw", gap: "0.5cqw" }}>
        {CASES.map((c, i) => {
          const tool = TOOLS[c.chosen];
          return (
            <li key={c.need} className="relative flex-1 rounded-[0.8cqw] border border-dashed border-glass-hover" style={{ minHeight: "2.6cqw" }}>
              <AnimatePresence initial={false}>
                {docked[i] && (
                  <motion.div
                    className="absolute -inset-px flex items-center rounded-[0.8cqw] border [border-color:var(--bc)]"
                    style={{ gap: "0.8cqw", padding: "0 0.9cqw", backgroundColor: brandTint(tool, 16), "--bc": brandInk(tool, 45) } as CSSProperties}
                    initial={{ x: "70%", opacity: 0 }}
                    animate={{ x: "0%", opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: moving ? 0.3 : 0 } }}
                    transition={moving ? { type: "spring", stiffness: 160, damping: 20 } : { duration: 0 }}
                  >
                    <ToolGlyph tool={tool} style={{ width: "1.7cqw", height: "1.7cqw", color: brandInk(tool, 60) }} />
                    <span className="truncate font-semibold text-foreground" style={{ fontSize: "max(12px, 1.1cqw)" }}>
                      {tool.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
