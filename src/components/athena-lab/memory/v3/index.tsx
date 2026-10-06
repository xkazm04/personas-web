"use client";

import { useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import LabShell from "../shared/LabShell";
import { MONO, fsOf } from "../shared/frame";
import { useLabClock } from "../shared/useLabClock";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt, statusKeyAt } from "./data";
import Fog from "./Fog";
import { COMPACT_MAP, WIDE_MAP } from "./geometry";
import Ledger from "./Ledger";
import Notes from "./Notes";
import Route from "./Route";
import Terrain from "./Terrain";
import Traveler from "./Traveler";

/**
 * Memory lab, v3 - "The map of how you work".
 *
 * A third direction for "the more she carries": what she carries is a MAP of
 * how you work - and you can watch it being drawn. The same errand, run twice.
 * The first time the map is fog: she stops at every turn to ask you something
 * (when do you ship, where do we try it, anything sensitive, long or short),
 * and every answer clears the fog around one landmark, which keeps her note of
 * it. A month later she runs the same road end to end without stopping, each
 * landmark flaring as she uses it, and the ledger in the corner reads 4, then 0.
 *
 * Not growth drawn as accumulation (v1's shelf) or as your effort shrinking
 * (v2's messages) but as KNOWN TERRITORY: the benefit is that she stops
 * having to ask.
 *
 * Layers, back to front: terrain, fog, route + ends, words, Athena, ledger.
 * Deterministic tick clock (`./data`); reduced motion pins the hold frame.
 */
export default function MemoryLabMap() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const c = t.athenaLab.memory.v3;
  const sectionRef = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useLabClock(sectionRef, {
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const scene = sceneAt(phase);
  const geo = compact ? COMPACT_MAP : WIDE_MAP;
  const key = statusKeyAt(phase);
  const status = key === "carries" ? t.athenaPage.memory.status.carries : c.status[key];
  const statusShort = key === "carries" ? t.athenaPage.memory.status.carriesShort : c.status[`${key}Short`];

  return (
    <LabShell
      sectionRef={sectionRef}
      artLabel={c.artLabel}
      ar={WIDE_MAP.W / WIDE_MAP.H}
      compactAr={COMPACT_MAP.W / COMPACT_MAP.H}
      compact={compact}
      status={status}
      statusShort={statusShort}
      steady={scene.holding}
      reduced={reduced}
    >
      <Terrain geo={geo} marks={scene.marks} holding={scene.holding} />
      <Fog geo={geo} marks={scene.marks} reduced={reduced} />
      <Route geo={geo} scene={scene} reduced={reduced} />
      <Notes geo={geo} marks={scene.marks} reduced={reduced} />
      <Traveler geo={geo} scene={scene} reduced={reduced} />
      <Ledger geo={geo} scene={scene} />
      <span
        className={`absolute bottom-[3%] text-muted-dark ${compact ? "left-[4%]" : "right-[2.5%]"} ${MONO}`}
        style={fsOf(geo.W)(11, 12)}
        aria-hidden="true"
      >
        {t.athenaLab.memory.stylised}
      </span>
    </LabShell>
  );
}
