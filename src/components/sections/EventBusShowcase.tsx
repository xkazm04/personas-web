"use client";

import { useId, useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mail, MessageSquare, Github, Calendar, CreditCard,
  HardDrive, SquareKanban, Figma, Wand2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import FlowComposer from "@/components/FlowComposer";
import { fadeUp } from "@/lib/animations";
import {
  createMockQueueTelemetryAdapter,
  createSnapshot,
  type QueueTelemetryAdapter,
} from "@/lib/queueTelemetry";

type QueueVariant = "classic" | "swarm" | "circuit" | "lanes" | "matrix";

/** True on mobile-width screens or when user prefers reduced motion. */
function useSimplifiedEffects() {
  const [simplified, setSimplified] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)");
    setSimplified(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSimplified(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return simplified;
}

const producers = [
  { id: "gmail", name: "Gmail", icon: Mail, color: "#ea4335", x: 12 },
  { id: "slack", name: "Slack", icon: MessageSquare, color: "#4a154b", x: 32 },
  { id: "github", name: "GitHub", icon: Github, color: "#8b5cf6", x: 52 },
  { id: "calendar", name: "Calendar", icon: Calendar, color: "#06b6d4", x: 72 },
];

const consumers = [
  { id: "jira", name: "Jira", icon: SquareKanban, color: "#0052cc", x: 22 },
  { id: "drive", name: "Drive", icon: HardDrive, color: "#34a853", x: 42 },
  { id: "stripe", name: "Stripe", icon: CreditCard, color: "#635bff", x: 62 },
  { id: "figma", name: "Figma", icon: Figma, color: "#f24e1e", x: 82 },
];

const queueRouteSeeds = [
  {
    id: "gmail-jira",
    producerId: "gmail",
    producerLabel: "Gmail",
    consumerId: "jira",
    consumerLabel: "Jira",
    color: "#ea4335",
    eventType: "email.received → inbox_triage agent",
    queueDepth: 34,
    throughputEps: 28,
    latencyMs: 420,
  },
  {
    id: "slack-drive",
    producerId: "slack",
    producerLabel: "Slack",
    consumerId: "drive",
    consumerLabel: "Drive",
    color: "#4a154b",
    eventType: "slack.message → digest agent",
    queueDepth: 21,
    throughputEps: 36,
    latencyMs: 310,
  },
  {
    id: "github-figma",
    producerId: "github",
    producerLabel: "GitHub",
    consumerId: "figma",
    consumerLabel: "Figma",
    color: "#8b5cf6",
    eventType: "pr.opened → review_summary agent",
    queueDepth: 12,
    throughputEps: 19,
    latencyMs: 260,
  },
  {
    id: "calendar-stripe",
    producerId: "calendar",
    producerLabel: "Calendar",
    consumerId: "stripe",
    consumerLabel: "Stripe",
    color: "#06b6d4",
    eventType: "meeting.ended → followup agent",
    queueDepth: 48,
    throughputEps: 14,
    latencyMs: 520,
  },
] as const;

const defaultTelemetryAdapter = createMockQueueTelemetryAdapter(queueRouteSeeds, 1400);

const matrixConsumers = ["Jira", "Drive", "Stripe", "Figma"] as const;

const extendedTools = [
  { id: "gmail", name: "Gmail", color: "#ea4335", icon: "/tools/gmail.svg" },
  { id: "slack", name: "Slack", color: "#4a154b", icon: "/tools/slack.svg" },
  { id: "github", name: "GitHub", color: "#8b5cf6", icon: "/tools/github.svg" },
  { id: "calendar", name: "Calendar", color: "#06b6d4", icon: "/tools/calendar.svg" },
  { id: "jira", name: "Jira", color: "#0052cc", icon: "/tools/jira.svg" },
  { id: "drive", name: "Drive", color: "#34a853", icon: "/tools/drive.svg" },
  { id: "react", name: "React", color: "#61DAFB", icon: "/tools/react.svg" },
  { id: "figma", name: "Figma", color: "#f24e1e", icon: "/tools/figma.svg" },
  { id: "notion", name: "Notion", color: "#ffffff", icon: "/tools/notion.svg" },
  { id: "nextjs", name: "Next.js", color: "#ffffff", icon: "/tools/nextjs.svg" },
  { id: "discord", name: "Discord", color: "#5865F2", icon: "/tools/discord.svg" },
  { id: "nodejs", name: "Node.js", color: "#339933", icon: "/tools/nodejs.svg" },
  { id: "datadog", name: "Datadog", color: "#632CA6", icon: "/tools/datadog.svg" },
  { id: "typescript", name: "TypeScript", color: "#3178C6", icon: "/tools/typescript.svg" },
  { id: "aws", name: "AWS", color: "#FF9900", icon: "/tools/aws.svg" },
  { id: "vercel", name: "Vercel", color: "#ffffff", icon: "/tools/vercel.svg" },
  { id: "salesforce", name: "Salesforce", color: "#00A1E0", icon: "/tools/salesforce.svg" },
  { id: "python", name: "Python", color: "#3776AB", icon: "/tools/python.svg" },
  { id: "docker", name: "Docker", color: "#2496ED", icon: "/tools/docker.svg" },
  { id: "kubernetes", name: "Kubernetes", color: "#326CE5", icon: "/tools/kubernetes.svg" },
  { id: "postgresql", name: "PostgreSQL", color: "#4169E1", icon: "/tools/postgresql.svg" },
  { id: "redis", name: "Redis", color: "#DC382D", icon: "/tools/redis.svg" },
  { id: "mongodb", name: "MongoDB", color: "#47A248", icon: "/tools/mongodb.svg" },
  { id: "trello", name: "Trello", color: "#0052CC", icon: "/tools/trello.svg" }
];

/* ── Desktop ToolNode (100x100 viewBox, horizontal queue) ── */
function ToolNode({
  tool,
  side,
  index,
  inView,
  active = true,
  onClick,
}: {
  tool: typeof producers[0];
  side: "top" | "bottom";
  index: number;
  inView: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const y = side === "top" ? 18 : 82;
  const queueY = 50;
  const connectorStart = side === "top" ? y + 8 : queueY + 3;
  const connectorEnd = side === "top" ? queueY - 3 : y - 8;

  return (
    <g onClick={onClick} className={onClick ? "cursor-pointer" : undefined} opacity={active ? 1 : 0.1}>
      <line
        x1={tool.x} y1={connectorStart} x2={tool.x} y2={connectorEnd}
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" strokeDasharray="1.5 2"
      />
      {side === "top" ? (
        <polygon points={`${tool.x - 1},${queueY - 4} ${tool.x},${queueY - 2} ${tool.x + 1},${queueY - 4}`} fill="rgba(255,255,255,0.12)" />
      ) : (
        <polygon points={`${tool.x - 1},${queueY + 4} ${tool.x},${queueY + 2} ${tool.x + 1},${queueY + 4}`} fill="rgba(255,255,255,0.12)" />
      )}
      <motion.circle
        r="0.8" fill={tool.color} cx={tool.x}
        initial={{ cy: connectorStart, opacity: 0 }}
        animate={inView ? { cy: [connectorStart, connectorEnd], opacity: [0, 0.9, 0.9, 0] } : { cy: connectorStart, opacity: 0 }}
        transition={{ duration: 2, delay: index * 0.6 + (side === "bottom" ? 0.3 : 0), repeat: inView ? Infinity : 0, repeatDelay: 3, ease: "linear" }}
      />
      <circle cx={tool.x} cy={y} r="5" fill={`${tool.color}0a`} stroke={tool.color} strokeWidth="0.35" opacity="0.7" />
      <circle cx={tool.x} cy={y} r="1.8" fill={tool.color} opacity="0.8" />
      <circle cx={tool.x} cy={y} r="7" fill={tool.color} opacity="0.02" />
      <text x={tool.x} y={side === "top" ? y - 8 : y + 10} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="2.4" fontFamily="var(--font-geist-mono)" letterSpacing="0.04em">
        {tool.name}
      </text>
      <text x={tool.x} y={side === "top" ? y - 5 : y + 13} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="1.3" fontFamily="var(--font-geist-mono)" letterSpacing="0.08em">
        {side === "top" ? "PRODUCER" : "CONSUMER"}
      </text>
    </g>
  );
}

/* ── Mobile ToolNode (60x130 viewBox, producers left / consumers right) ── */
const mobileProducerYPositions = [20, 45, 70, 95];
const mobileConsumerYPositions = [20, 45, 70, 95];

function MobileToolNode({
  tool,
  side,
  yPos,
  index,
  inView,
}: {
  tool: typeof producers[0];
  side: "left" | "right";
  yPos: number;
  index: number;
  inView: boolean;
}) {
  const x = side === "left" ? 12 : 48;
  const queueX = 30;
  const connectorStart = side === "left" ? x + 5 : queueX + 2;
  const connectorEnd = side === "left" ? queueX - 2 : x - 5;

  return (
    <g>
      <line
        x1={connectorStart} y1={yPos} x2={connectorEnd} y2={yPos}
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" strokeDasharray="1.5 2"
      />
      {side === "left" ? (
        <polygon points={`${queueX - 3},${yPos - 1} ${queueX - 1},${yPos} ${queueX - 3},${yPos + 1}`} fill="rgba(255,255,255,0.12)" />
      ) : (
        <polygon points={`${queueX + 3},${yPos - 1} ${queueX + 1},${yPos} ${queueX + 3},${yPos + 1}`} fill="rgba(255,255,255,0.12)" />
      )}
      <motion.circle
        r="0.8" fill={tool.color} cy={yPos}
        initial={{ cx: connectorStart, opacity: 0 }}
        animate={inView ? { cx: [connectorStart, connectorEnd], opacity: [0, 0.9, 0.9, 0] } : { cx: connectorStart, opacity: 0 }}
        transition={{ duration: 2, delay: index * 0.6 + (side === "right" ? 0.3 : 0), repeat: inView ? Infinity : 0, repeatDelay: 3, ease: "linear" }}
      />
      <circle cx={x} cy={yPos} r="4" fill={`${tool.color}0a`} stroke={tool.color} strokeWidth="0.35" opacity="0.7" />
      <circle cx={x} cy={yPos} r="1.6" fill={tool.color} opacity="0.8" />
      <text x={x} y={yPos - 6} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontFamily="var(--font-geist-mono)" letterSpacing="0.04em">
        {tool.name}
      </text>
      <text x={x} y={yPos - 2.5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="1.8" fontFamily="var(--font-geist-mono)" letterSpacing="0.08em">
        {side === "left" ? "PROD" : "CONS"}
      </text>
    </g>
  );
}

export default function EventBusShowcase({ telemetryAdapter }: { telemetryAdapter?: QueueTelemetryAdapter }) {
  const uid = useId();
  const evGlow = `${uid}-evGlow`;
  const queueGrad = `${uid}-queueGrad`;
  const queueClip = `${uid}-queueClip`;
  const queueGradM = `${uid}-queueGradM`;
  const queueClipM = `${uid}-queueClipM`;

  const simplified = useSimplifiedEffects();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "200px", once: false });
  const [selectedProducer, setSelectedProducer] = useState<string | null>(null);
  const [variant, setVariant] = useState<QueueVariant>("classic");
  const [snapshot, setSnapshot] = useState(() => createSnapshot("bootstrap", queueRouteSeeds));

  useEffect(() => {
    const adapter = telemetryAdapter ?? defaultTelemetryAdapter;
    return adapter.subscribe(setSnapshot);
  }, [telemetryAdapter]);

  // Auto-open composer if URL has a #flow= hash
  const [composerOpen, setComposerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.startsWith("#flow=");
    }
    return false;
  });

  const routeByProducer = useMemo(() => {
    const map: Record<string, (typeof snapshot.routes)[number]> = {};
    for (const route of snapshot.routes) {
      map[route.producerId] = route;
    }
    return map;
  }, [snapshot.routes]);

  const laneMetrics = useMemo(() => snapshot.routes.map((route) => ({
    id: route.id,
    producer: route.producerLabel,
    consumer: route.consumerLabel,
    queueDepth: route.queueDepth,
    latencyMs: route.latencyMs,
    eps: route.throughputEps,
    color: route.color,
  })), [snapshot.routes]);

  const maxRouteLoad = useMemo(
    () => Math.max(...snapshot.routes.map((route) => route.throughputEps * (0.5 + route.pressure)), 1),
    [snapshot.routes],
  );

  const routeMatrix = useMemo(
    () => producers.map((producer) => {
      const weights = matrixConsumers.map((consumer) => {
        const route = snapshot.routes.find(
          (item) => item.producerId === producer.id && item.consumerLabel === consumer,
        );
        if (!route) return 0;
        const score = (route.throughputEps * (0.5 + route.pressure)) / maxRouteLoad;
        return Math.max(1, Math.round(score * 100));
      });
      return { producer: producer.name, weights };
    }),
    [maxRouteLoad, snapshot.routes],
  );

  const eventDots = useMemo(() => {
    let delayCursor = 0;
    const dots: Array<{ routeId: string; delay: number; color: string; duration: number }> = [];

    for (const route of snapshot.routes) {
      const dotCount = Math.min(Math.max(route.inFlight, 1), 4);
      for (let index = 0; index < dotCount; index += 1) {
        dots.push({
          routeId: route.id,
          delay: delayCursor + index * 0.28,
          color: route.color,
          duration: Math.max(2.4, Math.min(5.5, route.latencyMs / 110)),
        });
      }
      delayCursor += 0.36;
    }

    return dots;
  }, [snapshot.routes]);

  const selectedFlow = selectedProducer ? routeByProducer[selectedProducer] : null;
  const selectedProducerNode = selectedProducer
    ? producers.find((producer) => producer.id === selectedProducer)
    : null;
  const selectedConsumerNode = selectedFlow
    ? consumers.find((consumer) => consumer.id === selectedFlow.consumerId)
    : null;

  const averageLatency = useMemo(() => {
    if (!snapshot.routes.length) return 0;
    const total = snapshot.routes.reduce((sum, route) => sum + route.latencyMs, 0);
    return Math.round(total / snapshot.routes.length);
  }, [snapshot.routes]);

  const variantTabs: { id: QueueVariant; label: string; hint: string }[] = [
    { id: "classic", label: "Classic Queue", hint: "Topology + event flow" },
    { id: "swarm", label: "Dynamic Swarm", hint: "Ephemeral connections" },
    { id: "circuit", label: "Dense Circuit", hint: "High-capacity grid" },
    { id: "lanes", label: "Latency Lanes", hint: "Queue depth + throughput" },
    { id: "matrix", label: "Routing Matrix", hint: "Producer-to-consumer pressure" },
  ];

  return (
    <SectionWrapper id="event-bus">
      {/* Background accent orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-150 w-200 -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, rgba(168,85,247,0.03) 40%, transparent 70%)" }}
        />
      </div>

        <motion.div variants={fadeUp} className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-center drop-shadow-md">
            Agents that{" "}
            <GradientText className="drop-shadow-lg">talk to each other</GradientText>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-white/70 leading-relaxed text-center text-lg sm:text-xl font-light">
            The event bus is a central queue. Producers emit events, consumers react.
            One agent&apos;s output triggers the next — <span className="text-white font-medium">automatically.</span>
          </p>
          {!composerOpen && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setComposerOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-5 py-2.5 text-sm font-medium text-brand-cyan/90 transition-all hover:bg-brand-cyan/20 hover:border-brand-cyan/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
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
                      ? "border-brand-cyan/35 bg-brand-cyan/12 text-brand-cyan shadow-[0_0_18px_rgba(6,182,212,0.14)]"
                      : "border-white/10 bg-white/2 text-white/55 hover:border-white/20 hover:text-white/85"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-2 text-[9px] normal-case tracking-normal text-white/45 group-hover:text-white/65">
                    {tab.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div ref={containerRef} className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.4)] animate-breathe-glow">
            <TerminalChrome
              title="event-bus — live"
              info={`${snapshot.source} stream · ${snapshot.totalInFlight} in-flight · backlog ${snapshot.totalBacklog}`}
              className="mb-4 pb-3"
            />

            {variant === "classic" && (
            <>
            {/* ── Desktop SVG (sm+): horizontal queue, producers top / consumers bottom ── */}
            <svg viewBox="0 0 100 100" className="hidden sm:block w-full min-h-90">
              <defs>
                <filter id={evGlow}>
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id={queueGrad} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.0)" />
                  <stop offset="15%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.08)" />
                  <stop offset="85%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
                </linearGradient>
                <clipPath id={queueClip}>
                  <rect x="5" y="46" width="90" height="8" rx="4" />
                </clipPath>
              </defs>

              <rect x="5" y="46" width="90" height="8" rx="4" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              <rect x="5" y="46" width="90" height="8" rx="4" fill={`url(#${queueGrad})`} />
              <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill="rgba(6,182,212,0.25)" fontSize="2.2" fontFamily="var(--font-geist-mono)" letterSpacing="0.15em">EVENT QUEUE</text>
              <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" strokeDasharray="2 3" />
              <polygon points="93,49 95.5,50 93,51" fill="rgba(6,182,212,0.2)" />

              <g clipPath={`url(#${queueClip})`}>
                {eventDots.map((dot, i) => (
                  <motion.circle
                    key={`${dot.routeId}-${i}`} r={simplified ? 1 : 0.8} cy="50" fill={dot.color}
                    filter={simplified ? undefined : `url(#${evGlow})`}
                    opacity={selectedProducer ? 0.1 : 0.85}
                    initial={{ cx: 3 }}
                    animate={inView ? { cx: [3, 97] } : { cx: 3 }}
                    transition={{ duration: dot.duration, delay: dot.delay, repeat: inView ? Infinity : 0, repeatDelay: 1.5, ease: "linear" }}
                  />
                ))}
              </g>

              {selectedProducerNode && selectedConsumerNode && (
                <>
                  <path
                    d={`M ${selectedProducerNode.x} 18 L ${selectedProducerNode.x} 50 L ${selectedConsumerNode.x} 50 L ${selectedConsumerNode.x} 82`}
                    fill="none"
                    stroke="rgba(6,182,212,0.55)"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    filter={`url(#${evGlow})`}
                  />
                  <motion.circle
                    r="1.1"
                    fill="rgba(6,182,212,0.95)"
                    filter={`url(#${evGlow})`}
                    initial={{ cx: selectedProducerNode.x, cy: 18, opacity: 0 }}
                    animate={
                      inView
                        ? {
                            cx: [selectedProducerNode.x, selectedProducerNode.x, selectedConsumerNode.x, selectedConsumerNode.x],
                            cy: [18, 50, 50, 82],
                            opacity: [0, 1, 1, 0],
                          }
                        : { cx: selectedProducerNode.x, cy: 18, opacity: 0 }
                    }
                    transition={{ duration: 2.2, repeat: inView ? Infinity : 0, ease: "linear" }}
                  />
                </>
              )}

              {producers.map((tool, i) => (
                <ToolNode
                  key={tool.id}
                  tool={tool}
                  side="top"
                  index={i}
                  inView={inView}
                  active={!selectedProducer || selectedProducer === tool.id}
                  onClick={() => setSelectedProducer((prev) => (prev === tool.id ? null : tool.id))}
                />
              ))}
              {consumers.map((tool, i) => (
                <ToolNode
                  key={tool.id}
                  tool={tool}
                  side="bottom"
                  index={i}
                  inView={inView}
                  active={!selectedFlow || selectedFlow.consumerId === tool.id}
                />
              ))}
            </svg>

            {/* ── Mobile SVG (<sm): vertical layout, producers left / consumers right ── */}
            <svg viewBox="0 0 60 115" className="block sm:hidden w-full min-h-85">
              <defs>
                <linearGradient id={queueGradM} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.0)" />
                  <stop offset="15%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.08)" />
                  <stop offset="85%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
                </linearGradient>
                <clipPath id={queueClipM}>
                  <rect x="27" y="5" width="6" height="105" rx="3" />
                </clipPath>
              </defs>

              {/* Vertical queue bar */}
              <rect x="27" y="5" width="6" height="105" rx="3" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              <rect x="27" y="5" width="6" height="105" rx="3" fill={`url(#${queueGradM})`} />
              <text x="30" y="57.5" textAnchor="middle" dominantBaseline="middle" fill="rgba(6,182,212,0.2)" fontSize="2.4" fontFamily="var(--font-geist-mono)" letterSpacing="0.12em" transform="rotate(-90,30,57.5)">EVENT QUEUE</text>
              <line x1="30" y1="8" x2="30" y2="107" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" strokeDasharray="2 3" />
              <polygon points="29,108 30,110.5 31,108" fill="rgba(6,182,212,0.2)" />

              {/* Event dots travelling vertically through the queue */}
              <g clipPath={`url(#${queueClipM})`}>
                {eventDots.map((dot, i) => (
                  <motion.circle
                    key={i} r={1} cx="30" fill={dot.color} opacity="0.85"
                    initial={{ cy: 3 }}
                    animate={inView ? { cy: [3, 112] } : { cy: 3 }}
                    transition={{ duration: dot.duration, delay: dot.delay, repeat: inView ? Infinity : 0, repeatDelay: 1.5, ease: "linear" }}
                  />
                ))}
              </g>

              {/* Producers on the left */}
              {producers.map((tool, i) => (
                <MobileToolNode key={tool.id} tool={tool} side="left" yPos={mobileProducerYPositions[i]} index={i} inView={inView} />
              ))}
              {/* Consumers on the right */}
              {consumers.map((tool, i) => (
                <MobileToolNode key={tool.id} tool={tool} side="right" yPos={mobileConsumerYPositions[i]} index={i} inView={inView} />
              ))}
            </svg>
            </>
            )}

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
                    <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                    <stop offset="40%" stopColor="rgba(168,85,247,0.2)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                  </radialGradient>
                </defs>

                {/* Central Core */}
                <circle cx="50" cy="50" r="15" fill={`url(#${uid}-coreGrad)`} />
                <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.05)" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
                <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.8)" fontSize="2.5" fontFamily="var(--font-geist-mono)" letterSpacing="0.1em">BUS</text>

                {/* Swarm Nodes */}
                {extendedTools.map((tool, i) => {
                  // Distribute in 2 rings
                  const isOuter = i % 2 === 0;
                  const radius = isOuter ? 42 : 28;
                  const angle = (i * (360 / extendedTools.length)) * (Math.PI / 180);
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  
                  // Randomize animation delays
                  const delay = (i * 0.37) % 4;
                  const duration = 3 + (i % 3);
                  
                  return (
                    <motion.g 
                      key={tool.id}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: [0, 0.8, 0.8, 0] } : { opacity: 0 }}
                      transition={{ duration, delay, repeat: inView ? Infinity : 0, repeatDelay: 1 }}
                    >
                      <line x1={x} y1={y} x2="50" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" strokeDasharray="1 2" />
                      
                      {/* Particle moving to/from center */}
                      <motion.circle
                        r="0.8" fill={tool.color} filter={`url(#${uid}-swarmGlow)`}
                        initial={{ cx: x, cy: y }}
                        animate={inView ? { cx: [x, 50], cy: [y, 50] } : { cx: x, cy: y }}
                        transition={{ duration: duration * 0.4, delay: delay + duration * 0.2, repeat: inView ? Infinity : 0, repeatDelay: duration * 0.6 + 1 }}
                      />
                      
                      <circle cx={x} cy={y} r="3.5" fill={`${tool.color}2a`} stroke={tool.color} strokeWidth="0.3" />
                      <image href={tool.icon} x={x - 2} y={y - 2} width="4" height="4" />
                      <text x={x} y={y + 5.5} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="1.8" fontFamily="var(--font-geist-mono)">{tool.name}</text>
                    </motion.g>
                  );
                })}
              </svg>
            )}

            {variant === "circuit" && (
              <svg viewBox="0 0 100 100" className="w-full min-h-90">
                <defs>
                  <filter id={`${uid}-circuitGlow`}>
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <pattern id={`${uid}-grid`} width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                  </pattern>
                </defs>

                <rect width="100" height="100" fill={`url(#${uid}-grid)`} />

                {/* Central Bus Line */}
                <rect x="10" y="48" width="80" height="4" rx="1" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.2)" strokeWidth="0.3" />
                
                {/* Grid Nodes */}
                {extendedTools.map((tool, i) => {
                  // Arrange in a 6x4 grid
                  const cols = 6;
                  const col = i % cols;
                  const row = Math.floor(i / cols);
                  
                  // Map to grid coordinates (15 to 85)
                  const x = 15 + col * 14;
                  const y = 15 + row * 23;
                  
                  // Connection to central bus
                  const busY = 50;
                  
                  const delay = (i * 0.23) % 3;
                  
                  return (
                    <g key={tool.id}>
                      {/* Vertical trace to bus */}
                      <path d={`M ${x} ${y} L ${x} ${busY}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                      
                      {/* Node Box */}
                      <rect x={x - 5} y={y - 4} width="10" height="8" rx="1" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                      <image href={tool.icon} x={x - 4} y={y - 2.5} width="3" height="3" />
                      <text x={x} y={y + 1.2} textAnchor="start" fill="rgba(255,255,255,0.6)" fontSize="1.8" fontFamily="var(--font-geist-mono)">{tool.name.substring(0, 4)}</text>
                      
                      {/* Data Pulse */}
                      <motion.circle
                        r="0.6" fill={tool.color} filter={`url(#${uid}-circuitGlow)`}
                        initial={{ cx: x, cy: y, opacity: 0 }}
                        animate={inView ? { 
                          cy: row < 2 ? [y, busY, busY] : [y, busY, busY], 
                          cx: [x, x, x > 50 ? 10 : 90],
                          opacity: [0, 1, 1, 0] 
                        } : { cx: x, cy: y, opacity: 0 }}
                        transition={{ duration: 2.5, delay, repeat: inView ? Infinity : 0, repeatDelay: 1.5 }}
                      />
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
                        <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.producer}</span>
                          <span className="text-white/35">→</span>
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.consumer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/60">
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.eps} evt/s</span>
                          <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.latencyMs} ms</span>
                        </div>
                      </div>

                      <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/4">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${Math.max(depthRatio * 100, 8)}%`,
                            background: `linear-gradient(90deg, ${lane.color}66, rgba(6,182,212,0.6))`,
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

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-white/50">
                        <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                          Queue depth: <span className="text-white/80">{lane.queueDepth}</span>
                        </div>
                        <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                          Latency load: <span className="text-white/80">{Math.round(latencyRatio * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {variant === "matrix" && (
              <div className="rounded-xl border border-white/8 bg-white/2 p-3 md:p-4">
                <div className="grid grid-cols-[110px_repeat(4,minmax(0,1fr))] gap-2 text-[10px] font-mono uppercase tracking-wider text-white/45">
                  <div />
                  {matrixConsumers.map((consumer) => (
                    <div key={consumer} className="text-center">{consumer}</div>
                  ))}

                  {routeMatrix.map((row, rowIdx) => (
                    <div key={row.producer} className="contents">
                      <div key={`${row.producer}-label`} className="flex items-center rounded-lg border border-white/8 bg-white/2 px-2 py-2 text-[11px] text-white/75">
                        {row.producer}
                      </div>
                      {row.weights.map((weight, colIdx) => {
                        const alpha = Math.max(weight / 100, 0.12);
                        const hot = weight >= 75;
                        return (
                          <motion.div
                            key={`${row.producer}-${matrixConsumers[colIdx]}`}
                            className="relative overflow-hidden rounded-lg border border-white/10 px-2 py-2 text-center"
                            style={{ backgroundColor: `rgba(6,182,212,${alpha * 0.35})` }}
                            initial={{ opacity: 0.7 }}
                            animate={inView ? { opacity: [0.72, 1, 0.72] } : { opacity: 0.72 }}
                            transition={{ duration: 2.2 + (rowIdx + colIdx) * 0.2, repeat: inView ? Infinity : 0, ease: "easeInOut" }}
                          >
                            {hot && (
                              <motion.div
                                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                                animate={inView ? { x: ["-120%", "120%"] } : { x: "-120%" }}
                                transition={{ duration: 1.8, repeat: inView ? Infinity : 0, ease: "linear", delay: 0.2 * colIdx }}
                              />
                            )}
                            <span className="relative z-10 text-xs font-semibold text-white/90">{weight}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-white/50">
                  <span className="rounded-full border border-white/10 bg-white/2 px-3 py-1">Hot routes auto-highlighted</span>
                  <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-brand-cyan/80">Best for real-time routing diagnostics</span>
                </div>
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
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-white/40">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-linear-to-r from-brand-cyan/25 to-brand-purple/25 ring-1 ring-white/8" />
            <span>Event queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
            <span>Event in transit</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="8" className="text-white/25">
              <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
            <span>Connection to bus</span>
          </div>
          <div className="rounded-full border border-white/8 bg-white/2 px-3 py-1.5 font-mono tracking-wide text-white/55">
            Typical response cycle: {averageLatency}ms
          </div>
          {selectedFlow && (
            <div className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1.5 font-mono tracking-wide text-brand-cyan/80">
              {selectedFlow.eventType}
            </div>
          )}
        </motion.div>
        )}
    </SectionWrapper>
  );
}
