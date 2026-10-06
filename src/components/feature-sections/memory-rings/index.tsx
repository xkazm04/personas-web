"use client";

import { useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { ArtBox, MemoryShell, ReplayButton, StylisedTag, frame } from "./shared/Frame";
import { usePlay } from "./shared/motion";
import type { CategoryKey } from "./shared/categories";
import Disc, { CALLOUTS } from "./Disc";
import Panel, { PANEL_X } from "./Panel";
import { C, H, RUNS, W } from "./rings";

/**
 * Remembers what works - "Growth rings" (winner of the 2026-10-06 /features review). The concept, not
 * the layout: every run of the agent draws one ring, from the centre out. The
 * first rings are rough, with a sharp stumble wherever it went wrong; every
 * stumble (and every fact, decision and insight it noted) leaves a memory on
 * its ring, and when a later ring passes that point a recall line lights and
 * the ring runs smooth there. Ten runs in, the rings are clean circles. The
 * improvement is the medium itself. The five kinds of memory on the right are
 * buttons that mark their seeds and show a real example.
 */

const DURATION = 9;
const { place, fs } = frame(W, H);

export default function MemoryLayers() {
  const copy = useTranslation().t.featuresSections.memory;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlay(ref, DURATION, RUNS);
  const [sel, setSel] = useState<CategoryKey | null>(null);
  const runNo = useTransform(p, (v) => String(Math.min(RUNS, Math.max(1, Math.ceil(v)))));

  return (
    <MemoryShell>
      <ArtBox w={W} h={H} boxRef={ref} label={copy.v3.artLabel}>
        <Disc p={p} sel={sel} />

        <span className="absolute flex flex-col items-center leading-none" style={{ ...place(C.x - 60, C.y - 46, 120) }}>
          <span className="font-mono uppercase tracking-[0.16em] text-foreground/75" style={fs(14, 12)}>
            {copy.v3.run}
          </span>
          <motion.span className="font-extrabold tabular-nums tracking-tight text-foreground" style={fs(54, 22)}>
            {runNo}
          </motion.span>
          <span className="text-foreground/70" style={fs(14, 12)}>
            {copy.v3.ofRuns.replace("{n}", String(RUNS))}
          </span>
        </span>

        {CALLOUTS.map(({ ring, label }) => (
          <span
            key={ring}
            className="absolute whitespace-nowrap font-semibold"
            style={{ ...place(label.x, label.y), ...fs(20, 15), color: ring ? BRAND_VAR.emerald : "var(--foreground)" }}
          >
            {ring ? copy.v3.smooth.replace("{n}", String(RUNS)) : copy.v3.rough}
          </span>
        ))}

        <Panel sel={sel} onSel={setSel} />

        <ReplayButton onClick={play} disabled={still} style={place(PANEL_X, 14)} />
        <StylisedTag style={{ ...place(PANEL_X, 590), ...fs(12, 12) }} />
      </ArtBox>
    </MemoryShell>
  );
}
