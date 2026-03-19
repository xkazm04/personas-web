"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Brain, BookOpen, Star, Layers, Search, Trash2 } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import CinematicBg from "@/components/todo/CinematicBg";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Memory {
  id: number;
  title: string;
  category: string;
  importance: number;
  source: string;
  tags: string[];
}

const initialMemories: Memory[] = [
  { id: 1, title: "Slack channel #eng-alerts uses PagerDuty format", category: "learning", importance: 8, source: "Exec #847", tags: ["slack", "alerts"] },
  { id: 2, title: "User prefers bullet-point summaries over paragraphs", category: "preference", importance: 9, source: "Exec #823", tags: ["format", "ux"] },
  { id: 3, title: "Monday.com webhook requires custom headers", category: "technical", importance: 7, source: "Exec #815", tags: ["monday", "webhook"] },
  { id: 4, title: "Deploy window: Tue-Thu 10am-4pm only", category: "constraint", importance: 10, source: "Manual", tags: ["deploy", "schedule"] },
  { id: 5, title: "GitHub org uses squash-merge policy", category: "learning", importance: 6, source: "Exec #791", tags: ["github", "git"] },
];

const newMemoryPool: Omit<Memory, "id">[] = [
  { title: "Stripe webhook endpoint changed to /v2/events", category: "technical", importance: 7, source: "Exec #855", tags: ["stripe", "api"] },
  { title: "Team prefers morning notifications over evening", category: "preference", importance: 5, source: "Exec #860", tags: ["timing", "notif"] },
  { title: "CI pipeline takes ~8min on average for main branch", category: "learning", importance: 6, source: "Exec #862", tags: ["ci", "performance"] },
];

const importanceColor = (imp: number) =>
  imp >= 9 ? "#f43f5e" : imp >= 7 ? "#fbbf24" : "#34d399";

const categoryStyle: Record<string, string> = {
  learning: "border-brand-cyan/15 text-brand-cyan/50",
  preference: "border-brand-purple/15 text-brand-purple/50",
  technical: "border-brand-amber/15 text-brand-amber/50",
  constraint: "border-brand-rose/15 text-brand-rose/50",
};

export default function MemorySystem() {
  const prefersReducedMotion = useReducedMotion();
  const [memories, setMemories] = useState(initialMemories);
  const [flashId, setFlashId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const nextIdRef = useRef(6);
  const poolIdxRef = useRef(0);

  const addMemory = useCallback(() => {
    const template = newMemoryPool[poolIdxRef.current % newMemoryPool.length];
    poolIdxRef.current++;
    const id = nextIdRef.current++;
    const mem: Memory = { ...template, id };
    setMemories(prev => [mem, ...prev.slice(0, 4)]);
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1200);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(addMemory, 6000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [addMemory, prefersReducedMotion]);

  return (
    <SectionWrapper id="memory" className="relative overflow-hidden">
      <CinematicBg src="/imgs/features/memory.png" alt="Holographic brain neural network" opacity={72} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center relative z-10">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Persistent agent{" "}
            <GradientText className="drop-shadow-lg">memory</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Agents learn from every execution and store structured memories. Categorized,
          <span className="text-white/80 font-medium"> ranked by importance, searchable</span> — your agents remember what matters.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-3xl relative z-10"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome title="agent-memory" status={`${memories.length} memories`} info="ranked by importance" className="px-5 py-3" />

          <div className="divide-y divide-white/3">
            <AnimatePresence mode="popLayout" initial={false}>
              {memories.map((mem) => {
                const isFlash = flashId === mem.id;
                const isSelected = selectedId === mem.id;
                const clr = importanceColor(mem.importance);
                return (
                  <motion.div
                    key={mem.id}
                    layout
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    onClick={() => setSelectedId(isSelected ? null : mem.id)}
                    className={`group px-5 py-4 transition-all duration-500 cursor-pointer ${
                      isFlash ? "bg-brand-cyan/5" : isSelected ? "bg-white/3" : "hover:bg-white/2"
                    }`}
                  >
                    {/* Shimmer on new memory */}
                    {isFlash && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 w-1/3 bg-linear-to-r from-transparent via-brand-cyan/8 to-transparent pointer-events-none"
                      />
                    )}
                    <div className="flex items-start justify-between gap-4 relative">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`rounded-full border bg-white/2 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${categoryStyle[mem.category] || "border-white/10 text-white/40"}`}>
                            {mem.category}
                          </span>
                          <span className="text-[10px] font-mono text-white/15">{mem.source}</span>
                          {isFlash && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-full bg-brand-cyan/15 px-1.5 py-0.5 text-[8px] font-mono text-brand-cyan/70"
                            >
                              new
                            </motion.span>
                          )}
                        </div>
                        <div className="text-sm text-white/80 leading-relaxed">{mem.title}</div>
                        <div className="mt-1.5 flex gap-2">
                          {mem.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-mono text-brand-cyan/35 hover:text-brand-cyan/60 transition-colors">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 pt-1">
                        {Array.from({ length: 5 }).map((_, j) => {
                          const filled = j < Math.ceil(mem.importance / 2);
                          return (
                            <Star
                              key={j}
                              className="h-3 w-3 transition-all duration-300"
                              fill={filled ? clr : "transparent"}
                              stroke={filled ? clr : "rgba(255,255,255,0.08)"}
                              style={{ filter: filled ? `drop-shadow(0 0 3px ${clr}60)` : undefined }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-white/4 px-5 py-3 text-[10px] font-mono text-white/20">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 hover:text-white/40 transition-colors cursor-default">
                <Search className="h-3 w-3" /> Semantic search
              </span>
              <span className="flex items-center gap-1.5 hover:text-white/40 transition-colors cursor-default">
                <BookOpen className="h-3 w-3" /> AI review
              </span>
              <span className="flex items-center gap-1.5 hover:text-white/40 transition-colors cursor-default">
                <Layers className="h-3 w-3" /> Scoped
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <Trash2 className="h-3 w-3" /> Manage
            </span>
          </div>
        </div>
      </motion.div>

      {/* Capability pills */}
      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-2 relative z-10">
        {[
          "Store via JSON protocol during execution",
          "Importance ranked 1-10 with categories",
          "Claude periodically reviews and organizes",
          "Scoped to persona, team, or global",
        ].map(note => (
          <span key={note} className="rounded-full border border-white/6 bg-white/2 px-4 py-2 text-xs text-muted-dark backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-white/60">
            {note}
          </span>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
