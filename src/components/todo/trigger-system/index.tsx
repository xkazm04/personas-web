"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { triggers } from "./data";
import TriggerWheel from "./components/TriggerWheel";
import TriggerDetail from "./components/TriggerDetail";

export default function TriggerSystem() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTrigger, setActiveTrigger] = useState<number>(0);
  const [firing, setFiring] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fire = useCallback(() => {
    const idx = Math.floor(Math.random() * triggers.length);
    setFiring(idx);
    setActiveTrigger(idx);
    setTimeout(() => setFiring(null), 1000);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        fire();
        schedule();
      }, 3000 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [fire, prefersReducedMotion]);

  const handleSelect = useCallback((i: number) => {
    setActiveTrigger(i);
    setFiring(null);
  }, []);

  return (
    <SectionWrapper id="triggers">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading="Runs when and how"
          gradient="you"
          trailing=" want"
          description="On a schedule, when a file changes, when you copy something, or when another agent finishes — eight flexible ways to start your agents. Mix and match for any workflow."
          descriptionMaxWidth="max-w-xl"
          className="mb-0"
        />
      </motion.div>

      <div className="mt-16 mx-auto max-w-5xl grid gap-10 lg:gap-24 lg:grid-cols-[auto_1fr] items-center">
        <TriggerWheel
          triggers={triggers}
          activeTrigger={activeTrigger}
          firing={firing}
          onSelect={handleSelect}
        />
        <TriggerDetail
          triggers={triggers}
          activeTrigger={activeTrigger}
          onSelect={handleSelect}
        />
      </div>
    </SectionWrapper>
  );
}
