"use client";

import { useId, useRef, useState, useEffect } from "react";
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

const eventFlowMap: Record<string, { consumerId: string; eventType: string }> = {
  gmail: { consumerId: "jira", eventType: "email.received → inbox_triage agent" },
  slack: { consumerId: "drive", eventType: "slack.message → digest agent" },
  github: { consumerId: "figma", eventType: "pr.opened → review_summary agent" },
  calendar: { consumerId: "stripe", eventType: "meeting.ended → followup agent" },
};

const eventDots = [
  { delay: 0, color: "#ea4335", duration: 3.5 },
  { delay: 0.8, color: "#8b5cf6", duration: 4.0 },
  { delay: 1.5, color: "#06b6d4", duration: 3.2 },
  { delay: 2.3, color: "#4a154b", duration: 3.8 },
  { delay: 3.0, color: "#34a853", duration: 4.2 },
  { delay: 3.8, color: "#fbbf24", duration: 3.6 },
  { delay: 4.5, color: "#635bff", duration: 3.4 },
  { delay: 5.2, color: "#f24e1e", duration: 3.9 },
] as const;

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

export default function EventBusShowcase() {
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

  // Auto-open composer if URL has a #flow= hash
  const [composerOpen, setComposerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.startsWith("#flow=");
    }
    return false;
  });

  const selectedFlow = selectedProducer ? eventFlowMap[selectedProducer] : null;
  const selectedProducerNode = selectedProducer
    ? producers.find((producer) => producer.id === selectedProducer)
    : null;
  const selectedConsumerNode = selectedFlow
    ? consumers.find((consumer) => consumer.id === selectedFlow.consumerId)
    : null;

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
          <div ref={containerRef} className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.4)] animate-breathe-glow">
            <TerminalChrome title="event-bus — live" className="mb-4 pb-3" />

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
                    key={i} r={simplified ? 1 : 0.8} cy="50" fill={dot.color}
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
            Typical response cycle: &lt; 2s
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
