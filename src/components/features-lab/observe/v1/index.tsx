"use client";

import { useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import type { OverviewModule } from "@/components/feature-sections/observability-deck/types";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro } from "../shared/Stage";
import { useClock, usePlay } from "../shared/motion";
import DeckArt from "./DeckArt";
import DeckWords from "./DeckWords";
import Rails from "./Rail";
import { H, LAP_S, REST, W } from "./data";

/**
 * Features lab - See everything, miss nothing, V1 "Lit deck": the direct
 * successor of the live pulse grid. Same deck, same eight module tags (they
 * still filter), same lanes, counts and spend; upgraded into a lit glass
 * instrument where every span is drawn to its length and cost, born at a glowing
 * "now" seam and drifting left as time passes. The lap stops off-screen, in a
 * hidden tab and under reduced motion (which rests on a full frame).
 */
export default function LabVariant() {
  const c = useTranslation().t.featuresLab.observe.v1;
  const ref = useRef<HTMLDivElement>(null);
  const { p, still } = usePlay(ref, 2.6);
  const clock = useClock(ref, REST * LAP_S);
  const lap = useTransform(clock, (s) => (s / LAP_S) % 1);
  const [active, setActive] = useState<OverviewModule | null>(null);
  const titles = useTranslation().t.observeSection.modules;

  const toggle = (m: OverviewModule) => setActive((prev) => (prev?.id === m.id ? null : m));
  const filter = active?.filterPrefix ?? null;

  return (
    <SectionWrapper fit="fill" id="observe">
      <motion.div variants={fadeUp}>
        <Intro lede={c.lede} />
      </motion.div>
      <ArtBox w={W} h={H} boxRef={ref}>
        <DeckArt lap={lap} p={p} filter={filter} label={c.artLabel} />
        <DeckWords
          clock={clock}
          lap={lap}
          p={p}
          still={still}
          filter={filter}
          filterName={active ? titles[active.id].title : null}
          onClear={() => setActive(null)}
        />
        <Rails activeId={active?.id ?? null} onToggle={toggle} p={p} />
      </ArtBox>
    </SectionWrapper>
  );
}
