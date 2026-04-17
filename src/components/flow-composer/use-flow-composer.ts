"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONSUMER_Y,
  DEFAULT_NODES,
  DEFAULT_WIRES,
  PRODUCER_Y,
  QUEUE_Y,
  TOOL_MAP,
  VB_W,
  decodeFlow,
  encodeFlow,
  nextId,
} from "./data";
import type { CanvasNode, Wire } from "./types";

export function useFlowComposer() {
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#flow=")) {
      const decoded = decodeFlow(window.location.hash.slice(6));
      if (decoded) return decoded.nodes;
    }
    return DEFAULT_NODES;
  });

  const [wires, setWires] = useState<Wire[]>(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#flow=")) {
      const decoded = decodeFlow(window.location.hash.slice(6));
      if (decoded) return decoded.wires;
    }
    return DEFAULT_WIRES;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wiringFrom, setWiringFrom] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafPending = useRef(false);
  const hashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync hash — debounced 500ms
  useEffect(() => {
    if (hashTimerRef.current) clearTimeout(hashTimerRef.current);
    hashTimerRef.current = setTimeout(() => {
      const encoded = encodeFlow({ nodes, wires });
      if (encoded) {
        window.history.replaceState(null, "", `#flow=${encoded}`);
      }
      hashTimerRef.current = null;
    }, 500);
    return () => {
      if (hashTimerRef.current) clearTimeout(hashTimerRef.current);
    };
  }, [nodes, wires]);

  const shareUrl = useCallback(() => {
    const encoded = encodeFlow({ nodes, wires });
    const url = `${window.location.origin}${window.location.pathname}#flow=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }, [nodes, wires]);

  const toSvgX = useCallback((clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return 50;
    const rect = svg.getBoundingClientRect();
    const ratio = VB_W / rect.width;
    return Math.max(8, Math.min(92, (clientX - rect.left) * ratio));
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragNode || rafPending.current) return;
      const clientX = e.clientX;
      rafPending.current = true;
      /* rAF here is a pointer-move throttle (one update per paint for drag),
         not an animation — reduced-motion gating doesn't apply. */
      // eslint-disable-next-line custom-animation/require-animation-gating
      requestAnimationFrame(() => {
        rafPending.current = false;
        const x = toSvgX(clientX);
        setNodes((prev) => prev.map((n) => (n.id === dragNode ? { ...n, x } : n)));
      });
    },
    [dragNode, toSvgX]
  );

  const handlePointerUp = useCallback(() => {
    setDragNode(null);
  }, []);

  const addNode = useCallback(
    (toolId: string, side: "producer" | "consumer") => {
      const existing = nodes.filter((n) => n.side === side);
      const x =
        existing.length === 0
          ? 50
          : Math.min(92, (existing[existing.length - 1]?.x ?? 50) + 18);
      const id = nextId();
      setNodes((prev) => [...prev, { id, toolId, side, x }]);
      setSidebarOpen(false);
    },
    [nodes]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setWires((prev) => prev.filter((w) => w.from !== nodeId && w.to !== nodeId));
      if (wiringFrom === nodeId) setWiringFrom(null);
    },
    [wiringFrom]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (dragNode) return;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (!wiringFrom) {
        if (node.side === "producer") setWiringFrom(nodeId);
        return;
      }

      if (node.side === "consumer" && wiringFrom !== nodeId) {
        const exists = wires.some((w) => w.from === wiringFrom && w.to === nodeId);
        if (!exists) {
          const fromTool = TOOL_MAP.get(
            nodes.find((n) => n.id === wiringFrom)?.toolId ?? ""
          );
          setWires((prev) => [
            ...prev,
            { from: wiringFrom, to: nodeId, label: `${fromTool?.name ?? "event"}.trigger` },
          ]);
        }
      }
      setWiringFrom(null);
    },
    [wiringFrom, nodes, wires, dragNode]
  );

  const removeWire = useCallback((from: string, to: string) => {
    setWires((prev) => prev.filter((w) => !(w.from === from && w.to === to)));
  }, []);

  const nodePos = useCallback(
    (id: string): { x: number; y: number } => {
      const n = nodes.find((nd) => nd.id === id);
      if (!n) return { x: 50, y: QUEUE_Y };
      return { x: n.x, y: n.side === "producer" ? PRODUCER_Y : CONSUMER_Y };
    },
    [nodes]
  );

  return {
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
  };
}
