"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { TOOL_BRAND } from "../shared/beats";

interface Link { from: string; to: string; brand: BrandKey; back?: boolean }
interface Seg { d: string; brand: BrandKey; key: string }

/** Which pane element hands over to which node at this beat. */
function linksFor(run: MindRun): Link[] {
  if (run.phase === "idle") return [];
  const st = run.statusOf(run.focus);
  if (run.focus === 0 && st === "active") return [{ from: "[data-am-prompt]", to: '[data-am-node="parse"]', brand: "cyan" }];
  if (run.focus === 2 && st === "active")
    return run.example.tools.map((_, i) => ({ from: `[data-am-chip="${i}"]`, to: `[data-am-node="tool-${i}"]`, brand: TOOL_BRAND[i % TOOL_BRAND.length] }));
  if (run.focus === 5) return [{ from: '[data-am-node="result"]', to: "[data-am-result]", brand: "emerald", back: true }];
  return [];
}

/**
 * The choreography between the two panes: while the agent reads, light runs
 * from the prompt into the mind; while tools work, from each chip to its
 * node; at the end the result travels back into the editor's result card.
 * Endpoints are measured from the DOM, so the beam lands on the real elements
 * at every size.
 */
export default function Beam({ run, rootRef, live }: { run: MindRun; rootRef: RefObject<HTMLDivElement | null>; live: boolean }) {
  const reduced = useStillMotion();
  const [segs, setSegs] = useState<Seg[]>([]);
  const links = linksFor(run);
  const sig = links.map((l) => l.from + l.to).join("|");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => {
      const box = root.getBoundingClientRect();
      const next: Seg[] = [];
      for (const l of linksFor(run)) {
        const a = root.querySelector(l.from)?.getBoundingClientRect();
        const b = root.querySelector(l.to)?.getBoundingClientRect();
        if (!a || !b) continue;
        // Chips sit in one row: every tool beam leaves from the row's end, not through its neighbours.
        const chips = l.from.startsWith("[data-am-chip") ? [...root.querySelectorAll("[data-am-chip]")].map((c) => c.getBoundingClientRect().right) : [];
        const x1 = (l.back ? a.left : chips.length ? Math.max(...chips) + 6 : a.right) - box.left;
        const x2 = (l.back ? b.right : b.left) - box.left;
        const y1 = a.top + a.height / 2 - box.top;
        const y2 = b.top + b.height / 2 - box.top;
        const dx = Math.abs(x2 - x1) * 0.45 * (l.back ? -1 : 1);
        next.push({ d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, brand: l.brand, key: l.from + l.to });
      }
      setSegs(next);
    });
    return () => cancelAnimationFrame(id);
    // `sig` captures which links are live; `run` changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, rootRef]);

  if (!sig) return null;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
      {segs.map((s) => (
        <g key={s.key} style={{ filter: `drop-shadow(0 0 6px ${tint(s.brand, 70)})` }}>
          <motion.path
            d={s.d}
            fill="none"
            stroke={BRAND_VAR[s.brand]}
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
          />
          <motion.path
            d={s.d}
            fill="none"
            stroke={BRAND_VAR[s.brand]}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="18 600"
            initial={{ strokeDashoffset: 18 }}
            animate={live ? { strokeDashoffset: [18, -600] } : { strokeDashoffset: 18 }}
            transition={{ duration: 1.1, repeat: live ? Infinity : 0, ease: "easeIn" }}
          />
        </g>
      ))}
    </svg>
  );
}
