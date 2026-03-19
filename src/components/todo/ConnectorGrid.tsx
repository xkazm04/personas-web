"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plug, Search, CheckCircle, RefreshCw, Shield } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Connector {
  name: string;
  category: string;
  color: string;
}

const allConnectors: Connector[] = [
  // Collaboration
  { name: "Slack", category: "Collaboration", color: "#06b6d4" },
  { name: "Discord", category: "Collaboration", color: "#06b6d4" },
  { name: "Teams", category: "Collaboration", color: "#06b6d4" },
  { name: "Telegram", category: "Collaboration", color: "#06b6d4" },
  // PM
  { name: "Jira", category: "Project", color: "#a855f7" },
  { name: "Linear", category: "Project", color: "#a855f7" },
  { name: "Asana", category: "Project", color: "#a855f7" },
  { name: "ClickUp", category: "Project", color: "#a855f7" },
  // Dev
  { name: "GitHub", category: "Dev", color: "#34d399" },
  { name: "GitLab", category: "Dev", color: "#34d399" },
  { name: "Vercel", category: "Dev", color: "#34d399" },
  { name: "Docker", category: "Dev", color: "#34d399" },
  { name: "CircleCI", category: "Dev", color: "#34d399" },
  // Comms
  { name: "Gmail", category: "Comms", color: "#f43f5e" },
  { name: "Outlook", category: "Comms", color: "#f43f5e" },
  { name: "Twilio", category: "Comms", color: "#f43f5e" },
  { name: "SendGrid", category: "Comms", color: "#f43f5e" },
  // Data
  { name: "Postgres", category: "Data", color: "#60a5fa" },
  { name: "MongoDB", category: "Data", color: "#60a5fa" },
  { name: "Supabase", category: "Data", color: "#60a5fa" },
  { name: "Redis", category: "Data", color: "#60a5fa" },
  { name: "DuckDB", category: "Data", color: "#60a5fa" },
  { name: "Neon", category: "Data", color: "#60a5fa" },
  // Content
  { name: "Notion", category: "Content", color: "#fbbf24" },
  { name: "Airtable", category: "Content", color: "#fbbf24" },
  { name: "Sheets", category: "Content", color: "#fbbf24" },
  { name: "Obsidian", category: "Content", color: "#fbbf24" },
  // CRM
  { name: "HubSpot", category: "CRM", color: "#a855f7" },
  { name: "Stripe", category: "Payments", color: "#34d399" },
  // AI
  { name: "OpenAI", category: "AI", color: "#06b6d4" },
  { name: "n8n", category: "AI", color: "#06b6d4" },
  // Monitoring
  { name: "Sentry", category: "Monitor", color: "#f43f5e" },
  { name: "PostHog", category: "Monitor", color: "#f43f5e" },
];

const categories = [...new Set(allConnectors.map(c => c.category))];

export default function ConnectorGrid() {
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pingIdx, setPingIdx] = useState<number | null>(null);

  const filtered = allConnectors.filter(c => {
    if (filter && c.category !== filter) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Simulate random health check pings
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setPingIdx(Math.floor(Math.random() * allConnectors.length));
      setTimeout(() => setPingIdx(null), 600);
    }, 2500);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <SectionWrapper id="connectors">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            <GradientText className="drop-shadow-lg">{allConnectors.length}+ connectors</GradientText>{" "}
            built in
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          One-click credential setup for every major platform.
          <span className="text-white/80 font-medium"> OAuth auto-refresh, health checks, rotation</span> — all included.
        </motion.p>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-mono transition-all duration-300 ${
              !filter ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan" : "border-white/8 bg-white/2 text-white/40 hover:text-white/60"
            }`}
          >
            All ({allConnectors.length})
          </button>
          {categories.map(cat => {
            const count = allConnectors.filter(c => c.category === cat).length;
            const catColor = allConnectors.find(c => c.category === cat)?.color || "#fff";
            return (
              <button
                key={cat}
                onClick={() => setFilter(filter === cat ? null : cat)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-mono transition-all duration-300 ${
                  filter === cat
                    ? "border-white/20 bg-white/8 text-white/80"
                    : "border-white/6 bg-white/2 text-white/35 hover:text-white/55"
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{ backgroundColor: catColor }} />
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Connector mosaic */}
      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-4xl">
        <div className="flex flex-wrap justify-center gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => {
              const globalIdx = allConnectors.indexOf(c);
              const isPinging = pingIdx === globalIdx;
              return (
                <motion.div
                  key={c.name}
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  whileHover={{ scale: 1.12, y: -3, zIndex: 10 }}
                  className={`relative flex items-center gap-2 rounded-xl border px-4 py-2.5 backdrop-blur-sm cursor-default transition-all duration-300 ${
                    isPinging
                      ? "border-white/20 bg-white/8"
                      : "border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/6"
                  }`}
                  style={{ boxShadow: isPinging ? `0 0 15px ${c.color}25` : undefined }}
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color, boxShadow: isPinging ? `0 0 8px ${c.color}80` : `0 0 3px ${c.color}40` }} />
                  <span className="text-[13px] font-medium text-white/70">{c.name}</span>
                  {/* Ping ripple */}
                  {isPinging && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-xl border"
                      style={{ borderColor: c.color }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom capabilities */}
      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { icon: CheckCircle, label: "One-click setup", color: "#34d399" },
          { icon: RefreshCw, label: "Auto-refresh OAuth", color: "#06b6d4" },
          { icon: Shield, label: "Health checks", color: "#fbbf24" },
          { icon: Plug, label: "Rotation policies", color: "#a855f7" },
        ].map(cap => (
          <div key={cap.label} className="flex flex-col items-center gap-2 rounded-xl border border-white/4 bg-white/1 p-4">
            <cap.icon className="h-5 w-5" style={{ color: cap.color }} />
            <span className="text-[11px] font-medium text-white/50">{cap.label}</span>
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
