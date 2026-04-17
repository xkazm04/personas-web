"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import {
  SWARM_PERSONAS,
  SWARM_SOURCES,
  type SwarmNode,
} from "@/lib/mock-dashboard-data";

// ── Geometry helpers ──────────────────────────────────────────────────

const CX = 250;
const CY = 250;
const PERSONA_RADIUS = 110;
const SOURCE_RADIUS = 200;

function nodePosition(
  index: number,
  total: number,
  radius: number,
  offsetAngle = -Math.PI / 2,
): { x: number; y: number } {
  const angle = offsetAngle + (2 * Math.PI * index) / total;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

// ── Particle types ────────────────────────────────────────────────────

interface Particle {
  id: number;
  phase: "inbound" | "outbound";
  /** 0..1 progress along current phase path */
  t: number;
  speed: number; // units of t per second
  color: string;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  /** control point for quadratic Bezier */
  cp: { x: number; y: number };
  /** burst effect on arrival */
  burst: number; // 0..1 (0 = no burst, grows after arrival)
  done: boolean;
}

interface BurstRing {
  id: number;
  x: number;
  y: number;
  t: number; // 0..1
  color: string;
}

let _particleId = 0;

function bezierControlPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curveFactor = 0.35,
): { x: number; y: number } {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // perpendicular offset
  return {
    x: mx + dy * curveFactor * (Math.random() > 0.5 ? 1 : -1),
    y: my - dx * curveFactor * (Math.random() > 0.5 ? 1 : -1),
  };
}

function quadBezier(
  from: { x: number; y: number },
  cp: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * cp.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * cp.y + t * t * to.y,
  };
}

// ── Component ─────────────────────────────────────────────────────────

export interface EventBusVisualizationProps {
  className?: string;
  onNodeClick?: (node: SwarmNode) => void;
  /** external trigger to create a burst of particles */
  triggerBurst?: number;
}

export default function EventBusVisualization({
  className = "",
  onNodeClick,
  triggerBurst,
}: EventBusVisualizationProps) {
  const prefersReduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<BurstRing[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const inViewRef = useRef(false);
  const [, forceRender] = useState(0);

  // Pre-compute node positions
  const personaPositions = useMemo(
    () => SWARM_PERSONAS.map((_, i) => nodePosition(i, SWARM_PERSONAS.length, PERSONA_RADIUS)),
    [],
  );
  const sourcePositions = useMemo(
    () => SWARM_SOURCES.map((_, i) => nodePosition(i, SWARM_SOURCES.length, SOURCE_RADIUS)),
    [],
  );

  // Spawn a single particle: source -> hub -> persona (two-phase)
  const spawnParticle = useCallback(() => {
    const srcIdx = Math.floor(Math.random() * SWARM_SOURCES.length);
    const pIdx = Math.floor(Math.random() * SWARM_PERSONAS.length);
    const source = sourcePositions[srcIdx];
    const persona = personaPositions[pIdx];
    const color = SWARM_PERSONAS[pIdx].color;
    const hub = { x: CX, y: CY };

    // Phase 1: source -> hub
    const p: Particle = {
      id: ++_particleId,
      phase: "inbound",
      t: 0,
      speed: 0.8 + Math.random() * 0.6, // ~0.8-1.4 per second
      color,
      sourcePos: source,
      targetPos: hub,
      cp: bezierControlPoint(source, hub, 0.2),
      burst: 0,
      done: false,
    };

    // Store destination persona info for phase 2
    (p as Particle & { _personaPos: typeof persona })._personaPos = persona;
    particlesRef.current.push(p);
  }, [sourcePositions, personaPositions]);

  // Spawn a burst of particles
  const spawnBurst = useCallback(
    (count = 8) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnParticle(), i * 60);
      }
    },
    [spawnParticle],
  );

  // React to external burst trigger
  useEffect(() => {
    if (triggerBurst && triggerBurst > 0) {
      spawnBurst(12);
    }
  }, [triggerBurst, spawnBurst]);

  // Visibility gating — pause RAF when SVG is off-screen
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasInView = inViewRef.current;
        inViewRef.current = entry.isIntersecting;
        // Resume RAF when scrolling back into view
        if (entry.isIntersecting && !wasInView && !prefersReduced) {
          lastTimeRef.current = 0;
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(svg);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  // Animation loop
  const tick = useCallback((now: number) => {
    if (!inViewRef.current || document.hidden) {
      rafRef.current = 0;
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1); // cap dt
    lastTimeRef.current = now;

    // Spawn new particles periodically
    spawnTimerRef.current -= dt;
    if (spawnTimerRef.current <= 0) {
      spawnParticle();
      spawnTimerRef.current = 0.5 + Math.random() * 1.0; // 500-1500ms
    }

    // Update particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += p.speed * dt;

      if (p.t >= 1 && !p.done) {
        if (p.phase === "inbound") {
          const personaPos = (p as Particle & { _personaPos: { x: number; y: number } })
            ._personaPos;
          p.phase = "outbound";
          p.t = 0;
          p.sourcePos = { x: CX, y: CY };
          p.targetPos = personaPos;
          p.cp = bezierControlPoint(p.sourcePos, p.targetPos, 0.25);

          burstsRef.current.push({
            id: ++_particleId,
            x: CX,
            y: CY,
            t: 0,
            color: p.color,
          });
        } else {
          burstsRef.current.push({
            id: ++_particleId,
            x: p.targetPos.x,
            y: p.targetPos.y,
            t: 0,
            color: p.color,
          });
          p.done = true;
        }
      }
    }

    particlesRef.current = particles.filter((p) => !p.done);

    for (const b of burstsRef.current) {
      b.t += dt * 3;
    }
    burstsRef.current = burstsRef.current.filter((b) => b.t < 1);

    forceRender((n) => n + 1);
    rafRef.current = requestAnimationFrame(tick);
  }, [spawnParticle]);

  useEffect(() => {
    if (prefersReduced) return;
    inViewRef.current = true; // start running
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, tick]);

  // ── Render ──────────────────────────────────────────────────────────

  const particles = particlesRef.current;
  const bursts = burstsRef.current;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 500"
      className={`w-full max-w-[560px] mx-auto select-none ${className}`}
      style={{ filter: "drop-shadow(0 0 60px rgba(6,182,212,0.06))" }}
    >
      <defs>
        {/* Hub radial gradient */}
        <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(6,182,212,0.25)" />
          <stop offset="60%" stopColor="rgba(6,182,212,0.10)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0.02)" />
        </radialGradient>

        {/* Glow filter for hub */}
        <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glow filter for particles */}
        <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Persona node gradients */}
        {SWARM_PERSONAS.map((p) => (
          <radialGradient key={`grad-${p.id}`} id={`grad-${p.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0.05" />
          </radialGradient>
        ))}
      </defs>

      {/* ── Connection lines: sources to hub ──────────────────── */}
      {sourcePositions.map((pos, i) => (
        <line
          key={`src-line-${i}`}
          x1={pos.x}
          y1={pos.y}
          x2={CX}
          y2={CY}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      ))}

      {/* ── Connection lines: hub to personas ─────────────────── */}
      {personaPositions.map((pos, i) => (
        <line
          key={`per-line-${i}`}
          x1={CX}
          y1={CY}
          x2={pos.x}
          y2={pos.y}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      ))}

      {/* ── Concentric rings ──────────────────────────────────── */}
      <circle
        cx={CX}
        cy={CY}
        r={PERSONA_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.03)"
        strokeWidth="0.5"
      />
      <circle
        cx={CX}
        cy={CY}
        r={SOURCE_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
      />

      {/* ── Central hub ───────────────────────────────────────── */}
      <g filter="url(#hubGlow)">
        <circle cx={CX} cy={CY} r={34} fill="url(#hubGradient)">
          {!prefersReduced && (
            <animate
              attributeName="r"
              values="34;36;34"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle
          cx={CX}
          cy={CY}
          r={30}
          fill="rgba(6,182,212,0.06)"
          stroke="rgba(6,182,212,0.25)"
          strokeWidth="1"
        >
          {!prefersReduced && (
            <animate
              attributeName="r"
              values="30;31;30"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        {/* Hub ring */}
        <circle
          cx={CX}
          cy={CY}
          r={38}
          fill="none"
          stroke="rgba(6,182,212,0.12)"
          strokeWidth="0.5"
        >
          {!prefersReduced && (
            <animate
              attributeName="r"
              values="38;40;38"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </g>
      <text
        x={CX}
        y={CY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(6,182,212,0.7)"
        fontSize="9"
        fontWeight="700"
        fontFamily="monospace"
        letterSpacing="2"
      >
        BUS
      </text>

      {/* ── Source nodes (outer ring) ─────────────────────────── */}
      {SWARM_SOURCES.map((source, i) => {
        const pos = sourcePositions[i];
        const r = 10 + source.volume * 6;
        return (
          <g
            key={source.id}
            className="cursor-pointer"
            onClick={() => onNodeClick?.(source)}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
            />
            <text
              x={pos.x}
              y={pos.y + r + 14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
            >
              {source.label}
            </text>
            {/* Tiny activity dot */}
            <circle
              cx={pos.x + r - 2}
              cy={pos.y - r + 2}
              r="2"
              fill={source.color}
              opacity="0.6"
            />
          </g>
        );
      })}

      {/* ── Persona nodes (inner ring) ────────────────────────── */}
      {SWARM_PERSONAS.map((persona, i) => {
        const pos = personaPositions[i];
        return (
          <g
            key={persona.id}
            className="cursor-pointer"
            onClick={() => onNodeClick?.(persona)}
          >
            {/* Breathing outer glow */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={22}
              fill="none"
              stroke={persona.color}
              strokeOpacity="0.1"
              strokeWidth="1"
            >
              {!prefersReduced && (
                <animate
                  attributeName="r"
                  values="22;24;22"
                  dur={`${2.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>

            {/* Main node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill={`url(#grad-${persona.id})`}
              stroke={persona.color}
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />

            {/* Processing arc indicator */}
            {persona.volume > 0.7 && !prefersReduced && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill="none"
                stroke={persona.color}
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="12 114"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${pos.x} ${pos.y}`}
                  to={`360 ${pos.x} ${pos.y}`}
                  dur={`${3 - persona.volume}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Emoji icon */}
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
            >
              {persona.icon}
            </text>

            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + 32}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              fontWeight="500"
            >
              {persona.label}
            </text>
          </g>
        );
      })}

      {/* ── Particles ─────────────────────────────────────────── */}
      {!prefersReduced &&
        particles.map((p) => {
          const pos = quadBezier(p.sourcePos, p.cp, p.targetPos, Math.min(p.t, 1));
          return (
            <g key={p.id} filter="url(#particleGlow)">
              {/* Outer glow */}
              <circle cx={pos.x} cy={pos.y} r={4} fill={p.color} opacity={0.25} />
              {/* Core */}
              <circle cx={pos.x} cy={pos.y} r={2} fill={p.color} opacity={0.9} />
              {/* White center */}
              <circle cx={pos.x} cy={pos.y} r={0.8} fill="white" opacity={0.9} />
            </g>
          );
        })}

      {/* ── Burst rings ───────────────────────────────────────── */}
      {!prefersReduced &&
        bursts.map((b) => (
          <circle
            key={b.id}
            cx={b.x}
            cy={b.y}
            r={4 + b.t * 14}
            fill="none"
            stroke={b.color}
            strokeWidth={1.5 * (1 - b.t)}
            opacity={0.6 * (1 - b.t)}
          />
        ))}

      {/* ── Static fallback for reduced motion ────────────────── */}
      {prefersReduced && (
        <text
          x={CX}
          y={CX + 55}
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
        >
          Event flow animation paused (reduced motion)
        </text>
      )}
    </svg>
  );
}
