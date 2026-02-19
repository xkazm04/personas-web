"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

/*
  Dependency graph layout (horizontal):

    [Phase 12] ──┐
                  ├──→ [Phase 14] ──→ [Phase 15]
    [Phase 13] ──┘

  Phases 12+13 are parallel, then 14, then 15.
*/

const nodes = [
  { id: 12, label: "Cloud\nIntegration", x: 15, y: 30, color: "#06b6d4", status: "next" },
  { id: 13, label: "Web\nApp", x: 15, y: 70, color: "#a855f7", status: "next" },
  { id: 14, label: "Cloud\nEvolution", x: 50, y: 50, color: "#34d399", status: "blocked" },
  { id: 15, label: "Distribution\n& Polish", x: 85, y: 50, color: "#fbbf24", status: "blocked" },
];

const edges = [
  { from: 0, to: 2, d: "M 22 30 C 35 30, 38 50, 43 50" },
  { from: 1, to: 2, d: "M 22 70 C 35 70, 38 50, 43 50" },
  { from: 2, to: 3, d: "M 57 50 C 65 50, 73 50, 78 50" },
];

const particleConfigs = [
  { duration: 3.2, repeatDelay: 2.5 },
  { duration: 3.8, repeatDelay: 2.0 },
  { duration: 2.8, repeatDelay: 3.0 },
];

function Particle({
  path, delay, color, duration, repeatDelay,
}: {
  path: string; delay: number; color: string; duration: number; repeatDelay: number;
}) {
  return (
    <motion.circle
      r="2"
      fill={color}
      filter="url(#depGlow)"
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay, ease: "linear" }}
      style={{ offsetPath: `path("${path}")`, offsetRotate: "0deg" }}
    />
  );
}

export default function DependencyGraph() {
  return (
    <SectionWrapper>
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-emerald/20 bg-brand-emerald/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-emerald/70 font-mono mb-6">
          Dependencies
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Phase <GradientText>execution order</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Phases 12 and 13 run in parallel — no file overlap. Phase 14 depends on both.
          Phase 15 is the capstone.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-emerald/15 to-transparent" />
      </motion.div>

      <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-3xl">
        {/* Central glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)" }} />
        </div>

        <svg viewBox="0 0 100 100" className="w-full" style={{ minHeight: 300 }}>
          <defs>
            <filter id="depGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="depNodeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="edgeGrad">
              <stop offset="0%" stopColor="rgba(6,182,212,0.15)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0.15)" />
            </linearGradient>
          </defs>

          {/* "Parallel" label */}
          <text x="15" y="52" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="2" fontFamily="var(--font-geist-mono)" letterSpacing="0.1em">
            PARALLEL
          </text>

          {/* Dashed vertical line connecting 12 and 13 */}
          <line x1="15" y1="37" x2="15" y2="63" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="1.5 2" />

          {/* Edge glow */}
          {edges.map((e, i) => (
            <path
              key={`eg-${i}`}
              d={e.d}
              fill="none"
              stroke="url(#edgeGrad)"
              strokeWidth="1.5"
              opacity="0.3"
            />
          ))}

          {/* Edges */}
          {edges.map((e, i) => (
            <path
              key={`e-${i}`}
              d={e.d}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.4"
            />
          ))}

          {/* Arrow tips */}
          {edges.map((e, i) => {
            const target = nodes[e.to];
            const tx = target.x - 7.5;
            const ty = target.y;
            return (
              <polygon
                key={`arrow-${i}`}
                points={`${tx},${ty - 1} ${tx + 2},${ty} ${tx},${ty + 1}`}
                fill="rgba(255,255,255,0.1)"
              />
            );
          })}

          {/* Animated particles */}
          {edges.map((e, i) => (
            <Particle
              key={`p-${i}`}
              path={e.d}
              delay={i * 1.2}
              color={nodes[e.from].color}
              duration={particleConfigs[i].duration}
              repeatDelay={particleConfigs[i].repeatDelay}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              {/* Outer halo */}
              <circle
                cx={node.x}
                cy={node.y}
                r="10"
                fill={node.color}
                opacity="0.02"
                filter="url(#depNodeGlow)"
              />
              {/* Pulsing ring for "next" status */}
              {node.status === "next" && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill="none"
                  stroke={node.color}
                  strokeWidth="0.15"
                  opacity="0.2"
                >
                  <animate attributeName="r" values="8;9.5;8" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill={`${node.color}08`}
                stroke={node.color}
                strokeWidth="0.4"
                opacity={node.status === "next" ? 0.8 : 0.4}
              />
              {/* Center bright dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r="2"
                fill={node.color}
                opacity={node.status === "next" ? 0.9 : 0.4}
              />
              {/* Phase number */}
              <text
                x={node.x}
                y={node.y + 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="3"
                fontFamily="var(--font-geist-mono)"
                fontWeight="bold"
              >
                {node.id}
              </text>
              {/* Label */}
              {node.label.split("\n").map((line, li) => (
                <text
                  key={li}
                  x={node.x}
                  y={node.y + 10 + li * 3.5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="2.2"
                  fontFamily="var(--font-geist-mono)"
                  letterSpacing="0.04em"
                >
                  {line}
                </text>
              ))}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-muted-dark">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
            <span>Ready to start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/[0.15]" />
            <span>Blocked by dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-white/[0.06]" />
            <span>Phase node</span>
          </div>
        </div>
      </motion.div>

      <div className="section-line mt-16 opacity-50" />
    </SectionWrapper>
  );
}
