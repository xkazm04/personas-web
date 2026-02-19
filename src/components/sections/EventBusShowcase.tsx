"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const agents = [
  { label: "Email", x: 50, y: 12, color: "#60a5fa" },
  { label: "Slack", x: 88, y: 40, color: "#a78bfa" },
  { label: "GitHub", x: 73, y: 85, color: "#34d399" },
  { label: "Review", x: 27, y: 85, color: "#fbbf24" },
  { label: "Deploy", x: 12, y: 40, color: "#22d3ee" },
];

const paths = [
  { from: 0, to: 1, d: "M 50 12 Q 75 20, 88 40" },
  { from: 1, to: 2, d: "M 88 40 Q 88 68, 73 85" },
  { from: 2, to: 3, d: "M 73 85 Q 50 94, 27 85" },
  { from: 3, to: 4, d: "M 27 85 Q 12 68, 12 40" },
  { from: 4, to: 0, d: "M 12 40 Q 22 20, 50 12" },
  { from: 0, to: 3, d: "M 50 12 Q 32 48, 27 85" },
  { from: 1, to: 4, d: "M 88 40 Q 50 45, 12 40" },
];

const particleConfigs = [
  { duration: 3.8, repeatDelay: 2.1 },
  { duration: 4.3, repeatDelay: 1.7 },
  { duration: 3.2, repeatDelay: 3.4 },
  { duration: 4.7, repeatDelay: 1.3 },
  { duration: 3.5, repeatDelay: 2.8 },
  { duration: 4.1, repeatDelay: 1.9 },
  { duration: 3.9, repeatDelay: 2.5 },
];

function Particle({
  path, delay, color, duration, repeatDelay,
}: {
  path: string; delay: number; color: string; duration: number; repeatDelay: number;
}) {
  return (
    <motion.circle
      r="2.5"
      fill={color}
      filter="url(#glow)"
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay, ease: "linear" }}
      style={{ offsetPath: `path("${path}")`, offsetRotate: "0deg" }}
    />
  );
}

export default function EventBusShowcase() {
  return (
    <SectionWrapper className="overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, rgba(168,85,247,0.02) 40%, transparent 70%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
          Coordination
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Agents that <GradientText>talk to each other</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          The event bus enables real-time agent-to-agent coordination.
          One agent&apos;s output triggers the next — automatically.
        </p>
        {/* Decorative line */}
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />
      </motion.div>

      <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-xl">
        {/* Central glow layers */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-64 w-64 rounded-full animate-pulse-slow" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-40 w-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* Orbital background ring */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin-slow" style={{ width: 420, height: 420, animationDuration: "45s" }}>
            <svg viewBox="0 0 420 420" className="h-full w-full">
              <circle cx="210" cy="210" r="200" fill="none" stroke="rgba(6,182,212,0.02)" strokeWidth="0.5" strokeDasharray="3 10" />
              <circle cx="210" cy="10" r="1.5" fill="rgba(6,182,212,0.1)" />
            </svg>
          </div>
        </div>

        <svg viewBox="0 0 100 100" className="h-full w-full" style={{ minHeight: 380 }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for path glow */}
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6,182,212,0.06)" />
              <stop offset="50%" stopColor="rgba(168,85,247,0.04)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.06)" />
            </linearGradient>
          </defs>

          {/* Connection lines — outer glow layer */}
          {paths.map((p, i) => (
            <path
              key={`glow-${i}`}
              d={p.d}
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth="1.2"
              opacity="0.3"
            />
          ))}

          {/* Connection lines — crisp inner */}
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.4"
            />
          ))}

          {/* Animated particles */}
          {paths.map((p, i) => (
            <Particle
              key={`p-${i}`}
              path={p.d}
              delay={i * 0.7}
              color={agents[p.from].color}
              duration={particleConfigs[i % particleConfigs.length].duration}
              repeatDelay={particleConfigs[i % particleConfigs.length].repeatDelay}
            />
          ))}

          {/* Agent nodes */}
          {agents.map((agent) => (
            <g key={agent.label}>
              {/* Outer halo — large soft glow */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="8"
                fill={agent.color}
                opacity="0.025"
                filter="url(#node-glow)"
              />
              {/* Pulsing ring */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="6.5"
                fill="none"
                stroke={agent.color}
                strokeWidth="0.15"
                opacity="0.15"
              >
                <animate attributeName="r" values="6.5;7.5;6.5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.06;0.15" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Outer ring */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="5.5"
                fill="none"
                stroke={agent.color}
                strokeWidth="0.25"
                opacity="0.25"
              />
              {/* Inner circle */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="3.5"
                fill={`${agent.color}10`}
                stroke={agent.color}
                strokeWidth="0.4"
                opacity="0.7"
              />
              {/* Bright center */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="1.2"
                fill={agent.color}
                opacity="0.9"
              />
              {/* Label background pill */}
              <rect
                x={agent.x - 8}
                y={agent.y + 7}
                width="16"
                height="4.5"
                rx="2"
                fill="rgba(10,10,18,0.6)"
                stroke={`${agent.color}`}
                strokeWidth="0.15"
                opacity="0.5"
              />
              {/* Label */}
              <text
                x={agent.x}
                y={agent.y + 10}
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize="2.4"
                fontFamily="var(--font-geist-mono)"
                letterSpacing="0.05em"
              >
                {agent.label}
              </text>
            </g>
          ))}

          {/* Center hex pattern */}
          <polygon
            points="50,42 55,45 55,51 50,54 45,51 45,45"
            fill="none"
            stroke="rgba(6,182,212,0.06)"
            strokeWidth="0.2"
          />

          {/* Center label */}
          <text
            x="50"
            y="47.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(6,182,212,0.25)"
            fontSize="2.5"
            fontFamily="var(--font-geist-mono)"
            letterSpacing="0.12em"
          >
            EVENT BUS
          </text>
          <text
            x="50"
            y="51"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(6,182,212,0.12)"
            fontSize="1.6"
            fontFamily="var(--font-geist-mono)"
            letterSpacing="0.08em"
          >
            real-time
          </text>
        </svg>
      </motion.div>

      {/* Section divider */}
      <div className="section-line mt-16 opacity-50" />
    </SectionWrapper>
  );
}
