"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import Ambience from "./Ambience";
import TypewriterLine from "./Typewriter";
import Proofs from "./Proofs";

/* Statement and proofs share three equal rows on the stage, so each proof sits
 * level with the line it proves. The statement is sized from the slot (a size
 * container): as large as the column's width and the row's height allow. */
const ROWS = "stage:grid stage:h-full stage:grid-rows-3";

/**
 * /how manifesto - "Your agents. Your rules. Your infrastructure." typed in at
 * display size over the ambient gradient and particles, each line with a short
 * visual proof beside it: an agent described in plain words, a dial for how
 * far agents may go, and keys that stay on your own computer.
 */
export default function HowManifesto() {
  const m = useTranslation().t.howSections.manifesto;

  return (
    <SectionWrapper fit="fill" id="manifesto" aria-label={m.aria} className="overflow-clip">
      <Ambience />
      <motion.div variants={fadeUp} data-section-intro className="relative mb-10 text-center">
        <p data-section-eyebrow className="font-semibold uppercase tracking-widest text-brand-cyan">
          {m.eyebrow}
        </p>
      </motion.div>
      <div data-stage-slot className="relative">
        <div className="grid gap-10 stage:h-full stage:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] stage:gap-[clamp(2rem,5cqw,5rem)]">
          <h2
            className={`flex flex-col gap-3 text-[clamp(2rem,9vw,2.6rem)] font-black leading-[1.08] tracking-tight sm:text-6xl stage:gap-0 stage:text-[min(5cqw,11cqh,7.5rem)] ${ROWS}`}
          >
            <span className="flex items-center">
              <TypewriterLine text={m.lines.agents} accent={BRAND_VAR.cyan} baseDelay={0.05} className="text-foreground" />
            </span>
            <span className="flex items-center">
              <TypewriterLine text={m.lines.rules} accent={BRAND_VAR.purple} baseDelay={0.55} className="text-foreground/85" />
            </span>
            <span className="flex items-center">
              <TypewriterLine
                text={m.lines.infra}
                accent={BRAND_VAR.emerald}
                baseDelay={1.05}
                className="font-light tracking-wide text-muted"
                pulseAfter
              />
            </span>
          </h2>
          <Proofs className={`flex flex-col gap-4 stage:gap-0 ${ROWS}`} />
        </div>
      </div>
    </SectionWrapper>
  );
}
