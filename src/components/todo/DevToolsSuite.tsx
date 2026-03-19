"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Wrench, Search, Code, ListChecks, Lightbulb, FolderTree } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface SimLine { text: string; color: string; delay: number }

const simulation: SimLine[] = [
  { text: "$ personas scan --deep src/", color: "text-white/50", delay: 0 },
  { text: "", color: "", delay: 500 },
  { text: "Indexing 847 files across 42 modules...", color: "text-brand-cyan/60", delay: 800 },
  { text: "  src/features/     284 files   12 modules", color: "text-white/40", delay: 300 },
  { text: "  src/stores/       89 files    28 slices", color: "text-white/40", delay: 250 },
  { text: "  src/components/   312 files   6 categories", color: "text-white/40", delay: 250 },
  { text: "  src-tauri/src/    162 files   80+ commands", color: "text-white/40", delay: 250 },
  { text: "", color: "", delay: 200 },
  { text: "Analysis complete.", color: "text-brand-emerald/60", delay: 600 },
  { text: "  Refactoring opportunities:  12 found", color: "text-brand-amber/60", delay: 400 },
  { text: "  Unused exports:             3 in src/utils/", color: "text-brand-amber/60", delay: 300 },
  { text: "  Missing tests:              7 modules", color: "text-brand-rose/60", delay: 300 },
  { text: "", color: "", delay: 200 },
  { text: "Generated context map (24KB compressed)", color: "text-brand-emerald/60", delay: 500 },
  { text: "Triaged 8 tasks: 2 critical, 3 medium, 3 low", color: "text-brand-purple/60", delay: 400 },
  { text: "", color: "", delay: 300 },
  { text: "$ personas query --test \"SELECT count(*) FROM personas\"", color: "text-white/50", delay: 800 },
  { text: "Connected to personas.db (SQLite 3.45)", color: "text-brand-cyan/60", delay: 600 },
  { text: "  Result: 42", color: "text-brand-emerald/60", delay: 400 },
  { text: "  Latency: 2ms", color: "text-white/30", delay: 200 },
  { text: "", color: "", delay: 200 },
  { text: "Ready for next command.", color: "text-white/20", delay: 400 },
];

const tools = [
  { icon: FolderTree, name: "Project Scanner", desc: "Index and search project files. Deep codebase analysis with pattern detection.", color: "#06b6d4" },
  { icon: Code, name: "Context Generator", desc: "Extract and embed project context for AI. Rich context maps for agent consumption.", color: "#a855f7" },
  { icon: Lightbulb, name: "Idea Scanner", desc: "Identify refactoring opportunities, code smells, and improvement suggestions.", color: "#fbbf24" },
  { icon: ListChecks, name: "Task Triage", desc: "Categorize and prioritize development work. AI-assisted task breakdown.", color: "#34d399" },
  { icon: Search, name: "Query Debug", desc: "Test database queries, API calls, and credential connections with inspection.", color: "#f43f5e" },
  { icon: Wrench, name: "API Playground", desc: "Test authenticated API requests. Schema introspection and validation.", color: "#60a5fa" },
];

export default function DevToolsSuite() {
  const prefersReducedMotion = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState<SimLine[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRun = useRef(false);

  const scrollTerminal = useCallback(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, []);

  const runSimulation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setVisibleLines([]);
    setPhase("running");

    let cumulative = 0;
    simulation.forEach((line, i) => {
      cumulative += line.delay;
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        requestAnimationFrame(scrollTerminal);
        if (i === simulation.length - 1) setPhase("done");
      }, cumulative);
      timeoutsRef.current.push(t);
    });
  }, [scrollTerminal]);

  // Auto-run on scroll into view
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion || hasRun.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        setTimeout(runSimulation, 400);
        obs.disconnect();
      }
    }, { rootMargin: "-100px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [runSimulation, prefersReducedMotion]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  return (
    <SectionWrapper id="devtools">
      <div ref={sectionRef} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Built-in{" "}
            <GradientText className="drop-shadow-lg">developer tools</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          An IDE-like toolkit — scan codebases, generate context,
          triage tasks, debug queries, and test APIs <span className="text-white/80 font-medium">without leaving the app.</span>
        </motion.p>
      </motion.div>

      {/* Terminal simulation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="dev-tools"
            status={phase === "running" ? "scanning" : phase === "done" ? "ready" : "idle"}
            info="src/"
            className="px-5 py-3"
          />
          <div ref={terminalRef} className="h-[320px] overflow-y-auto px-5 py-4 scrollbar-hide">
            {phase === "idle" && (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-white/15 font-mono text-center">
                  Scroll to trigger codebase scan...
                </p>
              </div>
            )}
            <AnimatePresence>
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className={`font-mono text-[11px] leading-relaxed ${line.color}`}
                  style={{ paddingLeft: line.text.startsWith("  ") ? "12px" : undefined }}
                >
                  {line.text || "\u00A0"}
                </motion.div>
              ))}
            </AnimatePresence>
            {phase === "running" && (
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="mt-1 font-mono text-xs text-brand-cyan/50">
                _
              </motion.div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-white/4 px-5 py-2.5 text-[10px] font-mono tracking-wider uppercase text-white/20">
            <span>Simulated scan</span>
            {phase === "done" && (
              <button
                onClick={() => { hasRun.current = false; runSimulation(); }}
                className="text-brand-cyan/50 hover:text-brand-cyan/80 transition-colors"
              >
                replay
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
        {tools.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${t.color}12` }}
            className="group rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
          >
            <t.icon className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: t.color }} />
            <div className="text-sm font-medium text-white/90">{t.name}</div>
            <div className="mt-1.5 text-xs text-muted-dark leading-relaxed">{t.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
