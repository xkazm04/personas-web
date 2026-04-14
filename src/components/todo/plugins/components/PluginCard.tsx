"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PluginDef, PluginKey, VariantDef } from "../types";

interface PluginCardProps {
  plugins: PluginDef[];
  activePlugin: PluginDef;
  active: PluginKey;
  activeVariant: VariantDef;
  activeVariantKey: string;
  setVariantFor: (plugin: PluginKey, variantKey: string) => void;
}

export default function PluginCard({
  plugins,
  activePlugin,
  active,
  activeVariant,
  activeVariantKey,
  setVariantFor,
}: PluginCardProps) {
  const PluginIcon = activePlugin.icon;
  const Variant = activeVariant.component;
  const hasMultipleVariants = activePlugin.variants.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-8 mx-auto max-w-4xl"
    >
      <div className="force-dark rounded-2xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${activePlugin.color}18` }}
            >
              <PluginIcon className="h-5 w-5" style={{ color: activePlugin.color }} />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">
                {activePlugin.label}
              </div>
              <div className="text-base font-mono text-foreground/65">
                {activePlugin.tagline}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-base font-mono uppercase tracking-wider text-foreground/60">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: activePlugin.color }}
            />
            plugin {plugins.findIndex((p) => p.key === active) + 1} of {plugins.length}
          </div>
        </div>

        {hasMultipleVariants && (
          <div className="flex items-center justify-between border-b border-foreground/[0.06] px-5 py-2.5 bg-foreground/[0.02]">
            <div className="flex items-center gap-1 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] p-1">
              {activePlugin.variants.map((v) => {
                const isActiveVariant = activeVariantKey === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setVariantFor(active, v.key)}
                    aria-pressed={isActiveVariant}
                    className={`rounded-md px-3 py-1.5 text-base font-medium transition-all duration-200 ${
                      isActiveVariant
                        ? "bg-foreground/[0.1] text-foreground shadow-sm"
                        : "text-foreground/60 hover:text-foreground/85 hover:bg-foreground/[0.05]"
                    }`}
                    style={{
                      color: isActiveVariant ? activePlugin.color : undefined,
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
            <div className="text-base font-mono uppercase tracking-widest text-foreground/55 hidden sm:block">
              {activeVariant.blurb}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${activeVariantKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Variant />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
