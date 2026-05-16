"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { PLUGINS } from "./data";
import type { PluginKey } from "./types";
import PluginTabs from "./components/PluginTabs";
import PluginCard from "./components/PluginCard";

export default function Plugins() {
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState<PluginKey>("dev-tools");

  const [variantByPlugin, setVariantByPlugin] = useState<
    Record<PluginKey, string>
  >(
    () =>
      Object.fromEntries(PLUGINS.map((p) => [p.key, p.variants[0].key])) as Record<
        PluginKey,
        string
      >,
  );

  const [userOverride, setUserOverride] = useState(false);
  useEffect(() => {
    if (reduced || userOverride) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const i = PLUGINS.findIndex((p) => p.key === prev);
        return PLUGINS[(i + 1) % PLUGINS.length].key;
      });
    }, 12000);
    return () => clearInterval(id);
  }, [reduced, userOverride]);

  const activePlugin = PLUGINS.find((p) => p.key === active)!;
  const activeVariantKey = variantByPlugin[active];
  const activeVariant =
    activePlugin.variants.find((v) => v.key === activeVariantKey) ??
    activePlugin.variants[0];

  const setVariantFor = (plugin: PluginKey, variantKey: string) => {
    setVariantByPlugin((prev) => ({ ...prev, [plugin]: variantKey }));
  };

  const handleSelect = (key: PluginKey) => {
    setActive(key);
    setUserOverride(true);
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
          description="Six purpose-built plugins shipped with Personas. Each one is a self-contained workspace your agents can drive, reuse shared credentials, and compose together. Switch a tab, meet a new specialist."
          className="mb-0"
        />
      </motion.div>

      <PluginTabs plugins={PLUGINS} active={active} onSelect={handleSelect} />

      <PluginCard
        plugins={PLUGINS}
        activePlugin={activePlugin}
        active={active}
        activeVariant={activeVariant}
        activeVariantKey={activeVariantKey}
        setVariantFor={setVariantFor}
      />
    </SectionWrapper>
  );
}
