"use client";

import { Cpu } from "lucide-react";
import TerminalChrome from "@/components/TerminalChrome";
import type { FlowNode, PlaygroundPhase } from "../types";
import ConnectionLine from "./ConnectionLine";
import FlowNodeCard from "./FlowNodeCard";

function computeEdges(nodes: FlowNode[]) {
  const edges: { from: FlowNode; to: FlowNode; active: boolean; done: boolean }[] =
    [];
  if (nodes.length === 0) return edges;

  const parse = nodes.find((n) => n.id === "parse");
  const select = nodes.find((n) => n.id === "select");
  if (parse && select)
    edges.push({
      from: parse,
      to: select,
      active: select.status === "active",
      done: select.status === "done",
    });

  const toolNodes = nodes.filter((n) => n.id.startsWith("tool-"));
  toolNodes.forEach((t) => {
    if (select)
      edges.push({
        from: select,
        to: t,
        active: t.status === "active",
        done: t.status === "done",
      });
  });

  const execute = nodes.find((n) => n.id === "execute");
  toolNodes.forEach((t) => {
    if (execute)
      edges.push({
        from: t,
        to: execute,
        active: execute.status === "active",
        done: execute.status === "done",
      });
  });

  const verify = nodes.find((n) => n.id === "verify");
  if (execute && verify)
    edges.push({
      from: execute,
      to: verify,
      active: verify.status === "active",
      done: verify.status === "done",
    });

  const result = nodes.find((n) => n.id === "result");
  if (verify && result)
    edges.push({
      from: verify,
      to: result,
      active: result.status === "active",
      done: result.status === "done",
    });

  return edges;
}

export default function AgentMindPanel({
  nodes,
  phase,
  reduced,
}: {
  nodes: FlowNode[];
  phase: PlaygroundPhase;
  reduced: boolean;
}) {
  const edges = computeEdges(nodes);
  const svgWidth = 600;
  const svgHeight =
    nodes.length > 0 ? Math.max(...nodes.map((n) => n.y)) + 60 : 400;

  return (
    <div>
      <TerminalChrome
        title="agent-mind"
        status={phase === "running" ? "thinking" : phase === "done" ? "complete" : "idle"}
        className="px-4 py-3"
      />

      <div className="relative p-4 overflow-hidden" style={{ minHeight: 460 }}>
        {phase === "idle" ? (
          <div className="flex h-full items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                <Cpu className="h-7 w-7 text-foreground" />
              </div>
              <p className="text-base text-foreground font-mono">
                Agent mind visualization
              </p>
              <p className="text-base text-foreground font-mono">
                Select a prompt to see the flowchart
              </p>
            </div>
          </div>
        ) : (
          <svg
            width="100%"
            height={svgHeight}
            className="mx-auto block max-w-full"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            {edges.map((edge, i) => (
              <ConnectionLine
                key={i}
                x1={edge.from.x}
                y1={edge.from.y + 20}
                x2={edge.to.x}
                y2={edge.to.y - 20}
                active={edge.active}
                done={edge.done}
                reduced={reduced}
              />
            ))}

            {nodes.map((node) => (
              <FlowNodeCard key={node.id} node={node} reduced={reduced} />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
