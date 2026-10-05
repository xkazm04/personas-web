"use client";

import { useCallback, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { ArtBox, MemoryShell, ReplayButton, StylisedTag, frame } from "../shared/Frame";
import { usePlay } from "../shared/motion";
import { H, RUNS, TIERS, TIER_BRAND, TIER_Y, W, memoriesAt } from "./schedule";
import Ledger from "./Ledger";
import Stack from "./Stack";

/**
 * Features lab - Remembers what works, V2 "Memory layers". The concept, not
 * the layout: the product's four memory tiers as a lit isometric stack, and a
 * ledger of six runs of the same agent. Before each run its memories beam into
 * it; after, what it learned drops into the working layer, memories it keeps
 * using rise to active and unused ones sink to the archive. Retries fall from
 * three to none by run 4. Each ledger row is a button that rewinds the stack
 * to that run.
 */

const DURATION = 13;
const { place, fs } = frame(W, H);

export default function LabVariant() {
  const copy = useTranslation().t.featuresLab.memory;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, seek, still } = usePlay(ref, DURATION, RUNS);
  const count = useTransform(p, (v) => copy.v2.memories.replace("{n}", String(memoriesAt(v))));
  const pick = useCallback((k: number) => seek(k), [seek]);

  return (
    <MemoryShell>
      <ArtBox w={W} h={H} boxRef={ref} label={copy.v2.artLabel}>
        <Stack p={p} />

        {TIERS.map((tier) => (
          <span key={tier} className="absolute flex flex-col gap-1 leading-none" style={place(20, TIER_Y[tier] - 24, 240)}>
            <span className="font-bold tracking-tight" style={{ ...fs(26, 16), color: BRAND_VAR[TIER_BRAND[tier]] }}>
              {copy.v2.tiers[tier].name}
            </span>
            <span className="text-foreground/75" style={fs(17, 14)}>
              {copy.v2.tiers[tier].note}
            </span>
          </span>
        ))}

        <motion.span
          className="absolute whitespace-nowrap font-mono font-semibold uppercase tracking-[0.16em] text-foreground/75"
          style={{ ...place(545, 8), ...fs(15, 12), translate: "-50% 0" }}
        >
          {count}
        </motion.span>

        <Ledger p={p} onPick={pick} />

        <ReplayButton onClick={play} disabled={still} style={place(1124, 12)} />
        <StylisedTag style={{ ...place(900, 588, 260), ...fs(12, 12), textAlign: "right" }} />
      </ArtBox>
    </MemoryShell>
  );
}
