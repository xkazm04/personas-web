"use client";

import { useRef } from "react";
import { SVG_EYEBROW } from "@/lib/typography";
import { useLoopGate, useSvgTimelineGate } from "@/hooks/useLoopGate";
import { swarmTools } from "../data";
import { computeSwarmTiming } from "./swarmTiming";

/** Under reduced motion the loops flatten to this pose: visible, not blank. */
const REST_OPACITY = "0.8";
const STILL_OPACITY_VALUES = Array(5).fill(REST_OPACITY).join(";");
const STILL_TRAVEL_VALUES = "0 0;0 0;0 0;0 0";

/** SMIL follows the loop gate; under reduced motion values flatten, elements stay. */
export default function SwarmView({ uid }: { uid: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { run, still } = useLoopGate(svgRef);
  useSvgTimelineGate(svgRef, run);

  if (swarmTools.length === 0) {
    return (
      <div className="flex min-h-90 items-center justify-center text-base font-mono text-muted">
        No connected tools
      </div>
    );
  }

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className="w-full min-h-90">
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
          <g key={tool.id} opacity={still ? REST_OPACITY : "0"}>
            <animate
              attributeName="opacity"
              values={still ? STILL_OPACITY_VALUES : "0;0.8;0.8;0;0"}
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
              strokeOpacity={still ? "0.2" : "0.05"}
              strokeWidth="0.2"
              strokeDasharray="1 2"
            />
            {/* The loop's message is the flow (every tool sends to the bus). Still, the
                flow is drawn as a direction mark a third of the way in, clear of the
                badge and the core ring, instead of being dropped. Always rendered, so
                the element set never changes with the preference. */}
            <line
              x1={t.x + (50 - t.x) * 0.3}
              y1={t.y + (50 - t.y) * 0.3}
              x2={t.x + (50 - t.x) * 0.42}
              y2={t.y + (50 - t.y) * 0.42}
              stroke="var(--brand-cyan)"
              strokeOpacity={still ? "0.6" : "0"}
              strokeWidth="0.3"
              markerEnd={still ? `url(#${uid}-toBus)` : undefined}
            />

            <circle r="0.8" fill={tool.color} filter={`url(#${uid}-swarmGlow)`} cx={t.x} cy={t.y}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={still ? STILL_TRAVEL_VALUES : `0 0;${t.dx} ${t.dy};0 0;0 0`}
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
