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
  seedNextId,
} from "./data";
import type { CanvasNode, Wire } from "./types";

export type ShareToast =
  | { kind: "success" }
  | { kind: "manual"; url: string };

export function useFlowComposer() {
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#flow=")) {
      const decoded = decodeFlow(window.location.hash.slice(6));
      if (decoded) {
        // Bump module-level _nextId past any hash-supplied id so addNode()
        // can never produce an id that collides with a decoded node.
        seedNextId(decoded.nodes);
        return decoded.nodes;
      }
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
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);
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
    if (!encoded) {
      // Encoder bailed (no btoa / SSR) — refuse to copy a broken
      // ".../#flow=" URL and surface the failure instead.
      setShareToast({ kind: "manual", url: "" });
      setTimeout(() => setShareToast(null), 4000);
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#flow=${encoded}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareToast({ kind: "success" });
        setTimeout(() => setShareToast(null), 2000);
      })
      .catch(() => {
        // http://, in-iframe demos, or denied permission — show the URL so
        // the user can manually Ctrl+C instead of pretending we copied it.
        setShareToast({ kind: "manual", url });
        setTimeout(() => setShareToast(null), 8000);
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
      // nextId() must run outside the updater; React 19 strict mode
      // double-invokes setState updaters in dev to verify purity, which
      // would otherwise burn a spare id per call.
      const id = nextId();
      setNodes((prev) => {
        const existing = prev.filter((n) => n.side === side);
        const x =
          existing.length === 0
            ? 50
            : Math.min(92, (existing[existing.length - 1]?.x ?? 50) + 18);
        return [...prev, { id, toolId, side, x }];
      });
      setSidebarOpen(false);
    },
    []
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
        const fromTool = TOOL_MAP.get(
          nodes.find((n) => n.id === wiringFrom)?.toolId ?? ""
        );
        const from = wiringFrom;
        const label = `${fromTool?.name ?? "event"}.trigger`;
        // Dedup against the freshest wires, not the closure snapshot — two
        // queued wire-completion clicks must not both pass the existence
        // check and create duplicate wires.
        setWires((prev) => {
          if (prev.some((w) => w.from === from && w.to === nodeId)) return prev;
          return [...prev, { from, to: nodeId, label }];
        });
      }
      setWiringFrom(null);
    },
    [wiringFrom, nodes, dragNode]
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
