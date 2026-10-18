"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { CAPS } from "../Frame";
import { beat } from "../useOnAir";
import { CHAMP, ENTRIES, ENTRY_BY_ID, GENS, LINEAGE } from "./season";
import EntryCard from "./EntryCard";

const PAD = 0.1; // card inset within its column, as a share of the column
const CARD_H = 84; // px - the card's fixed height (h-[5.25rem])

/** The board's pixel size, so the elbow connectors are drawn at true stroke widths. */
function useBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setBox((p) => (p && p.w === w && p.h === h ? p : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/**
 * The draft board: generations enter column by column, bracket elbows draw
 * from each parent to its children (amber along the champion's lineage), and
 * the final beat crowns the champion.
 */
export default function Bracket({ entered, crowned, versionOf, liveNode, moving }: { entered: number; crowned: boolean; versionOf: Map<string, string>; liveNode?: string; moving: boolean }) {
  const [ref, box] = useBox();
  const colW = box ? box.w / GENS : 0;

  return (
    <div className="flex h-full min-w-[40rem] flex-col">
      <div className="grid border-b border-glass" style={{ gridTemplateColumns: `repeat(${GENS}, minmax(0, 1fr))` }}>
        {Array.from({ length: GENS }, (_, g) => (
          <div key={g} className={`${CAPS} py-1.5 text-center text-sm transition-colors duration-300`} style={{ color: g < entered ? BRAND_VAR.amber : "color-mix(in srgb, var(--foreground) 60%, transparent)" }}>
            {fillTemplate(labSectionCopy.evolution.genAxis, { gen: g })}
          </div>
        ))}
      </div>
      <div ref={ref} className="relative min-h-[18rem] flex-1 stage:min-h-0">
        {box && (
          <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${box.w} ${box.h}`}>
            {ENTRIES.filter((e) => e.node.parent).map((e) => {
              const p = ENTRY_BY_ID.get(e.node.parent!)!;
              const x1 = (p.col + 1 - PAD) * colW;
              const x2 = (e.col + PAD) * colW;
              const xm = (x1 + x2) / 2;
              const y1 = p.y * box.h;
              const y2 = e.y * box.h;
              const hot = LINEAGE.has(e.node.id);
              return (
                <motion.path
                  key={e.node.id}
                  d={`M ${x1} ${y1} H ${xm} V ${y2} H ${x2}`}
                  fill="none"
                  stroke={hot ? BRAND_VAR.amber : "currentColor"}
                  className="text-foreground"
                  strokeOpacity={hot ? 1 : e.node.alive ? 0.35 : 0.18}
                  strokeWidth={hot ? 2.5 : 1.5}
                  initial={false}
                  animate={{ pathLength: e.col < entered ? 1 : 0 }}
                  transition={beat(moving, 0.5)}
                />
              );
            })}
          </svg>
        )}
        {ENTRIES.map((e) => (
          <div
            key={e.node.id}
            className="absolute h-[5.25rem]"
            style={{
              left: `${((e.col + PAD) / GENS) * 100}%`,
              width: `${((1 - PAD * 2) / GENS) * 100}%`,
              top: `calc(${e.y * 100}% - ${CARD_H / 2}px)`,
            }}
          >
            <EntryCard
              e={e}
              entered={e.col < entered}
              crowned={crowned && e.node.id === CHAMP?.id}
              version={versionOf.get(e.node.id)}
              live={e.node.id === liveNode}
              moving={moving}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
