"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useLoopGate } from "@/hooks/useLoopGate";
import { fillTemplate } from "@/lib/fillTemplate";
import { DEFAULT_LAB_PLUGIN, LAB_PLUGINS, type LabPluginKey } from "../shared/roster";
import { CONNECTOR_COUNT } from "../shared/catalog";
import { BOX } from "./geometry";
import IsoStack from "./IsoStack";
import Callouts from "./Callouts";
import { KEY_COUNT } from "./LayerContents";

const REACH_MS = 1100;
const STILL_STEP = 3;
/** Three keycaps lit per beat, spread across the plate. */
const litAt = (step: number) => new Set([0, 13, 25].map((o) => (step * 7 + o) % KEY_COUNT));

/**
 * V3 - the exploded view. Personas drawn as a stack you can see through:
 * your agents on the base plate, the four shipped plugins as blocks on the
 * plate above, the connector catalog as keycaps on top. The stack arrives
 * closed and opens once; choosing a plugin raises its block and stands a
 * column of light through all three layers.
 */
export default function PluginsLabV3() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { run, still } = useLoopGate(rootRef);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });
  const [active, setActive] = useState<LabPluginKey>(DEFAULT_LAB_PLUGIN);
  const [step, setStep] = useState(STILL_STEP);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setStep((s) => s + 1), REACH_MS);
    return () => clearInterval(id);
  }, [run]);

  const lede = fillTemplate(t.featuresLab.plugins.lede, { plugins: LAB_PLUGINS.length, connectors: CONNECTOR_COUNT });

  return (
    <SectionWrapper fit="min" id="plugins">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <SectionIntro heading={t.pluginShowcase.heading} gradient={t.pluginShowcase.headingGradient} description={lede} descriptionMaxWidth="max-w-3xl" className="mb-0" />
      </motion.div>

      <div
        ref={rootRef}
        data-tour-diagram="plugins"
        data-stage-fixed
        role="group"
        aria-label={t.featuresLab.plugins.v3.artLabel}
        className="relative mx-auto mt-4 stage:mt-[1.2svh]"
        style={{ width: BOX.w, height: BOX.h, maxWidth: "100%" }}
      >
        <IsoStack plugins={LAB_PLUGINS} active={active} exploded={inView} lit={litAt(run ? step : STILL_STEP)} run={run} still={still} />
        <Callouts plugins={LAB_PLUGINS} active={active} onSelect={setActive} exploded={inView} still={still} />
      </div>
    </SectionWrapper>
  );
}
