"use client";

import { useId, useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import dynamic from "next/dynamic";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";

const FlowComposer = dynamic(() => import("@/components/FlowComposer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan" />
    </div>
  ),
});
import {
  createMockQueueTelemetryAdapter,
  createSnapshot,
  type QueueTelemetryAdapter,
} from "@/lib/event-bus-demo";
import { EXTENDED_TOOLS, TOOL_MAP } from "@/lib/tool-catalogue";

type QueueVariant = "swarm" | "lanes";

const queueRouteSeeds = [
  {
    id: "gmail-jira",
    producerId: "gmail",
    producerLabel: TOOL_MAP.get("gmail")!.name,
    consumerId: "jira",
    consumerLabel: TOOL_MAP.get("jira")!.name,
    color: TOOL_MAP.get("gmail")!.color,
    eventType: "email.received → inbox_triage agent",
    queueDepth: 34,
    throughputEps: 28,
    latencyMs: 420,
  },
  {
    id: "slack-drive",
    producerId: "slack",
    producerLabel: TOOL_MAP.get("slack")!.name,
    consumerId: "drive",
    consumerLabel: TOOL_MAP.get("drive")!.name,
    color: TOOL_MAP.get("slack")!.color,
    eventType: "slack.message → digest agent",
    queueDepth: 21,
    throughputEps: 36,
    latencyMs: 310,
  },
  {
    id: "github-figma",
    producerId: "github",
    producerLabel: TOOL_MAP.get("github")!.name,
    consumerId: "figma",
    consumerLabel: TOOL_MAP.get("figma")!.name,
    color: TOOL_MAP.get("github")!.color,
    eventType: "pr.opened → review_summary agent",
    queueDepth: 12,
    throughputEps: 19,
    latencyMs: 260,
  },
  {
    id: "calendar-stripe",
    producerId: "calendar",
    producerLabel: TOOL_MAP.get("calendar")!.name,
    consumerId: "stripe",
    consumerLabel: TOOL_MAP.get("stripe")!.name,
    color: TOOL_MAP.get("calendar")!.color,
    eventType: "meeting.ended → followup agent",
    queueDepth: 48,
    throughputEps: 14,
    latencyMs: 520,
  },
] as const;

const defaultTelemetryAdapter = createMockQueueTelemetryAdapter(queueRouteSeeds, 1400);

const SWARM_TOOL_IDS = ["gmail", "slack", "github", "jira", "figma", "discord", "notion", "docker", "python", "redis"];
const swarmTools = EXTENDED_TOOLS.filter((t) => SWARM_TOOL_IDS.includes(t.id));

export default function EventBusShowcase({ telemetryAdapter }: { telemetryAdapter?: QueueTelemetryAdapter }) {
  const uid = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "200px", once: false });
  const [variant, setVariant] = useState<QueueVariant>("swarm");
  const [snapshot, setSnapshot] = useState(() => createSnapshot("bootstrap", queueRouteSeeds));

  useEffect(() => {
    if (!inView) return;
    const adapter = telemetryAdapter ?? defaultTelemetryAdapter;
    return adapter.subscribe(setSnapshot);
  }, [telemetryAdapter, inView]);

  // Auto-open composer if URL has a #flow= hash
  const [composerOpen, setComposerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.startsWith("#flow=");
    }
    return false;
  });

  const laneMetrics = useMemo(() => snapshot.routes.map((route) => ({
    id: route.id,
    producer: route.producerLabel,
    consumer: route.consumerLabel,
    queueDepth: route.queueDepth,
    latencyMs: route.latencyMs,
    eps: route.throughputEps,
    color: route.color,
  })), [snapshot.routes]);

  const averageLatency = useMemo(() => {
    if (!snapshot.routes.length) return 0;
    const total = snapshot.routes.reduce((sum, route) => sum + route.latencyMs, 0);
    return Math.round(total / snapshot.routes.length);
  }, [snapshot.routes]);

  const variantTabs: { id: QueueVariant; label: string; hint: string }[] = [
    { id: "swarm", label: "Dynamic Swarm", hint: "Ephemeral connections" },
    { id: "lanes", label: "Latency Lanes", hint: "Queue depth + throughput" },
  ];

  return (
    <SectionWrapper id="event-bus">
        <motion.div variants={fadeUp} className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-center drop-shadow-md">
            Agents that{" "}
            <GradientText className="drop-shadow-lg">talk to each other</GradientText>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-muted leading-relaxed text-center text-lg sm:text-xl font-light">
            The event bus is a central queue. Producers emit events, consumers react.
            One agent&apos;s output triggers the next — <span className="text-white font-medium">automatically.</span>
          </p>
          {!composerOpen && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setComposerOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-6 py-2.5 text-sm font-medium text-brand-cyan/90 transition-all hover:bg-brand-cyan/20 hover:border-brand-cyan/40 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--brand-cyan)_15%,transparent)]"
              >
                <Wand2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
                Try it yourself — build a flow
              </button>
            </div>
          )}
        </motion.div>

        {/* Composer or showcase */}
        <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-3xl">
          <AnimatePresence mode="wait">
            {composerOpen ? (
              <motion.div
                key="composer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FlowComposer onClose={() => { setComposerOpen(false); window.history.replaceState(null, "", window.location.pathname); }} />
              </motion.div>
            ) : (
              <motion.div
                key="showcase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {variantTabs.map((tab) => {
              const isActive = variant === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setVariant(tab.id)}
                  className={`group rounded-full border px-4 py-2 text-[11px] font-mono uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "border-brand-cyan/35 bg-brand-cyan/12 text-brand-cyan shadow-[0_0_18px_color-mix(in_srgb,var(--brand-cyan)_14%,transparent)]"
                      : "border-white/10 bg-white/2 text-muted hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-2 text-[9px] normal-case tracking-normal text-muted group-hover:text-foreground/80">
                    {tab.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div ref={containerRef} className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.25)] animate-breathe-glow">
            <TerminalChrome
              title="event-bus — live"
              info={`${snapshot.source} stream · ${snapshot.totalInFlight} in-flight · backlog ${snapshot.totalBacklog}`}
              className="mb-4 pb-3"
            />

            {variant === "swarm" && (
              <svg viewBox="0 0 100 100" className="w-full min-h-90">
                <defs>
                  <filter id={`${uid}-swarmGlow`}>
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id={`${uid}-coreGrad`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.4" />
                    <stop offset="40%" stopColor="var(--brand-purple)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Central Core */}
                <circle cx="50" cy="50" r="15" fill={`url(#${uid}-coreGrad)`} />
                <circle cx="50" cy="50" r="8" fill="var(--foreground)" fillOpacity="0.05" stroke="var(--brand-cyan)" strokeOpacity="0.3" strokeWidth="0.5" />
                <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill="var(--foreground)" fillOpacity="0.8" fontSize="2.5" fontFamily="var(--font-geist-mono)" letterSpacing="0.1em">BUS</text>

                {/* Swarm Nodes — SMIL animations run on compositor, not JS thread */}
                {swarmTools.map((tool, i) => {
                  const radius = 35;
                  const angle = (i * (360 / swarmTools.length)) * (Math.PI / 180);
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);

                  // Staggered timing per node
                  const delay = (i * 0.37) % 4;
                  const duration = 3 + (i % 3);
                  const totalCycle = duration + 1; // duration + repeatDelay

                  // Opacity keyTimes: fade-in, hold, fade-out, idle
                  const kt1 = (duration * 0.33 / totalCycle).toFixed(4);
                  const kt2 = (duration * 0.66 / totalCycle).toFixed(4);
                  const kt3 = (duration / totalCycle).toFixed(4);

                  // Particle travels during first 40% of active duration
                  const pActive = (duration * 0.4 / totalCycle).toFixed(4);
                  const pEnd = Math.min(parseFloat(pActive) + 0.001, 1).toFixed(4);
                  const dx = (50 - x).toFixed(2);
                  const dy = (50 - y).toFixed(2);

                  const iconSize = 5;

                  return (
                    <g key={tool.id} opacity="0">
                      <animate
                        attributeName="opacity"
                        values="0;0.8;0.8;0;0"
                        keyTimes={`0;${kt1};${kt2};${kt3};1`}
                        dur={`${totalCycle}s`}
                        begin={`${delay}s`}
                        repeatCount="indefinite"
                      />
                      <line x1={x} y1={y} x2="50" y2="50" stroke="var(--foreground)" strokeOpacity="0.05" strokeWidth="0.2" strokeDasharray="1 2" />

                      {/* Particle moving toward center */}
                      <circle r="0.8" fill={tool.color} filter={`url(#${uid}-swarmGlow)`} cx={x} cy={y}>
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values={`0 0;${dx} ${dy};0 0;0 0`}
                          keyTimes={`0;${pActive};${pEnd};1`}
                          dur={`${totalCycle}s`}
                          begin={`${delay + duration * 0.2}s`}
                          repeatCount="indefinite"
                        />
                      </circle>

                      <circle cx={x} cy={y} r="4.5" fill={`${tool.color}2a`} stroke={tool.color} strokeWidth="0.3" />
                      <image href={`/tools/${tool.id}.svg`} x={x - iconSize / 2} y={y - iconSize / 2} width={iconSize} height={iconSize} />
                      <text x={x} y={y + 6.5} textAnchor="middle" fill="var(--foreground)" fillOpacity="0.5" fontSize="1.8" fontFamily="var(--font-geist-mono)">{tool.name}</text>
                    </g>
                  );
                })}
              </svg>
            )}

            {variant === "lanes" && (
              <div className="space-y-3">
                {laneMetrics.map((lane, i) => {
                  const depthRatio = Math.min(lane.queueDepth / 50, 1);
                  const latencyRatio = Math.min(lane.latencyMs / 600, 1);
                  return (
                    <motion.div
                      key={lane.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                      className="rounded-xl border border-white/8 bg-white/2 px-3 py-3 md:px-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-foreground/80">
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.producer}</span>
                          <span className="text-muted">→</span>
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.consumer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.eps} evt/s</span>
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.latencyMs} ms</span>
                        </div>
                      </div>

                      <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/4">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${Math.max(depthRatio * 100, 8)}%`,
                            background: `linear-gradient(90deg, ${lane.color}66, color-mix(in srgb, var(--brand-cyan) 60%, transparent))`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(depthRatio * 100, 8)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        <motion.div
                          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                          style={{ backgroundColor: lane.color, boxShadow: `0 0 10px ${lane.color}` }}
                          animate={inView ? { x: ["0%", "2600%"] } : { x: "0%" }}
                          transition={{ duration: 2.8 + i * 0.35, repeat: inView ? Infinity : 0, ease: "linear" }}
                        />
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-muted">
                        <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                          Queue depth: <span className="text-foreground/80">{lane.queueDepth}</span>
                        </div>
                        <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                          Latency load: <span className="text-foreground/80">{Math.round(latencyRatio * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Glow behind the glass box */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-brand-cyan/4 via-transparent to-brand-purple/4 blur-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend (only shown in showcase mode) */}
        {!composerOpen && (
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-muted">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-linear-to-r from-brand-cyan/25 to-brand-purple/25 ring-1 ring-white/8" />
            <span>Event queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_color-mix(in_srgb,var(--brand-cyan)_40%,transparent)]" />
            <span>Event in transit</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="8" className="text-muted">
              <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
            <span>Connection to bus</span>
          </div>
          <div className="rounded-full border border-white/8 bg-white/2 px-3 py-1.5 font-mono tracking-wide text-muted">
            Typical response cycle: {averageLatency}ms
          </div>
        </motion.div>
        )}
    </SectionWrapper>
  );
}
