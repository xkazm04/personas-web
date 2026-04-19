"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import GradientText from "@/components/GradientText";
import { fadeIn, fadeUp } from "@/lib/animations";
import type { ViewerRole } from "@/components/RoleSelector";
import type { RoleCopy } from "../types";

export default function ScenarioHeader({
  copy,
  role,
}: {
  copy: RoleCopy;
  role?: ViewerRole;
}) {
  const shouldReduceMotion = useReducedMotion();
  const y = shouldReduceMotion ? 0 : 6;
  const dur = shouldReduceMotion ? 0 : 0.25;

  return (
    <motion.div variants={shouldReduceMotion ? fadeIn : fadeUp} className="text-center relative z-10">
      <AnimatePresence mode="wait">
        <motion.p
          key={copy.tagline}
          initial={{ opacity: 0, y }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
          transition={{ duration: dur }}
          className="text-xl italic text-muted-dark mb-8 font-light tracking-wide"
        >
          {copy.tagline}
        </motion.p>
      </AnimatePresence>
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
        Why agents,{" "}
        <span className="font-black text-brand-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
          not
        </span>{" "}
        <GradientText className="drop-shadow-lg">workflows</GradientText>
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={copy.subtitle}
          initial={{ opacity: 0, y }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
          transition={{ duration: dur, delay: shouldReduceMotion ? 0 : 0.05 }}
          className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light"
        >
          {copy.subtitle}
        </motion.p>
      </AnimatePresence>
      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={role ?? "developer"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {copy.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-glass-hover bg-white/3 px-4 py-2 text-base font-mono tracking-wider text-muted backdrop-blur-sm transition-colors hover:bg-white/8 hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
