"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Loader2 } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { BRAND_VAR, tint, brandShadow } from "@/lib/brand-theme";
import type { RoadmapItem } from "./types";
import { FALLBACK_ITEMS } from "./data";
import RoadmapCard from "./components/RoadmapCard";
import RoadmapProgress from "./components/RoadmapProgress";

export default function Roadmap() {
  const [items, setItems] = useState<RoadmapItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.items?.length) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const nextCount = items.filter((i) => i.status === "next").length;

  return (
    <SectionWrapper id="roadmap">
      <SectionIntro
        heading="Product"
        gradient="Roadmap"
        description="What we're building now and what comes next."
      />
      {loading && (
        <div className="text-center -mt-6 mb-6">
          <Loader2 className="inline-block h-4 w-4 animate-spin" style={{ color: tint("cyan", 50) }} />
        </div>
      )}

      {/* Summary pills */}
      <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <div
          className="flex items-center gap-2 rounded-full border px-4 py-2"
          style={{ borderColor: tint("cyan", 20), backgroundColor: tint("cyan", 5) }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 6, 60) }} />
          <span className="text-base font-mono font-medium" style={{ color: BRAND_VAR.cyan }}>
            {inProgressCount} In Progress
          </span>
        </div>
        <div
          className="flex items-center gap-2 rounded-full border px-4 py-2"
          style={{ borderColor: tint("purple", 20), backgroundColor: tint("purple", 5) }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tint("purple", 60) }} />
          <span className="text-base font-mono font-medium" style={{ color: tint("purple", 70) }}>
            {nextCount} Next
          </span>
        </div>
      </motion.div>

      {/* Milestone callout */}
      <motion.div
        variants={fadeUp}
        className="mt-10 mx-auto max-w-3xl rounded-2xl border px-6 py-6 backdrop-blur-md relative overflow-hidden"
        style={{
          borderColor: tint("cyan", 30),
          backgroundImage: `linear-gradient(90deg, ${tint("cyan", 10)}, ${tint("purple", 10)})`,
          boxShadow: brandShadow("cyan", 30, 15),
        }}
      >
        <div className="absolute inset-0 bg-[url('/imgs/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1"
            style={{
              backgroundColor: tint("cyan", 20),
              boxShadow: brandShadow("cyan", 15, 30),
              borderColor: tint("cyan", 40),
            }}
          >
            <Rocket className="h-6 w-6" style={{ color: BRAND_VAR.cyan }} />
          </div>
          <div>
            <p className="text-base font-mono font-bold uppercase tracking-widest drop-shadow-sm" style={{ color: BRAND_VAR.cyan }}>
              Current focus
            </p>
            <p className="mt-1.5 text-base text-foreground font-medium leading-relaxed">
              Building <span className="text-white font-bold">cloud execution</span> so your agents run 24/7, plus{" "}
              <span className="text-white font-bold">this website</span> and support for{" "}
              <span className="text-white font-bold">15+ languages</span>.
            </p>
          </div>
        </div>
      </motion.div>

      <RoadmapProgress />

      {/* Timeline */}
      <motion.div variants={staggerContainer} className="mt-20 mx-auto max-w-4xl">
        {items.map((item, i) => (
          <RoadmapCard key={item.id} item={item} index={i} total={items.length} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
