"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro } from "../shared/Stage";
import FleetStrip from "./FleetStrip";
import StepCard from "./StepCard";
import WaterfallArt from "./WaterfallArt";
import WaterfallWords from "./WaterfallWords";
import { H, RUNS, W } from "./runs";
import { useRunPlayer } from "./useRunPlayer";

/**
 * Features lab - See everything, miss nothing, V2 "Open any run": observability
 * as depth. Today's runs sit in a strip; one opens (a lit wedge drops from its
 * capsule) into its trace - every model call, tool call, failure, retry and
 * approval on a seconds axis - and the step under the playhead opens into a
 * card with its duration, cost and tokens. The walk advances run to run; press
 * a step to pin it, a capsule to open that run. Stops off-screen, in a hidden
 * tab and under reduced motion (which rests on a complete, focused trace).
 */
export default function LabVariant() {
  const c = useTranslation().t.featuresLab.observe.v2;
  const ref = useRef<HTMLDivElement>(null);
  const { run: ri, t, focus, pinned, open, pin, unpin, still } = useRunPlayer(ref);
  const run = RUNS[ri];

  return (
    <SectionWrapper fit="fill" id="observe">
      <motion.div variants={fadeUp}>
        <Intro lede={c.lede} />
      </motion.div>
      <ArtBox w={W} h={H} boxRef={ref}>
        <FleetStrip run={ri} onOpen={open} still={still} />
        <WaterfallArt run={run} t={t} focus={focus} label={c.artLabel} />
        <WaterfallWords run={run} ri={ri} t={t} focus={focus} pinned={pinned} onPin={pin} onFleet={unpin} onReplay={() => open(ri)} />
        <StepCard run={run} focus={focus} pinned={pinned !== null} still={still} t={t} />
      </ArtBox>
    </SectionWrapper>
  );
}
