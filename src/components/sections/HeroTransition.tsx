"use client";

import { motion } from "framer-motion";
import { ArrowDown, Zap, Shield, Layers } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";

const pillars = [
  { icon: Zap, key: "speed" as const },
  { icon: Shield, key: "privacy" as const },
  { icon: Layers, key: "scale" as const },
];

export default function HeroTransition() {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t.heroTransition.ariaLabel}
      className="relative z-10 -mt-20 pb-8 pt-24"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={staggerContainer}
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          {pillars.map(({ icon: Icon, key }) => (
            <span
              key={key}
              className="flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/3 px-3 py-1.5 text-sm font-mono tracking-wide text-muted-dark"
            >
              <Icon className="h-3.5 w-3.5 text-brand-cyan opacity-70" />
              {t.heroTransition[key]}
            </span>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-lg text-muted-dark leading-relaxed font-light"
        >
          {t.heroTransition.value}
        </motion.p>

        <motion.a
          variants={fadeUp}
          href="#use-cases"
          className="group inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-6 py-2.5 text-sm font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--brand-cyan)_15%,transparent)] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none"
        >
          {t.heroTransition.cta}
          <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
        </motion.a>
      </motion.div>
    </section>
  );
}
