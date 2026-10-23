"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useWide } from "@/components/sections/growth-dial/shared/useWide";
import { SHOWCASE_COUNTS, pluginsIntro } from "@/components/feature-sections/plugins/roster";
import { DEFAULT_LAB_PLUGIN, LAB_PLUGINS, pluginTagline, type LabPluginKey } from "./shared/roster";
import Cartridge, { CARTRIDGE_GAP } from "./Cartridge";
import PluginWindow from "./PluginWindow";
import ReachPlate from "./ReachPlate";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/**
 * Everything to plug in - the plug-in bay (winner of the 2026-10-06 /features
 * review). Every plugin the desktop ships is a cartridge that seats into a lit
 * window, and each one has its own scene there: the Dev Tools fleet, the
 * Obsidian Brain graph, the Drive drawer and the Twin mirroring one message
 * across channels. The connector catalog sits under the cartridges.
 */
export default function Plugins() {
  const { t, language } = useTranslation();
  const copy = t.pluginShowcase;
  const still = useStillMotion();
  // At the desktop stage the cartridges seat sideways into the window; below
  // it the bay stacks (cartridges over a full-width window) and they do not.
  const wide = useWide();
  const [active, setActive] = useState<LabPluginKey>(DEFAULT_LAB_PLUGIN);
  const plugin = LAB_PLUGINS.find((p) => p.key === active) ?? LAB_PLUGINS[0];
  // Every shipped plugin is on stage, so the intro's two counts come from the
  // bay roster (on stage) and the desktop manifest (shipped).
  const intro = pluginsIntro(copy, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped, (n) => n.toLocaleString(language));

  return (
    <SectionWrapper fit="min" id="plugins">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <SectionIntro heading={copy.heading} gradient={copy.headingGradient} description={intro} descriptionMaxWidth="max-w-3xl" className="mb-0" />
      </motion.div>

      <motion.div
        data-tour-diagram="plugins"
        data-stage-body
        data-stage-fixed
        role="group"
        aria-label={featuresSectionsCopy.plugins.v1.artLabel}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: still ? 0 : 0.6 }}
        className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col gap-6 pb-8 lg:flex-row lg:items-stretch lg:gap-[26px] stage:mt-[2.4svh]"
      >
        <div className="flex w-full flex-col gap-4 lg:w-[290px] lg:shrink-0 lg:gap-0">
          <div role="group" aria-label={copy.tabsLabel} className="grid grid-cols-2 lg:flex lg:flex-col" style={{ gap: CARTRIDGE_GAP }}>
            {LAB_PLUGINS.map((p) => (
              <Cartridge
                key={p.key}
                plugin={p}
                tagline={pluginTagline(t, p.copyKey)}
                active={p.key === plugin.key}
                still={still}
                seat={wide}
                onSelect={() => setActive(p.key)}
              />
            ))}
          </div>
          <div className="mt-auto">
            <ReachPlate />
          </div>
        </div>
        <PluginWindow plugins={LAB_PLUGINS} plugin={plugin} tagline={pluginTagline(t, plugin.copyKey)} still={still} />
      </motion.div>
    </SectionWrapper>
  );
}
