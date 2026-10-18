"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CAPS, FreehandRing } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";

/**
 * The applied diff as a telestrated play diagram: the config lines sit on a
 * chalk field, each gets a play marker, and the analyst's pen rings every
 * changed line in turn, with a route arrow linking the markers.
 */
export default function Telestrator({ content, shown, moving }: { content: string; shown: boolean; moving: boolean }) {
  const lines = content.split("\n");
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border px-3 py-2.5"
      style={{
        borderColor: tint("emerald", 40),
        background: `repeating-linear-gradient(90deg, ${tint("emerald", 10)} 0 1px, transparent 1px 3.5rem), ${tint("emerald", 7)}`,
      }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
      transition={beat(moving, 0.4)}
    >
      <div className={`${CAPS} mb-1.5 text-sm`} style={{ color: BRAND_VAR.emerald }}>
        {broadcastCopy.chat.telestrator}
      </div>
      <ol className="relative space-y-2 pl-9">
        {lines.length > 1 && (
          <svg aria-hidden viewBox="0 0 24 100" preserveAspectRatio="none" className="absolute bottom-3 left-0 top-3 h-[calc(100%-1.5rem)] w-6 overflow-visible">
            <motion.path
              d="M 12 8 C 26 34, -2 62, 12 92"
              fill="none"
              stroke={BRAND_VAR.amber}
              strokeWidth={2}
              strokeDasharray="0.06 0.04"
              pathLength={1}
              initial={false}
              animate={{ opacity: shown ? 0.9 : 0 }}
              transition={beat(moving, 0.5, 0.2 + lines.length * 0.35)}
            />
          </svg>
        )}
        {lines.map((line, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className={`${CAPS} absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm`}
              style={{ borderColor: BRAND_VAR.amber, color: BRAND_VAR.amber, background: "var(--background)" }}
            >
              {i % 2 === 0 ? "X" : "O"}
            </span>
            <span className="relative inline-block max-w-full">
              <FreehandRing tone="amber" drawn={shown} moving={moving} delay={0.25 + i * 0.35} />
              <code className="relative block break-all font-mono text-sm leading-6 text-foreground md:text-base">{line}</code>
            </span>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
