"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { Activity, Eye, DollarSign, Gauge, FileText, BarChart3 } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface ActivityRow {
  time: string;
  agent: string;
  event: string;
  duration: string;
  cost: string;
  color: string;
}

const baseActivity: ActivityRow[] = [
  { time: "09:14:22", agent: "PR Reviewer", event: "execution.completed", duration: "2.1s", cost: "$0.11", color: "#34d399" },
  { time: "09:14:18", agent: "Email Triage", event: "tool.gmail_read", duration: "340ms", cost: "$0.00", color: "#06b6d4" },
  { time: "09:14:15", agent: "Slack Digest", event: "execution.started", duration: "—", cost: "—", color: "#a855f7" },
];

const agentPool = ["PR Reviewer", "Email Triage", "Slack Digest", "Deploy Monitor", "Doc Indexer", "Meeting Notes"];
const eventPool = ["execution.completed", "execution.started", "tool.http_request", "tool.gmail_read", "memory.stored", "healing.triggered"];
const colorPool = ["#34d399", "#06b6d4", "#a855f7", "#fbbf24", "#f43f5e", "#60a5fa"];

const observFeatures = [
  { icon: Activity, title: "Live activity feed", desc: "Animated particle lanes showing events flowing between agents. Live status for every persona.", color: "#06b6d4" },
  { icon: Eye, title: "Step-by-step history", desc: "OpenTelemetry-style spans with parent-child relationships. Waterfall visualization of every step.", color: "#a855f7" },
  { icon: DollarSign, title: "Cost tracking", desc: "Per-execution, per-persona, per-model cost tracking. Monthly trends, budget enforcement, alerts.", color: "#fbbf24" },
  { icon: Gauge, title: "Performance analytics", desc: "Prompt version comparison, error rates by model, token usage analytics, regression detection.", color: "#34d399" },
  { icon: FileText, title: "Execution transcripts", desc: "Full I/O logs for every run. Tool call steps, protocol messages, and Claude session ID tracking.", color: "#f43f5e" },
  { icon: BarChart3, title: "Knowledge graph", desc: "Cross-persona insights and relationship mapping. Semantic search across the knowledge base.", color: "#60a5fa" },
];

function AnimatedMetric({ target, prefix, suffix, color, label, trend }: { target: number; prefix?: string; suffix?: string; color: string; label: string; trend: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (ts: number) => {
      const t = Math.min((ts - start) / dur, 1);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  const formatted = target >= 10 ? Math.round(value).toString() : value.toFixed(1);

  return (
    <div ref={ref} className="p-5 text-center">
      <div className="text-2xl font-bold font-mono" style={{ color }}>{prefix}{formatted}{suffix}</div>
      <div className="text-sm font-mono text-muted-dark mt-1">{label}</div>
      <div className="text-sm font-mono text-brand-emerald mt-0.5">{trend}</div>
    </div>
  );
}

export default function ObservabilityDeck() {
  const prefersReducedMotion = useReducedMotion();
  const [activity, setActivity] = useState(baseActivity);
  const [newRow, setNewRow] = useState<string | null>(null);

  const addRow = useCallback(() => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const agent = agentPool[Math.floor(Math.random() * agentPool.length)];
    const event = eventPool[Math.floor(Math.random() * eventPool.length)];
    const color = colorPool[Math.floor(Math.random() * colorPool.length)];
    const duration = event.includes("completed") ? `${(Math.random() * 4 + 0.5).toFixed(1)}s` : event.includes("started") ? "—" : `${Math.floor(Math.random() * 800 + 50)}ms`;
    const cost = event.includes("execution") ? `$${(Math.random() * 0.3).toFixed(2)}` : "$0.00";
    const row: ActivityRow = { time, agent, event, duration, cost, color };

    setActivity(prev => [row, ...prev.slice(0, 5)]);
    setNewRow(time);
    setTimeout(() => setNewRow(null), 800);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(addRow, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [addRow, prefersReducedMotion]);

  return (
    <SectionWrapper id="observe">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            See everything,{" "}
            <GradientText className="drop-shadow-lg">miss nothing</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Watch your agents work in real time. Track what they do, what they cost,
          and how well they perform — <span className="text-foreground/80 font-medium">all in one dashboard, zero setup required.</span>
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome title="observability-deck" status="streaming" info="real-time" className="px-5 py-3" />

          {/* Animated metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/4 border-b border-white/4">
            <AnimatedMetric target={96.2} suffix="%" color="#34d399" label="Success rate" trend="+2.1%" />
            <AnimatedMetric target={3.4} suffix="s" color="#06b6d4" label="Avg duration" trend="-0.8s" />
            <AnimatedMetric target={0.14} prefix="$" suffix="" color="#fbbf24" label="Avg cost" trend="-12%" />
            <AnimatedMetric target={12} suffix="" color="#a855f7" label="Active agents" trend="+3" />
          </div>

          {/* Live activity feed */}
          <div className="px-5 py-3 space-y-1 h-[180px] overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="popLayout" initial={false}>
              {activity.map((row) => (
                <motion.div
                  key={row.time + row.agent + row.event}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  className={`flex items-center justify-between text-sm font-mono py-1 rounded px-1 transition-colors duration-500 ${
                    newRow === row.time ? "bg-brand-cyan/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-dark w-14">{row.time}</span>
                    <span className="text-muted w-24 truncate">{row.agent}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full" style={{ backgroundColor: row.color }} />
                      <span style={{ color: `${row.color}80` }}>{row.event}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-dark">
                    <span className="w-10 text-right">{row.duration}</span>
                    <span className="w-10 text-right">{row.cost}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-white/4 px-5 py-2.5 text-sm font-mono tracking-wider uppercase text-muted-dark">
            <span>Live event stream</span>
            <span className="text-brand-emerald">auto-refreshing</span>
          </div>
        </div>
      </motion.div>

      {/* Feature grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
        {observFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${f.color}15` }}
            className="group rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
          >
            <f.icon className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }} />
            <div className="text-sm font-medium text-foreground">{f.title}</div>
            <div className="mt-1.5 text-sm text-muted-dark leading-relaxed">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
