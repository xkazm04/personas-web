"use client";

import { SVG_EYEBROW } from "@/lib/typography";
import { useStillMotion } from "@/hooks/useStillMotion";
import { computeSwarmTiming } from "./swarmTiming";
import { swarmTools } from "../data";

export default function SwarmView({ uid }: { uid: string }) {
  // The swarm animates with SMIL, which the stylesheet's reduced-motion reset
  // cannot reach: that rule governs CSS animations only, so without this gate
  // the loop kept running for visitors who asked it to stop. Under reduced
  // motion the swarm renders still, and the travel the loop was showing (every
  // tool sends to the bus) is drawn as a direction mark on each connector
  // instead of being dropped: the message here is the flow, not an end state.
  const still = useStillMotion();

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
        <marker
          id={`${uid}-toBus`}
          viewBox="0 0 4 4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L4 2 L0 4 Z" fill="var(--brand-cyan)" fillOpacity="0.6" />
        </marker>
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
        fontSize={SVG_EYEBROW.fontSize}
        fontFamily={SVG_EYEBROW.fontFamily}
        letterSpacing={SVG_EYEBROW.letterSpacing}
      >
        BUS
      </text>

      {swarmTools.map((tool, i) => {
        const t = computeSwarmTiming(i, swarmTools.length);
        const iconSize = 5;

        return (
          <g key={tool.id} opacity={still ? "0.8" : "0"}>
            {!still && (
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0;0"
                keyTimes={t.opacityKeyTimes}
                dur={`${t.totalCycle}s`}
                begin={`${t.delay}s`}
                repeatCount="indefinite"
              />
            )}
            <line
              x1={t.x}
              y1={t.y}
              x2="50"
              y2="50"
              stroke="var(--foreground)"
              strokeOpacity={still ? "0.2" : "0.05"}
              strokeWidth="0.2"
              strokeDasharray="1 2"
            />
            {still && (
              // Direction mark a third of the way to the bus, clear of both the
              // tool badge and the core ring.
              <line
                x1={t.x + (50 - t.x) * 0.3}
                y1={t.y + (50 - t.y) * 0.3}
                x2={t.x + (50 - t.x) * 0.42}
                y2={t.y + (50 - t.y) * 0.42}
                stroke="var(--brand-cyan)"
                strokeOpacity="0.6"
                strokeWidth="0.3"
                markerEnd={`url(#${uid}-toBus)`}
              />
            )}

            <circle r="0.8" fill={tool.color} filter={`url(#${uid}-swarmGlow)`} cx={t.x} cy={t.y}>
              {!still && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0 0;${t.dx} ${t.dy};0 0;0 0`}
                  keyTimes={t.travelKeyTimes}
                  dur={`${t.totalCycle}s`}
                  begin={`${t.travelBegin}s`}
                  repeatCount="indefinite"
                />
              )}
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
