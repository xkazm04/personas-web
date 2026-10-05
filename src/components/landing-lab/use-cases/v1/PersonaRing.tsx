"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandInk, brandTint } from "../shared/catalog";
import PersonaBust from "../shared/PersonaBust";
import ToolGlyph from "../shared/ToolGlyph";
import { PERSONA, SOCKET, cq, px, py, socketAt, spotOf } from "./geometry";

/**
 * The persona inside its ring of six sockets. A docked capability flies in
 * from its tile's spot in the field and seats in the next socket; the socket
 * waiting for the current need breathes. Sockets already present on the first
 * render (server, reduced motion) appear seated, not flying.
 */
export default function PersonaRing({
  docked,
  active,
  waiting,
  moving,
  name,
}: {
  docked: boolean[];
  active: number;
  waiting: boolean;
  moving: boolean;
  name: string;
}) {
  const count = docked.filter(Boolean).length;
  const fly = moving ? { type: "spring" as const, stiffness: 90, damping: 16, mass: 0.9 } : { duration: 0 };

  return (
    <>
      <div
        className="absolute"
        style={{ left: px(PERSONA.cx - 92), top: py(PERSONA.cy - 112), width: cq(184), height: cq(212) }}
      >
        <PersonaBust flashKey={count} moving={moving} lit={0.25 + (0.75 * count) / CASES.length} className="h-full w-full" />
      </div>
      <p
        className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-foreground"
        style={{ left: px(PERSONA.cx), top: py(PERSONA.cy + PERSONA.ring + 34), fontSize: `max(16px, ${cq(18)})` }}
      >
        {name}
      </p>

      {CASES.map((c, i) => {
        const s = socketAt(i);
        const breathing = waiting && i === active && !docked[i];
        return (
          <motion.span
            key={c.need}
            aria-hidden="true"
            className="absolute rounded-full border-2 border-dashed [border-color:var(--bc)]"
            style={{
              left: px(s.x),
              top: py(s.y),
              width: cq(SOCKET),
              height: cq(SOCKET),
              marginLeft: cq(-SOCKET / 2),
              marginTop: cq(-SOCKET / 2),
              "--bc": breathing ? BRAND_VAR.cyan : "var(--border-glass-hover)",
              backgroundColor: breathing ? tint("cyan", 8) : "transparent",
            } as CSSProperties}
            initial={false}
            animate={breathing && moving ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={breathing && moving ? { duration: 1.4, repeat: Infinity } : { duration: 0.3 }}
          />
        );
      })}

      <AnimatePresence initial={false}>
        {CASES.map((c, i) => {
          if (!docked[i]) return null;
          const s = socketAt(i);
          const from = spotOf(c.chosen);
          const tool = TOOLS[c.chosen];
          return (
            <motion.div
              key={c.need}
              className="absolute z-[4] flex items-center justify-center rounded-full border-2 [border-color:var(--bc)]"
              style={{
                width: cq(SOCKET),
                height: cq(SOCKET),
                marginLeft: cq(-SOCKET / 2),
                marginTop: cq(-SOCKET / 2),
                color: brandInk(tool, 55),
                backgroundColor: `color-mix(in srgb, ${tool.color} 22%, var(--background))`,
                "--bc": brandInk(tool, 60),
                boxShadow: `0 0 ${cq(22)} ${brandTint(tool, 40)}`,
              } as CSSProperties}
              initial={{ left: px(from.x), top: py(from.y), scale: 1.3, opacity: 1 }}
              animate={{ left: px(s.x), top: py(s.y), scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: moving ? { duration: 0.4 } : { duration: 0 } }}
              transition={fly}
            >
              <ToolGlyph tool={tool} className="h-1/2 w-1/2" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}
