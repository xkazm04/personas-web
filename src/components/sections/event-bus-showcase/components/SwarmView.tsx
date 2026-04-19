"use client";

import { swarmTools } from "../data";

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
        const radius = 35;
        const angle = i * (360 / swarmTools.length) * (Math.PI / 180);
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        const delay = (i * 0.37) % 4;
        const duration = 3 + (i % 3);
        const totalCycle = duration + 1;

        const kt1 = ((duration * 0.33) / totalCycle).toFixed(4);
        const kt2 = ((duration * 0.66) / totalCycle).toFixed(4);
        const kt3 = (duration / totalCycle).toFixed(4);

        const pActive = ((duration * 0.4) / totalCycle).toFixed(4);
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
            <line
              x1={x}
              y1={y}
              x2="50"
              y2="50"
              stroke="var(--foreground)"
              strokeOpacity="0.05"
              strokeWidth="0.2"
              strokeDasharray="1 2"
            />

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
            <image
              href={`/tools/${tool.id}.svg`}
              x={x - iconSize / 2}
              y={y - iconSize / 2}
              width={iconSize}
              height={iconSize}
            />
            <text
              x={x}
              y={y + 6.5}
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
