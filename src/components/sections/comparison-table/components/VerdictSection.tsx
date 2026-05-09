"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { VERDICT_POINTS } from "@/data/comparison";

export default function VerdictSection() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      id="verdict"
      className="mt-16"
    >
      <motion.div variants={fadeUp} className="text-center mb-10">
        <span className="inline-block text-sm font-semibold uppercase tracking-widest text-brand-cyan/80 mb-3">
          TL;DR
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Why choose Personas?
        </h3>
        <p className="mt-3 text-base text-muted max-w-xl mx-auto font-light leading-relaxed">
          The bottom line across {40}+ features compared above.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {VERDICT_POINTS.map((point) => (
          <motion.div
            key={point.title}
            variants={fadeUp}
            className="group relative rounded-2xl border border-glass-hover bg-black/40 backdrop-blur-xl p-6 transition-colors hover:border-glass-strong"
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-[0.06] transition-opacity group-hover:opacity-[0.10]"
              style={{
                backgroundImage: `radial-gradient(ellipse at top left, ${point.color}, transparent 70%)`,
              }}
            />
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${point.color}20` }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: point.color }} />
                </div>
                <h4
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: point.color }}
                >
                  {point.title}
                </h4>
              </div>
              <p className="text-sm text-muted leading-relaxed font-light pl-9">
                {point.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
