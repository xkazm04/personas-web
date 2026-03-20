"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Layers, Brain, Search, ArrowDown } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

interface Memory {
  id: number;
  title: string;
  category: "learning" | "preference" | "technical" | "constraint";
  importance: number;
  source: string;
  tags: string[];
}

type Category = Memory["category"];

const CATEGORIES: Category[] = ["learning", "preference", "technical", "constraint"];

const CATEGORY_META: Record<Category, { color: string; label: string; gradient: string }> = {
  learning: {
    color: "#06b6d4",
    label: "Learning",
    gradient: "from-cyan-500/12 via-cyan-400/6 to-cyan-500/3",
  },
  preference: {
    color: "#a855f7",
    label: "Preference",
    gradient: "from-purple-500/12 via-purple-400/6 to-purple-500/3",
  },
  technical: {
    color: "#fbbf24",
    label: "Technical",
    gradient: "from-amber-500/12 via-amber-400/6 to-amber-500/3",
  },
  constraint: {
    color: "#f43f5e",
    label: "Constraint",
    gradient: "from-rose-500/12 via-rose-400/6 to-rose-500/3",
  },
};

const initialMemories: Memory[] = [
  { id: 1, title: "Slack #eng-alerts uses PagerDuty format", category: "learning", importance: 8, source: "Exec #847", tags: ["slack", "alerts"] },
  { id: 2, title: "User prefers bullet-point summaries", category: "preference", importance: 9, source: "Exec #823", tags: ["format", "ux"] },
  { id: 3, title: "Monday.com webhook requires custom headers", category: "technical", importance: 7, source: "Exec #815", tags: ["monday", "webhook"] },
  { id: 4, title: "Deploy window: Tue-Thu 10am-4pm only", category: "constraint", importance: 10, source: "Manual", tags: ["deploy", "schedule"] },
  { id: 5, title: "GitHub org uses squash-merge policy", category: "learning", importance: 6, source: "Exec #791", tags: ["github", "git"] },
];

const newMemoryPool: Omit<Memory, "id">[] = [
  { title: "Stripe endpoint changed to /v2/events", category: "technical", importance: 7, source: "Exec #855", tags: ["stripe", "api"] },
  { title: "Team prefers morning notifications", category: "preference", importance: 5, source: "Exec #860", tags: ["timing", "notif"] },
  { title: "CI pipeline ~8min on main branch", category: "learning", importance: 6, source: "Exec #862", tags: ["ci", "performance"] },
  { title: "No deploys on Friday after 2pm", category: "constraint", importance: 9, source: "Manual", tags: ["deploy", "schedule"] },
  { title: "Jira boards use epic-based hierarchy", category: "technical", importance: 5, source: "Exec #870", tags: ["jira", "workflow"] },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MemoryPill({
  mem,
  isNew,
  isHovered,
  onHover,
  onLeave,
}: {
  mem: Memory;
  isNew: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const meta = CATEGORY_META[mem.category];

  return (
    <motion.div
      layout
      initial={
        isNew
          ? { opacity: 0, y: -120, scale: 0.7 }
          : { opacity: 0, scale: 0.8 }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: isHovered ? 1.05 : 1,
        zIndex: isHovered ? 30 : 1,
      }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.3 } }}
      transition={
        isNew
          ? { type: "spring", bounce: 0.35, duration: 1.4 }
          : { type: "spring", bounce: 0.2, duration: 0.6 }
      }
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative cursor-default select-none"
    >
      <div
        className={`
          relative rounded-xl border backdrop-blur-md px-3.5 py-2 transition-shadow duration-300
          ${isHovered ? "shadow-lg" : "shadow-sm"}
        `}
        style={{
          borderColor: isHovered ? `${meta.color}50` : `${meta.color}20`,
          backgroundColor: isHovered ? `${meta.color}15` : `${meta.color}08`,
          boxShadow: isHovered
            ? `0 0 24px ${meta.color}25, 0 4px 16px rgba(0,0,0,0.3)`
            : `0 1px 4px rgba(0,0,0,0.2)`,
        }}
      >
        {/* New badge glow */}
        {isNew && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ boxShadow: `inset 0 0 20px ${meta.color}30, 0 0 30px ${meta.color}20` }}
          />
        )}

        <div className="flex items-center gap-2">
          {/* Importance dot */}
          <div className="flex flex-col gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-1 w-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < Math.ceil(mem.importance / 2)
                      ? meta.color
                      : "rgba(255,255,255,0.08)",
                  boxShadow:
                    i < Math.ceil(mem.importance / 2)
                      ? `0 0 4px ${meta.color}50`
                      : "none",
                }}
              />
            ))}
          </div>

          <div className="min-w-0">
            <div className="text-[11px] text-white/80 leading-snug truncate max-w-[200px]">
              {mem.title}
            </div>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 mt-1"
              >
                <span className="text-[9px] font-mono" style={{ color: `${meta.color}80` }}>
                  {mem.source}
                </span>
                {mem.tags.map((t) => (
                  <span key={t} className="text-[8px] font-mono text-brand-cyan/35">
                    #{t}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DepthScale() {
  return (
    <div className="hidden md:flex flex-col items-center justify-between py-6 px-3 shrink-0">
      <div className="text-[9px] font-mono text-white/25 -rotate-90 whitespace-nowrap mb-6">
        IMPORTANCE
      </div>
      <div className="flex-1 flex flex-col items-center justify-between relative">
        {/* Vertical line */}
        <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-white/20 via-white/10 to-white/5" />
        {[10, 8, 6, 4, 2].map((val) => (
          <div key={val} className="relative flex items-center gap-2 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="text-[8px] font-mono text-white/15">{val}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-4 text-white/15">
        <ArrowDown className="h-3 w-3" />
        <span className="text-[9px] font-mono">depth</span>
      </div>
    </div>
  );
}

function GeologicalLayer({
  category,
  memories,
  hoveredId,
  setHoveredId,
}: {
  category: Category;
  memories: Memory[];
  hoveredId: number | null;
  setHoveredId: (id: number | null) => void;
}) {
  const meta = CATEGORY_META[category];

  return (
    <div className="relative">
      <div
        className={`
          relative rounded-xl border overflow-hidden
          bg-gradient-to-r ${meta.gradient}
          backdrop-blur-sm
        `}
        style={{
          borderColor: `${meta.color}12`,
        }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
        {/* Subtle inner glow on left edge */}
        <div
          className="absolute left-0 inset-y-0 w-1 pointer-events-none"
          style={{ backgroundColor: `${meta.color}25` }}
        />

        <div className="relative px-5 py-4">
          {/* Layer label */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.color}40` }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: `${meta.color}60` }}
            >
              {meta.label} layer
            </span>
            <span className="text-[9px] font-mono text-white/15 ml-auto">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}
            </span>
          </div>

          {/* Memory pills — sorted by importance desc (surface = most important) */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {memories
                .sort((a, b) => b.importance - a.importance)
                .map((mem) => (
                  <MemoryPill
                    key={mem.id}
                    mem={mem}
                    isNew={false}
                    isHovered={hoveredId === mem.id}
                    onHover={() => setHoveredId(mem.id)}
                    onLeave={() => setHoveredId(null)}
                  />
                ))}
            </AnimatePresence>
          </div>

          {memories.length === 0 && (
            <div className="text-[10px] font-mono text-white/15 py-2 text-center">
              no memories in this layer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropping Memory animation                                          */
/* ------------------------------------------------------------------ */

function DroppingMemory({
  mem,
  targetLayerIndex,
  onLanded,
}: {
  mem: Memory;
  targetLayerIndex: number;
  onLanded: () => void;
}) {
  const meta = CATEGORY_META[mem.category];

  useEffect(() => {
    const timer = setTimeout(onLanded, 1400);
    return () => clearTimeout(timer);
  }, [onLanded]);

  return (
    <motion.div
      className="absolute left-1/2 z-40 pointer-events-none"
      initial={{ y: -60, x: "-50%", opacity: 0, scale: 0.6 }}
      animate={{
        y: 80 + targetLayerIndex * 130,
        opacity: [0, 1, 1, 0],
        scale: [0.6, 1.1, 1, 0.8],
      }}
      transition={{
        duration: 1.3,
        ease: [0.22, 1, 0.36, 1],
        opacity: { times: [0, 0.2, 0.8, 1] },
        scale: { times: [0, 0.3, 0.7, 1] },
      }}
    >
      <div
        className="rounded-xl border backdrop-blur-md px-3.5 py-2 whitespace-nowrap"
        style={{
          borderColor: `${meta.color}40`,
          backgroundColor: `${meta.color}15`,
          boxShadow: `0 0 30px ${meta.color}30, 0 8px 32px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="text-[11px] text-white/80">{mem.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-mono" style={{ color: `${meta.color}70` }}>
            {mem.source}
          </span>
          <span className="text-[8px] font-mono text-white/20">
            importance: {mem.importance}
          </span>
        </div>
      </div>
      {/* Trail effect */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-2 w-0.5 rounded-full"
        style={{ backgroundColor: `${meta.color}40` }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: [0, 60, 30, 0], opacity: [0, 0.6, 0.3, 0] }}
        transition={{ duration: 1.3, ease: "easeOut" }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Parallax wrapper per layer                                         */
/* ------------------------------------------------------------------ */

function ParallaxLayer({
  mouseX,
  index,
  total,
  children,
}: {
  mouseX: ReturnType<typeof useSpring>;
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  // Top layers (index 0) move more; bottom layers barely move
  const factor = (total - index) / total;
  const x = useTransform(mouseX, (v: number) => v * factor);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      style={{ x }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function MemoryLayers() {
  const prefersReducedMotion = useReducedMotion();
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [droppingMem, setDroppingMem] = useState<Memory | null>(null);
  const nextIdRef = useRef(6);
  const poolIdxRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseXRaw = useMotionValue(0);
  const mouseX = useSpring(mouseXRaw, { stiffness: 100, damping: 25 });

  // Mouse parallax tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || prefersReducedMotion) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const offset = ((e.clientX - centerX) / (rect.width / 2)) * 8;
      mouseXRaw.set(offset);
    },
    [mouseXRaw, prefersReducedMotion],
  );

  const addMemory = useCallback(() => {
    const template = newMemoryPool[poolIdxRef.current % newMemoryPool.length];
    poolIdxRef.current++;
    const id = nextIdRef.current++;
    const mem: Memory = { ...template, id };

    // Start the dropping animation
    setDroppingMem(mem);
  }, []);

  const handleDropLanded = useCallback(() => {
    if (!droppingMem) return;
    setMemories((prev) => {
      const next = [...prev, droppingMem];
      // Cap each category to ~3 memories
      const counts: Record<string, number> = {};
      const filtered: Memory[] = [];
      for (const m of next.reverse()) {
        counts[m.category] = (counts[m.category] || 0) + 1;
        if (counts[m.category] <= 3) filtered.push(m);
      }
      return filtered.reverse();
    });
    setDroppingMem(null);
  }, [droppingMem]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(addMemory, 5500 + Math.random() * 2500);
    return () => clearInterval(id);
  }, [addMemory, prefersReducedMotion]);

  // Group memories by category
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    memories: memories.filter((m) => m.category === cat),
  }));

  const droppingLayerIndex = droppingMem
    ? CATEGORIES.indexOf(droppingMem.category)
    : 0;

  return (
    <SectionWrapper id="memory-layers" className="relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.04)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.03)_0%,transparent_60%)]" />
      </div>

      {/* Heading */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center relative z-10"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Memory{" "}
            <GradientText className="drop-shadow-lg">layers</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-muted-dark font-light"
        >
          Memories settle into categorical layers like geological strata.{" "}
          <span className="text-white/80 font-medium">
            Most important memories rise to the surface
          </span>{" "}
          — deeper layers hold supporting context.
        </motion.p>
      </motion.div>

      {/* Layers visualization */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => mouseXRaw.set(0)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-14 relative z-10"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-purple/60" />
              <span className="text-xs font-mono text-white/40">
                cortical-layers-view
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/25">
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" /> {memories.length} memories
              </span>
              <span className="flex items-center gap-1">
                <Search className="h-3 w-3" /> semantic search
              </span>
            </div>
          </div>

          <div className="flex">
            {/* Depth scale sidebar */}
            <DepthScale />

            {/* Layers stack */}
            <div className="flex-1 relative p-5 space-y-3">
              {/* Dropping memory animation */}
              <AnimatePresence>
                {droppingMem && (
                  <DroppingMemory
                    key={droppingMem.id}
                    mem={droppingMem}
                    targetLayerIndex={droppingLayerIndex}
                    onLanded={handleDropLanded}
                  />
                )}
              </AnimatePresence>

              {grouped.map((group, i) => (
                <ParallaxLayer key={group.category} mouseX={mouseX} index={i} total={CATEGORIES.length}>
                  <GeologicalLayer
                    category={group.category}
                    memories={group.memories}
                    hoveredId={hoveredId}
                    setHoveredId={setHoveredId}
                  />
                </ParallaxLayer>
              ))}

              {/* Sediment texture at bottom */}
              <div className="mt-2 rounded-lg bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] h-2" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 border-t border-white/5 px-5 py-3">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: meta.color,
                      boxShadow: `0 0 6px ${meta.color}60`,
                    }}
                  />
                  <span className="text-[10px] font-mono text-white/30">
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Capability pills */}
      <motion.div
        variants={fadeUp}
        className="mt-8 flex flex-wrap justify-center gap-2 relative z-10"
      >
        {[
          "Categorical geological layers",
          "Importance determines depth",
          "New memories sink into place",
          "Parallax hover interaction",
        ].map((note) => (
          <span
            key={note}
            className="rounded-full border border-white/6 bg-white/2 px-4 py-2 text-xs text-muted-dark backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-white/60"
          >
            {note}
          </span>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
