"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Mail, MessageSquare, Github, Calendar, CreditCard,
  HardDrive, SquareKanban, Figma,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

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

const eventDots = [
  { delay: 0, color: "#ea4335", duration: 3.5 },
  { delay: 0.8, color: "#8b5cf6", duration: 4.0 },
  { delay: 1.5, color: "#06b6d4", duration: 3.2 },
  { delay: 2.3, color: "#4a154b", duration: 3.8 },
  { delay: 3.0, color: "#34a853", duration: 4.2 },
  { delay: 3.8, color: "#fbbf24", duration: 3.6 },
  { delay: 4.5, color: "#635bff", duration: 3.4 },
  { delay: 5.2, color: "#f24e1e", duration: 3.9 },
];

function ToolNode({
  tool,
  side,
  index,
}: {
  tool: typeof producers[0];
  side: "top" | "bottom";
  index: number;
}) {
  const y = side === "top" ? 18 : 82;
  const queueY = 50;
  const connectorStart = side === "top" ? y + 8 : queueY + 3;
  const connectorEnd = side === "top" ? queueY - 3 : y - 8;

  return (
    <g>
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
        animate={{ cy: [connectorStart, connectorEnd], opacity: [0, 0.9, 0.9, 0] }}
        transition={{ duration: 2, delay: index * 0.6 + (side === "bottom" ? 0.3 : 0), repeat: Infinity, repeatDelay: 3, ease: "linear" }}
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

export default function EventBusShowcase() {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 py-24 md:py-32">
      {/* Background illustration */}
      <div className="absolute inset-0">
        <Image
          src="/imgs/illustration_photo.jpg"
          alt="Personas agent roster"
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative z-10 mx-auto max-w-6xl"
      >
        <motion.div variants={fadeUp} className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-center drop-shadow-md">
            Agents that{" "}
            <GradientText className="drop-shadow-lg">talk to each other</GradientText>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-white/70 leading-relaxed text-center text-lg sm:text-xl font-light">
            The event bus is a central queue. Producers emit events, consumers react.
            One agent&apos;s output triggers the next — <span className="text-white font-medium">automatically.</span>
          </p>
        </motion.div>

        {/* Glass box wrapping the animation */}
        <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-3xl">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.4)] animate-breathe-glow">
            {/* Top bar — terminal chrome */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.04]">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-brand-rose/40" />
                <div className="h-2 w-2 rounded-full bg-brand-amber/40" />
                <div className="h-2 w-2 rounded-full bg-brand-emerald/40" />
              </div>
              <span className="text-[10px] font-mono text-white/20 ml-2">event-bus — live</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-glow-border" />
                <span className="text-[10px] font-mono text-brand-emerald/50">connected</span>
              </div>
            </div>

            <svg viewBox="0 0 100 100" className="min-h-[260px] w-full sm:min-h-[360px]">
              <defs>
                <filter id="evGlow">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="queueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.0)" />
                  <stop offset="15%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.08)" />
                  <stop offset="85%" stopColor="rgba(6,182,212,0.1)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
                </linearGradient>
                <clipPath id="queueClip">
                  <rect x="5" y="46" width="90" height="8" rx="4" />
                </clipPath>
              </defs>

              <rect x="5" y="46" width="90" height="8" rx="4" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              <rect x="5" y="46" width="90" height="8" rx="4" fill="url(#queueGrad)" />
              <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill="rgba(6,182,212,0.25)" fontSize="2.2" fontFamily="var(--font-geist-mono)" letterSpacing="0.15em">EVENT QUEUE</text>
              <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" strokeDasharray="2 3" />
              <polygon points="93,49 95.5,50 93,51" fill="rgba(6,182,212,0.2)" />

              <g clipPath="url(#queueClip)">
                {eventDots.map((dot, i) => (
                  <motion.circle
                    key={i} r="0.8" cy="50" fill={dot.color} filter="url(#evGlow)" opacity="0.85"
                    initial={{ cx: 3 }} animate={{ cx: [3, 97] }}
                    transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, repeatDelay: 1.5, ease: "linear" }}
                  />
                ))}
              </g>

              {producers.map((tool, i) => (
                <ToolNode key={tool.id} tool={tool} side="top" index={i} />
              ))}
              {consumers.map((tool, i) => (
                <ToolNode key={tool.id} tool={tool} side="bottom" index={i} />
              ))}
            </svg>
          </div>

          {/* Glow behind the glass box */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-cyan/[0.04] via-transparent to-brand-purple/[0.04] blur-2xl" />
        </motion.div>

        {/* Legend */}
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-white/40">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-gradient-to-r from-brand-cyan/25 to-brand-purple/25 ring-1 ring-white/[0.08]" />
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
          <div className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono tracking-wide text-white/55">
            Typical response cycle: &lt; 2s
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
