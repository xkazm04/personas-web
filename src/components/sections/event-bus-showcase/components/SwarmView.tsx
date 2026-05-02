"use client";

import { swarmTools } from "../data";

const RADIUS = 35;
/** Stagger between adjacent nodes' lifecycle starts (seconds). */
const DELAY_STAGGER_S = 0.37;
/** Active phase max length (seconds): 3, 4, or 5 depending on i % 3. */
const ACTIVE_BASE_S = 3;
/** Quiet pause between cycles (seconds), added to active duration. */
const PAUSE_S = 1;

type SwarmTiming = {
  /** Position on the perimeter circle. */
  x: number;
  y: number;
  /** Vector from the perimeter back to the bus center (50, 50). */
  dx: string;
  dy: string;
  /** When this node's lifecycle starts (seconds from page load). */
  delay: number;
  /** Length of one full cycle (active + pause). */
  totalCycle: number;
  /** keyTimes for the opacity animation: ramp-in, hold, ramp-out, rest. */
  opacityKeyTimes: string;
  /** keyTimes for the travel-to-center pulse: rest, ping, rest. */
  travelKeyTimes: string;
  /** When the travel pulse fires within the cycle (seconds from delay). */
  travelBegin: number;
};

/**
 * Compute SVG SMIL animation timing for one node in the swarm. The
 * cycle is: opacity ramps in → node pulses toward the center → opacity
 * ramps out → quiet pause until next cycle. Numbers were author-tuned
 * for visual rhythm; the named constants at the top of this file are
 * the only knobs.
 */
function computeSwarmTiming(index: number, total: number): SwarmTiming {
  const angle = index * (360 / total) * (Math.PI / 180);
  const x = 50 + RADIUS * Math.cos(angle);
  const y = 50 + RADIUS * Math.sin(angle);

  // Delay wraps every 4s so the first ~10 nodes form a wave then loop.
  const delay = (index * DELAY_STAGGER_S) % 4;
  const activeDuration = ACTIVE_BASE_S + (index % 3);
  const totalCycle = activeDuration + PAUSE_S;

  // Three keyTime markers split the active phase into ramp-in / hold /
  // ramp-out, then the remainder is the quiet pause.
  const kt1 = ((activeDuration * 0.33) / totalCycle).toFixed(4);
  const kt2 = ((activeDuration * 0.66) / totalCycle).toFixed(4);
  const kt3 = (activeDuration / totalCycle).toFixed(4);

  // Travel pulse fires at 40% of the active phase and lasts ~one frame.
  const pActive = ((activeDuration * 0.4) / totalCycle).toFixed(4);
  const pEnd = Math.min(parseFloat(pActive) + 0.001, 1).toFixed(4);

  return {
    x,
    y,
    dx: (50 - x).toFixed(2),
    dy: (50 - y).toFixed(2),
    delay,
    totalCycle,
    opacityKeyTimes: `0;${kt1};${kt2};${kt3};1`,
    travelKeyTimes: `0;${pActive};${pEnd};1`,
    travelBegin: delay + activeDuration * 0.2,
  };
}

export default function SwarmView({ uid }: { uid: string }) {
  if (swarmTools.length === 0) {
    return (
      <div className="flex min-h-90 items-center justify-center text-base font-mono text-muted">
        No connected tools
      </div>
    );
  }

  return (
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
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="var(--foreground)"
        fillOpacity="0.05"
        stroke="var(--brand-cyan)"
        strokeOpacity="0.3"
        strokeWidth="0.5"
      />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--foreground)"
        fillOpacity="0.8"
        fontSize="2.5"
        fontFamily="var(--font-geist-mono)"
        letterSpacing="0.1em"
      >
        BUS
      </text>

      {swarmTools.map((tool, i) => {
        const t = computeSwarmTiming(i, swarmTools.length);
        const iconSize = 5;

        return (
          <g key={tool.id} opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.8;0.8;0;0"
              keyTimes={t.opacityKeyTimes}
              dur={`${t.totalCycle}s`}
              begin={`${t.delay}s`}
              repeatCount="indefinite"
            />
            <line
              x1={t.x}
              y1={t.y}
              x2="50"
              y2="50"
              stroke="var(--foreground)"
              strokeOpacity="0.05"
              strokeWidth="0.2"
              strokeDasharray="1 2"
            />

            <circle r="0.8" fill={tool.color} filter={`url(#${uid}-swarmGlow)`} cx={t.x} cy={t.y}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0;${t.dx} ${t.dy};0 0;0 0`}
                keyTimes={t.travelKeyTimes}
                dur={`${t.totalCycle}s`}
                begin={`${t.travelBegin}s`}
                repeatCount="indefinite"
              />
            </circle>

            <circle cx={t.x} cy={t.y} r="4.5" fill={`${tool.color}2a`} stroke={tool.color} strokeWidth="0.3" />
            <image
              href={`/tools/${tool.id}.svg`}
              x={t.x - iconSize / 2}
              y={t.y - iconSize / 2}
              width={iconSize}
              height={iconSize}
            />
            <text
              x={t.x}
              y={t.y + 6.5}
              textAnchor="middle"
              fill="var(--foreground)"
              fillOpacity="0.5"
              fontSize="1.8"
              fontFamily="var(--font-geist-mono)"
            >
              {tool.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
