"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro } from "../shared/Stage";
import { useClock } from "../shared/motion";
import FleetCables from "./FleetCables";
import Statement from "./Statement";
import Tape from "./Tape";
import { H, REST_S, W } from "./log";

/**
 * Features lab - See everything, miss nothing, V3 "On the record": observability
 * as an audit trail. Six agents feed one printer by cable; every run prints a
 * line on a rising paper tape - time, the real tool it touched, what it did, what
 * it cost - and failures, recoveries and your sign-offs are stamped on as they
 * come out, while the day's statement keeps the totals. Pick an agent to isolate
 * its lines. The printer stops off-screen, in a hidden tab and under reduced
 * motion (which rests on a full tape with every stamp in view).
 */
export default function LabVariant() {
  const c = useTranslation().t.featuresLab.observe.v3;
  const ref = useRef<HTMLDivElement>(null);
  const clock = useClock(ref, REST_S);
  const [agent, setAgent] = useState<number | null>(null);

  return (
    <SectionWrapper fit="fill" id="observe">
      <motion.div variants={fadeUp}>
        <Intro lede={c.lede} />
      </motion.div>
      <ArtBox w={W} h={H} boxRef={ref}>
        <FleetCables clock={clock} agent={agent} onPick={setAgent} label={c.artLabel} />
        <Tape clock={clock} agent={agent} />
        <Statement clock={clock} agent={agent} />
      </ArtBox>
    </SectionWrapper>
  );
}
