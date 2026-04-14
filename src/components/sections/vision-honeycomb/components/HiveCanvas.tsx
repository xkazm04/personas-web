"use client";

import type { AgentData } from "../types";
import { CONNECTIONS } from "../data";
import HexCell from "./HexCell";
import OrchestratorHex from "./OrchestratorHex";

interface Props {
  agents: AgentData[];
  hexPositions: { x: number; y: number }[];
  flashIdx: number | null;
  hoveredIdx: number | null;
  setHoveredIdx: (i: number | null) => void;
}

export default function HiveCanvas({ agents, hexPositions, flashIdx, hoveredIdx, setHoveredIdx }: Props) {
  const SVG_W = 500;
  const SVG_H = 420;
  const CENTER_X = SVG_W / 2;
  const CENTER_Y = SVG_H / 2;

  return (
    <div className="flex items-center justify-center px-4 py-6 overflow-hidden">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[500px]" style={{ overflow: "visible" }}>
        {CONNECTIONS.map(([a, b]) => {
          const pa = hexPositions[a];
          const pb = hexPositions[b];
          return (
            <line
              key={`conn-${a}-${b}`}
              x1={CENTER_X + pa.x}
              y1={CENTER_Y + pa.y}
              x2={CENTER_X + pb.x}
              y2={CENTER_Y + pb.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {hexPositions.map((pos, i) => (
          <line
            key={`to-center-${i}`}
            x1={CENTER_X + pos.x}
            y1={CENTER_Y + pos.y}
            x2={CENTER_X}
            y2={CENTER_Y}
            stroke={flashIdx === i ? agents[i].color : "rgba(255,255,255,0.04)"}
            strokeWidth={flashIdx === i ? 1.5 : 0.8}
            strokeDasharray="3 5"
            style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
          />
        ))}

        <OrchestratorHex cx={CENTER_X} cy={CENTER_Y} />

        {agents.map((agent, i) => (
          <HexCell
            key={agent.name}
            agent={agent}
            x={CENTER_X + hexPositions[i].x}
            y={CENTER_Y + hexPositions[i].y}
            index={i}
            isFlashing={flashIdx === i}
            isHovered={hoveredIdx === i}
            onHover={setHoveredIdx}
          />
        ))}
      </svg>
    </div>
  );
}
