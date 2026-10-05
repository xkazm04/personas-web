"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { SHOWCASE_COUNTS, SHOWCASE_KEYS, pluginsIntro } from "@/components/feature-sections/plugins/roster";
import { DEFAULT_LAB_PLUGIN, LAB_PLUGINS, pluginTagline, type LabPluginKey } from "../shared/roster";
import Cartridge, { CARTRIDGE_GAP } from "./Cartridge";
import PluginWindow from "./PluginWindow";
import ReachPlate from "./ReachPlate";
import AlsoShips from "./AlsoShips";

/** The live showcase's roster (the plugins that have a demo), in stage order. */
const SHOWN = LAB_PLUGINS.filter((p) => (SHOWCASE_KEYS as readonly string[]).includes(p.key));
/** Shipped plugins the showcase has no demo for yet: named, not staged. */
const SPARE = LAB_PLUGINS.filter((p) => !SHOWN.includes(p));

/**
 * V1 - the plug-in bay. The live section's mechanism kept whole (tabs that
 * switch a window between the Dev Tools fleet and the Obsidian Brain graph,
 * same clocks, same copy), rebuilt as hardware: the tabs become cartridges
 * that seat into a lit window, and the connector catalog sits under them.
 */
export default function PluginsLabV1() {
  const { t, language } = useTranslation();
  const copy = t.pluginShowcase;
  const still = useStillMotion();
  const [active, setActive] = useState<LabPluginKey>(DEFAULT_LAB_PLUGIN);
  const plugin = SHOWN.find((p) => p.key === active) ?? SHOWN[0];
  const intro = pluginsIntro(copy, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped, (n) => n.toLocaleString(language));

  return (
    <SectionWrapper fit="min" id="plugins">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <SectionIntro heading={copy.heading} gradient={copy.headingGradient} description={intro} descriptionMaxWidth="max-w-3xl" className="mb-0" />
      </motion.div>

      <motion.div
        data-tour-diagram="plugins"
        data-stage-fixed
        role="group"
        aria-label={t.featuresLab.plugins.v1.artLabel}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: still ? 0 : 0.6 }}
        className="mx-auto mt-8 flex w-full max-w-[1120px] items-stretch gap-[26px] pb-8 stage:mt-[2.4svh]"
      >
        <div className="flex w-[290px] shrink-0 flex-col">
          <div role="group" aria-label={copy.tabsLabel} className="flex flex-col" style={{ gap: CARTRIDGE_GAP }}>
            {SHOWN.map((p) => (
              <Cartridge
                key={p.key}
                plugin={p}
                tagline={pluginTagline(t, p.copyKey)}
                active={p.key === plugin.key}
                still={still}
                onSelect={() => setActive(p.key)}
              />
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <AlsoShips plugins={SPARE} label={t.featuresLab.plugins.v1.alsoShips} />
            <ReachPlate />
          </div>
        </div>
        <PluginWindow plugins={SHOWN} plugin={plugin} tagline={pluginTagline(t, plugin.copyKey)} still={still} />
      </motion.div>
    </SectionWrapper>
  );
}
