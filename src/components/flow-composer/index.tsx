"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TerminalChrome from "@/components/TerminalChrome";
import { TerminalPanel } from "@/components/primitives";
import { VB_H, VB_W } from "./data";
import { useFlowComposer } from "./use-flow-composer";
import FlowHeader from "./components/FlowHeader";
import ToolSidebar from "./components/ToolSidebar";
import FlowCanvasDefs from "./components/FlowCanvasDefs";
import FlowWires from "./components/FlowWires";
import FlowNodes from "./components/FlowNodes";
import FlowLegend from "./components/FlowLegend";
import FlowCTA from "./components/FlowCTA";
import EventQueueBar from "./components/EventQueueBar";
import NodeConnectors from "./components/NodeConnectors";

export default function FlowComposer({ onClose }: { onClose: () => void }) {
  const uid = useId();
  const evGlow = `${uid}-cGlow`;
  const qGrad = `${uid}-cQGrad`;
  const qClip = `${uid}-cQClip`;

  const {
    nodes,
    wires,
    sidebarOpen,
    setSidebarOpen,
    wiringFrom,
    shareToast,
    setDragNode,
    svgRef,
    shareUrl,
    handlePointerMove,
    handlePointerUp,
    addNode,
    removeNode,
    handleNodeClick,
    removeWire,
    nodePos,
  } = useFlowComposer();

  const hasContent = nodes.length > 0;

  return (
    <div className="relative">
      <FlowHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShare={shareUrl}
        onClose={onClose}
      />

      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 z-30 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 px-4 py-1.5 text-base font-mono text-brand-cyan"
          >
            URL copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && <ToolSidebar nodes={nodes} onAddNode={addNode} />}
      </AnimatePresence>

      <TerminalPanel shadow="hero" bodyClassName="p-4 md:p-6">
        <TerminalChrome
          title="flow-composer — interactive"
          status={wiringFrom ? "wiring..." : "ready"}
          className="mb-4 pb-3"
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          style={{ minHeight: 340 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <FlowCanvasDefs evGlow={evGlow} qGrad={qGrad} qClip={qClip} />

          <EventQueueBar qGradId={qGrad} />

          <FlowWires
            wires={wires}
            nodePos={nodePos}
            evGlowId={evGlow}
            onRemoveWire={removeWire}
          />

          <NodeConnectors nodes={nodes} />

          {wiringFrom && (
            <text
              x="50"
              y="4"
              textAnchor="middle"
              fill="rgba(6,182,212,0.5)"
              fontSize="2"
              fontFamily="var(--font-geist-mono)"
            >
              Click a consumer node to complete the wire
            </text>
          )}

          <FlowNodes
            nodes={nodes}
            wiringFrom={wiringFrom}
            onNodePointerDown={(e, nodeId) => {
              e.stopPropagation();
              setDragNode(nodeId);
              (e.target as SVGElement).setPointerCapture?.(e.pointerId);
            }}
            onNodeClick={(e, nodeId) => {
              e.stopPropagation();
              handleNodeClick(nodeId);
            }}
            onNodeKeyDown={(e, nodeId) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleNodeClick(nodeId);
              }
            }}
            onRemoveNode={removeNode}
          />

          {!hasContent && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.2)"
              fontSize="3"
              fontFamily="var(--font-geist-mono)"
            >
              Click &quot;Add Node&quot; to start building
            </text>
          )}
        </svg>
      </TerminalPanel>

      {wires.length > 0 && <FlowCTA nodeCount={nodes.length} wireCount={wires.length} />}

      <FlowLegend />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-brand-cyan/4 via-transparent to-brand-purple/4 blur-2xl"
      />
    </div>
  );
}
