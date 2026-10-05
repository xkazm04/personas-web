"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useLoopGate } from "@/hooks/useLoopGate";
import { fillTemplate } from "@/lib/fillTemplate";
import { DEFAULT_LAB_PLUGIN, LAB_PLUGINS, type LabPluginKey } from "../shared/roster";
import { CONNECTOR_COUNT } from "../shared/catalog";
import Display from "./Display";
import Strip from "./Strip";
import { CABLE, PLUG_RISE } from "./Plug";

/** Each scene's beat, and the frame it holds when motion is reduced or off screen. */
const BEAT_MS: Record<LabPluginKey, number> = { "dev-tools": 650, "obsidian-brain": 1700, drive: 950, twin: 2300 };
const STILL_STEP: Record<LabPluginKey, number> = { "dev-tools": 9, "obsidian-brain": 1, drive: 4, twin: 1 };

/**
 * V2 - the power strip. "Everything to plug in", taken literally: Personas
 * is the strip, every shipped plugin is a plug seated in it, and the
 * connector catalog fills the rest of the sockets. Plugs drop in one by one
 * on arrival; pressing one lights its cable into the display above, which
 * shows what that plugin adds, drawn at work.
 */
export default function PluginsLabV2() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { run, still } = useLoopGate(rootRef);
  const [active, setActive] = useState<LabPluginKey>(DEFAULT_LAB_PLUGIN);
  const [step, setStep] = useState(0);
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    setStep(0);
  }

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setStep((s) => s + 1), BEAT_MS[active]);
    return () => clearInterval(id);
  }, [run, active]);

  const index = LAB_PLUGINS.findIndex((p) => p.key === active);
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
        aria-label={t.featuresLab.plugins.v2.artLabel}
        className="mx-auto mt-8 w-full max-w-[1120px] pb-6 pl-6 stage:mt-[2.4svh]"
      >
        <Display
          plugin={LAB_PLUGINS[index]}
          index={index}
          total={LAB_PLUGINS.length}
          step={run ? step : STILL_STEP[active]}
          run={run}
          still={still}
        />
        <div style={{ marginTop: PLUG_RISE + CABLE }}>
          <Strip plugins={LAB_PLUGINS} active={active} onSelect={setActive} run={run} still={still} />
        </div>
      </div>
    </SectionWrapper>
  );
}
