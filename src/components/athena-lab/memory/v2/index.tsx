"use client";

import { useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import LabShell from "../shared/LabShell";
import { MONO, fsOf } from "../shared/frame";
import { useLabClock } from "../shared/useLabClock";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt, statusKeyAt } from "./data";
import Flights from "./Flights";
import { compactGeo, wideGeo, type Words } from "./geometry";
import Rows from "./Rows";
import Tray from "./Tray";

/**
 * Memory lab, v2 - "Say it once".
 *
 * A different direction for "the more she carries": instead of showing her
 * memory grow, show YOUR effort shrink. The same request three times, months
 * apart. On day one you spell everything out - the ask and four details. By
 * week three you only add the two she does not have yet. By month two three
 * words are enough, and everything she carries flows back into the reply.
 *
 * The staircase of shrinking messages on the left and the column filling on
 * the right are one quantity seen from both sides: every detail that stops
 * appearing in your message appears, in her own words, in what she carries -
 * sorted into the three things the claim names (what you prefer, what worked,
 * what you decided). It is the benefit the visitor buys, made literal: you
 * stop repeating yourself.
 *
 * Deterministic tick clock (`./data`), in-view gate with rewind, reduced
 * motion pins the hold frame (`../shared/useLabClock`).
 */
export default function MemoryLabSayItOnce() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const c = t.athenaLab.memory.v2;
  const sectionRef = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useLabClock(sectionRef, {
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const scene = sceneAt(phase);
  const words: Words = { ask: c.ask, brief: c.brief, phrases: c.phrases, kept: t.athenaPage.memory.kept };
  const geo = compact ? compactGeo(words) : wideGeo(words);
  const key = statusKeyAt(phase);
  const status = key === "carries" ? t.athenaPage.memory.status.carries : c.status[key];
  const statusShort = key === "carries" ? t.athenaPage.memory.status.carriesShort : c.status[`${key}Short`];

  return (
    <LabShell
      sectionRef={sectionRef}
      artLabel={c.artLabel}
      ar={geo.W / geo.H}
      compactAr={geo.W / geo.H}
      compact={compact}
      status={status}
      statusShort={statusShort}
      steady={scene.holding}
      reduced={reduced}
    >
      <Rows geo={geo} words={words} scene={scene} reduced={reduced} />
      <Tray geo={geo} words={words} scene={scene} reduced={reduced} />
      <Flights geo={geo} scene={scene} compact={compact} reduced={reduced} />
      <span
        className={`absolute bottom-0 right-0 text-muted-dark ${MONO}`}
        style={fsOf(geo.W)(11, 12)}
        aria-hidden="true"
      >
        {t.athenaLab.memory.stylised}
      </span>
    </LabShell>
  );
}
