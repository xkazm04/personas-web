"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import type { NodeTone } from "../../../genome";
import { CAPS, SLANT } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { seed, type Entry } from "./season";

const TONE: Record<NodeTone, BrandKey | null> = { lineage: "amber", alive: "emerald", culled: null };

/**
 * One bracket entry: seed, fitness, gain over its parent. Culled entries are
 * struck and stamped ELIM; the ledger's versions carry their id (and LIVE).
 * Before its generation enters, the slot shows a dashed TBD.
 */
export default function EntryCard({ e, entered, crowned, version, live, moving }: { e: Entry; entered: boolean; crowned: boolean; version?: string; live: boolean; moving: boolean }) {
  const { t } = useTranslation();
  const c = broadcastCopy.evolution;
  const k = TONE[e.tone];
  const culled = e.tone === "culled";
  const color = k ? BRAND_VAR[k] : "color-mix(in srgb, var(--foreground) 70%, transparent)";
  return (
    <div className="relative h-full w-full">
      <motion.div
        aria-hidden={entered}
        className={`${CAPS} absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-glass text-sm text-foreground/60`}
        initial={false}
        animate={{ opacity: entered ? 0 : 1 }}
        transition={beat(moving, 0.3)}
      >
        {c.tbd}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex flex-col justify-center overflow-hidden rounded-md border-2 px-2 py-1"
        style={{
          borderColor: k ? tint(k, crowned ? 90 : 55) : "var(--border-glass)",
          background: crowned ? tint("amber", 20) : k ? tint(k, 10) : "color-mix(in srgb, var(--foreground) 4%, transparent)",
          boxShadow: crowned ? `0 0 1.5rem ${tint("amber", 45)}` : "none",
        }}
        initial={false}
        animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -14 }}
        transition={beat(moving, 0.45)}
      >
        <div className="flex items-center justify-between gap-1">
          <span className={`${version ? SLANT : CAPS} truncate text-sm`} style={{ color }}>
            {version ?? seed(e.node)}
          </span>
          {crowned ? (
            <Trophy className="h-4 w-4 shrink-0" style={{ color: BRAND_VAR.amber }} aria-hidden />
          ) : live ? (
            <span className={`${CAPS} text-sm`} style={{ color: BRAND_VAR.emerald }}>
              {t.labVersions.live}
            </span>
          ) : null}
        </div>
        <span className={`font-mono text-2xl font-black italic leading-tight tabular-nums ${culled ? "line-through decoration-2" : ""}`} style={{ color: culled ? color : "var(--foreground)" }}>
          {e.node.fitness}
        </span>
        <span className="truncate font-mono text-sm tabular-nums text-foreground/70">
          {e.delta === null ? c.founder : fillTemplate(c.vsParent, { delta: e.delta >= 0 ? `+${e.delta}` : e.delta })}
        </span>
        {culled && (
          <motion.span
            className={`${CAPS} absolute right-1 top-1/2 rounded-sm border-2 px-1 text-sm`}
            style={{ borderColor: BRAND_VAR.rose, color: BRAND_VAR.rose, background: "var(--background)", y: "-50%" }}
            initial={false}
            animate={{ opacity: entered ? 1 : 0, scale: entered ? 1 : 1.8, rotate: -10 }}
            transition={moving ? { type: "spring", stiffness: 360, damping: 16, delay: 0.35 } : { duration: 0 }}
          >
            {c.elim}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
