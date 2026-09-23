"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { PLUGINS } from "./data";
import { DEFAULT_SHOWCASE_KEY, SHOWCASE_COUNTS, pluginsIntro } from "./roster";
import type { PluginKey } from "./types";
import PluginTabs from "./components/PluginTabs";
import PluginCard from "./components/PluginCard";

export default function Plugins() {
  const { t, language } = useTranslation();
  const copy = t.pluginShowcase;
  const intro = pluginsIntro(copy, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped, (n) =>
    n.toLocaleString(language),
  );
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
          heading={copy.heading}
          gradient={copy.headingGradient}
          description={intro}
          className="mb-0"
        />
      </motion.div>

      <div data-tour-diagram="plugins">
        <PluginTabs
          plugins={PLUGINS}
          active={active}
          onSelect={setActive}
          copy={copy}
        />

        <PluginCard
          plugins={PLUGINS}
          activePlugin={activePlugin}
          active={active}
          activeVariant={activeVariant}
          activeVariantKey={activeVariantKey}
          setVariantFor={setVariantFor}
          copy={copy}
        />
      </div>
    </SectionWrapper>
  );
}
