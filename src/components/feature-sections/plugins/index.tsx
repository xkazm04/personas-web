"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { PLUGINS } from "./data";
import { DEFAULT_SHOWCASE_KEY, SHOWCASE_INTRO } from "./roster";
import type { PluginKey } from "./types";
import PluginTabs from "./components/PluginTabs";
import PluginCard from "./components/PluginCard";

export default function Plugins() {
  const [active, setActive] = useState<PluginKey>(DEFAULT_SHOWCASE_KEY);

  const [variantByPlugin, setVariantByPlugin] = useState<
    Record<PluginKey, string>
  >(
    () =>
      Object.fromEntries(PLUGINS.map((p) => [p.key, p.variants[0].key])) as Record<
        PluginKey,
        string
      >,
  );

  const activePlugin = PLUGINS.find((p) => p.key === active)!;
  const activeVariantKey = variantByPlugin[active];
  const activeVariant =
    activePlugin.variants.find((v) => v.key === activeVariantKey) ??
    activePlugin.variants[0];

  const setVariantFor = (plugin: PluginKey, variantKey: string) => {
    setVariantByPlugin((prev) => ({ ...prev, [plugin]: variantKey }));
  };

  return (
    <SectionWrapper id="plugins">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading="Everything to"
          gradient="plug in"
          description={SHOWCASE_INTRO}
          className="mb-0"
        />
      </motion.div>

      <div data-tour-diagram="plugins">
        <PluginTabs plugins={PLUGINS} active={active} onSelect={setActive} />

        <PluginCard
          plugins={PLUGINS}
          activePlugin={activePlugin}
          active={active}
          activeVariant={activeVariant}
          activeVariantKey={activeVariantKey}
          setVariantFor={setVariantFor}
        />
      </div>
    </SectionWrapper>
  );
}
