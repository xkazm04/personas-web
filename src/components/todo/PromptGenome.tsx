"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Dna, History, Tag, GitCompare, TrendingUp, Zap } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import CinematicBg from "@/components/todo/CinematicBg";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Version {
  ver: string;
  tag: string | null;
  score: number;
  delta: string;
  date: string;
}

const initialVersions: Version[] = [
  { ver: "v7", tag: "production", score: 94, delta: "+3", date: "Mar 15" },
  { ver: "v6", tag: null, score: 91, delta: "+5", date: "Mar 12" },
  { ver: "v5", tag: "experiment-a", score: 86, delta: "-2", date: "Mar 10" },
  { ver: "v4", tag: null, score: 88, delta: "+8", date: "Mar 7" },
  { ver: "v3", tag: null, score: 80, delta: "+12", date: "Mar 3" },
];

const genomeFeatures = [
  { icon: History, title: "Full version history", desc: "Every prompt change tracked with diffs, summaries, and instant rollback.", color: "#06b6d4" },
  { icon: Tag, title: "Version tagging", desc: "Label versions as \"production\", \"experiment-v1\". Switch between them instantly.", color: "#a855f7" },
  { icon: Dna, title: "Genome extraction", desc: "Formal configuration representation used as input for genetic optimization.", color: "#34d399" },
  { icon: TrendingUp, title: "Fitness scoring", desc: "Compute fitness from execution history — cost, latency, quality, error rates.", color: "#fbbf24" },
  { icon: GitCompare, title: "Breeding runs", desc: "Genetic algorithm combines best traits from multiple prompts into offspring.", color: "#f43f5e" },
  { icon: Zap, title: "Evolution cycles", desc: "Auto-trigger breeding generations. Define fitness objectives, let evolution optimize.", color: "#60a5fa" },
];

export default function PromptGenome() {
  const prefersReducedMotion = useReducedMotion();
  const [versions, setVersions] = useState(initialVersions);
  const [selectedVer, setSelectedVer] = useState<string>("v7");
  const [breeding, setBreeding] = useState(false);
  const breedRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Simulate breeding run
  const startBreeding = useCallback(() => {
    if (breeding) return;
    setBreeding(true);
    breedRef.current = setTimeout(() => {
      const topScore = versions[0].score;
      const newScore = Math.min(99, topScore + Math.floor(Math.random() * 4) + 1);
      const newVer: Version = {
        ver: `v${parseInt(versions[0].ver.slice(1)) + 1}`,
        tag: "offspring",
        score: newScore,
        delta: `+${newScore - topScore}`,
        date: "Now",
      };
      setVersions(prev => [newVer, ...prev.slice(0, 4)]);
      setSelectedVer(newVer.ver);
      setBreeding(false);
    }, 2500);
  }, [breeding, versions]);

  useEffect(() => () => clearTimeout(breedRef.current), []);

  return (
    <SectionWrapper id="genome" className="relative overflow-hidden">
      <CinematicBg src="/imgs/features/genome.png" alt="DNA helix made of glowing code" opacity={70} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center relative z-10">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Prompt versioning &{" "}
            <GradientText className="drop-shadow-lg">genome evolution</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Track every prompt change. Tag versions for production. Then let
          <span className="text-white/80 font-medium"> genetic algorithms breed better prompts</span> automatically.
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2 relative z-10">
        {/* Left: interactive version timeline */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-mono text-white/40">Prompt evolution timeline</span>
            <button
              onClick={startBreeding}
              disabled={breeding}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-[10px] font-mono transition-all ${
                breeding
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple/70"
                  : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {breeding ? (
                <>
                  <Dna className="h-3 w-3 animate-spin" />
                  breeding...
                </>
              ) : (
                <>
                  <Dna className="h-3 w-3" />
                  breed new
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {versions.map((v, i) => {
                const isSelected = selectedVer === v.ver;
                const isNew = v.date === "Now";
                return (
                  <motion.button
                    key={v.ver}
                    layout
                    initial={isNew ? { opacity: 0, scale: 0.8, y: -20 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    onClick={() => setSelectedVer(v.ver)}
                    className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-brand-cyan/25 bg-brand-cyan/6 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                        : "border-white/4 bg-white/2 hover:border-white/10 hover:bg-white/4"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold transition-colors ${isSelected ? "text-brand-cyan" : "text-white/50"}`}>
                        {v.ver}
                      </span>
                      {v.tag && (
                        <motion.span
                          initial={isNew ? { scale: 0 } : false}
                          animate={{ scale: 1 }}
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${
                            v.tag === "production"
                              ? "border-brand-emerald/20 bg-brand-emerald/8 text-brand-emerald/70"
                              : v.tag === "offspring"
                              ? "border-brand-purple/20 bg-brand-purple/8 text-brand-purple/70"
                              : "border-brand-amber/20 bg-brand-amber/8 text-brand-amber/70"
                          }`}
                        >
                          {v.tag}
                        </motion.span>
                      )}
                      <span className="text-[10px] text-white/20">{v.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono ${v.delta.startsWith("+") ? "text-brand-emerald/70" : "text-brand-rose/70"}`}>
                        {v.delta}
                      </span>
                      <motion.span
                        key={v.score}
                        initial={isNew ? { scale: 1.5 } : false}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold font-mono text-white/80"
                      >
                        {v.score}
                      </motion.span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Fitness bar */}
          <div className="mt-4 border-t border-white/4 pt-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/25 mb-1.5">
              <span>Fitness score</span>
              <span className="text-brand-emerald/50">trending up</span>
            </div>
            <div className="h-2 rounded-full bg-white/4 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                animate={{ width: `${versions.find(v => v.ver === selectedVer)?.score || 0}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Right: genome feature grid */}
        <div className="grid gap-3 sm:grid-cols-2 content-start">
          {genomeFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${f.color}12` }}
              className="group rounded-xl border border-white/6 bg-white/2 p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
            >
              <f.icon className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }} />
              <div className="text-sm font-medium text-white/90">{f.title}</div>
              <div className="mt-1 text-xs text-muted-dark leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
