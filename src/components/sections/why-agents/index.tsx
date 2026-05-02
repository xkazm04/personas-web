"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import ImageBackground from "@/components/ImageBackground";
import type { ViewerRole } from "@/components/RoleSelector";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { useMaxScrollHeight } from "@/hooks/useMaxScrollHeight";
import { CYCLE_MS, defaultCopy, roleCopy, scenarios } from "./data";
import ScenarioHeader from "./components/ScenarioHeader";
import ScenarioSelector from "./components/ScenarioSelector";
import ScenarioDuel from "./components/ScenarioDuel";
import ScenarioProgress from "./components/ScenarioProgress";
import WorkflowPanel from "./components/WorkflowPanel";
import AgentPanel from "./components/AgentPanel";

export default function WhyAgents({ role }: { role?: ViewerRole }) {
  const copy = role ? roleCopy[role] : defaultCopy;
  const {
    active: activeIndex,
    setActive: setActiveIndex,
    paused,
    setPaused,
  } = useAutoCycle({
    count: scenarios.length,
    intervalMs: CYCLE_MS,
    respectReducedMotion: false,
  });
  const measureRef = useRef<HTMLDivElement>(null);
  // Measure the tallest workflow/agent panel across all scenarios so the
  // visible duel reserves enough vertical space and doesn't jump on
  // scenario change. ResizeObserver-backed so font-load and viewport
  // zoom keep heights fresh.
  const measuredWfHeight = useMaxScrollHeight(measureRef, "[data-measure-wf]");
  const measuredAgHeight = useMaxScrollHeight(measureRef, "[data-measure-ag]");

  const scenario = scenarios[activeIndex];

  return (
    <SectionWrapper
      id="why-agents"
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Why agents not workflows — scenario comparison"
    >
      <ImageBackground
        src="/imgs/illustration_photo.jpg"
        alt="Personas agent roster"
        overlayClass="bg-black/70"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgIBBAMBAAAAAAAAAAAAAQIAAwQFERIhBjFBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAYEQADAQEAAAAAAAAAAAAAAAABAgMAEf/aAAwDAQACEQMRAD8AyTDw8nPyFx8WprLG6KoJLH4BLPp3h+T6ULaW/wBJZX1sVh7XjuIiVeli5Ef/2Q=="
      />

      <ScenarioHeader copy={copy} role={role} />

      <ScenarioSelector
        scenarios={scenarios}
        activeIndex={activeIndex}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
      />

      <div aria-live="polite" aria-atomic="true" className="mt-6 mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id + "-trigger"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-glass bg-white/[0.02] px-4 py-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Mail className="h-3 w-3 text-muted-dark" aria-hidden="true" />
                <span className="text-base font-mono uppercase tracking-wider text-muted-dark">
                  Incoming scenario
                </span>
              </div>
              <p className="text-base text-muted leading-relaxed">
                {scenario.trigger}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ScenarioDuel
        activeIndex={activeIndex}
        total={scenarios.length}
        scenario={scenario}
        wfMinH={measuredWfHeight}
        agMinH={measuredAgHeight}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      />

      <ScenarioProgress
        scenarios={scenarios}
        activeIndex={activeIndex}
        paused={paused}
        scenarioId={scenario.id}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
        onTogglePause={() => setPaused((v) => !v)}
      />

      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-50 w-full overflow-hidden opacity-0"
        style={{ visibility: "hidden" }}
      >
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div>
            {scenarios.map((s) => (
              <div key={s.id + "-mw"} data-measure-wf>
                <WorkflowPanel scenario={s} />
              </div>
            ))}
          </div>
          <div>
            {scenarios.map((s) => (
              <div key={s.id + "-ma"} data-measure-ag>
                <AgentPanel scenario={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
