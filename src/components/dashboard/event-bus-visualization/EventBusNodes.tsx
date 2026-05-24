import { SWARM_PERSONAS, SWARM_SOURCES, type SwarmNode } from "@/lib/mock-dashboard-data";
import type { Point } from "./eventBusGeometry";

export function EventBusSourceNodes({ sourcePositions, onNodeClick }: { sourcePositions: Point[]; onNodeClick?: (node: SwarmNode) => void }) {
  return (
    <>
      {SWARM_SOURCES.map((source, index) => {
        const pos = sourcePositions[index];
        const r = 10 + source.volume * 6;
        return (
          <g key={source.id} className="cursor-pointer" onClick={() => onNodeClick?.(source)}>
            <circle cx={pos.x} cy={pos.y} r={r} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            <text x={pos.x} y={pos.y + r + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui, sans-serif">{source.label}</text>
            <circle cx={pos.x + r - 2} cy={pos.y - r + 2} r="2" fill={source.color} opacity="0.6" />
          </g>
        );
      })}
    </>
  );
}

export function EventBusPersonaNodes({ personaPositions, prefersReduced, onNodeClick }: { personaPositions: Point[]; prefersReduced: boolean | null; onNodeClick?: (node: SwarmNode) => void }) {
  return (
    <>
      {SWARM_PERSONAS.map((persona, index) => {
        const pos = personaPositions[index];
        return (
          <g key={persona.id} className="cursor-pointer" onClick={() => onNodeClick?.(persona)}>
            <circle cx={pos.x} cy={pos.y} r={22} fill="none" stroke={persona.color} strokeOpacity="0.1" strokeWidth="1">
              {!prefersReduced && <animate attributeName="r" values="22;24;22" dur={`${2.5 + index * 0.3}s`} repeatCount="indefinite" />}
            </circle>
            <circle cx={pos.x} cy={pos.y} r={18} fill={`url(#grad-${persona.id})`} stroke={persona.color} strokeOpacity="0.35" strokeWidth="1.2" />
            {persona.volume > 0.7 && !prefersReduced && (
              <circle cx={pos.x} cy={pos.y} r={20} fill="none" stroke={persona.color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="12 114" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`} dur={`${3 - persona.volume}s`} repeatCount="indefinite" />
              </circle>
            )}
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="14">{persona.icon}</text>
            <text x={pos.x} y={pos.y + 32} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="500">{persona.label}</text>
          </g>
        );
      })}
    </>
  );
}
