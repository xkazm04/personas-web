"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  GitBranch,
  Trophy,
  Skull,
  Star,
  Timer,
  Play,
  RotateCcw,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

interface TreeNode {
  id: string;
  version: string;
  fitness: number;
  generation: number;
  parentId: string | null;
  x: number; // 0-1 normalized
  alive: boolean;
  isBestPath: boolean;
  color: string;
  label: string;
  visible: boolean;
}

interface Branch {
  fromId: string;
  toId: string;
  visible: boolean;
}

const LINEAGE_COLORS = [
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#f43f5e", // rose
  "#fbbf24", // amber
  "#34d399", // emerald
  "#60a5fa", // blue
  "#f472b6", // pink
  "#c084fc", // violet
];

const TRAIT_LABELS = [
  "tone:formal",
  "len:concise",
  "tools:on",
  "reason:cot",
  "temp:0.3",
  "ctx:32k",
  "output:json",
  "safety:strict",
  "tone:casual",
  "len:detail",
  "tools:auto",
  "reason:direct",
  "temp:0.7",
  "ctx:128k",
  "output:md",
  "focus:narrow",
];

function buildTree(): { nodes: TreeNode[]; branches: Branch[]; bestPath: string[] } {
  const nodes: TreeNode[] = [];
  const branches: Branch[] = [];

  // Generation 0: root
  const root: TreeNode = {
    id: "v1",
    version: "v1",
    fitness: 62,
    generation: 0,
    parentId: null,
    x: 0.5,
    alive: true,
    isBestPath: false,
    color: LINEAGE_COLORS[0],
    label: TRAIT_LABELS[0],
    visible: false,
  };
  nodes.push(root);

  // Build tree structure generation by generation
  const genCounts = [1, 2, 4, 6, 8, 6]; // nodes per generation
  let versionCounter = 1;
  const nodesByGen: TreeNode[][] = [[root]];

  for (let gen = 1; gen < genCounts.length; gen++) {
    const count = genCounts[gen];
    const parents = nodesByGen[gen - 1];
    const genNodes: TreeNode[] = [];
    const spacing = 1 / (count + 1);

    for (let i = 0; i < count; i++) {
      versionCounter++;
      const parent = parents[Math.min(Math.floor(i * parents.length / count), parents.length - 1)];
      const parentColorIdx = LINEAGE_COLORS.indexOf(parent.color);
      // Slight color variation from parent
      const colorIdx =
        Math.random() > 0.7
          ? (parentColorIdx + 1 + Math.floor(Math.random() * 2)) % LINEAGE_COLORS.length
          : parentColorIdx;
      // Fitness generally increases but with dead ends
      const baseFitness = parent.fitness + Math.floor(Math.random() * 12) - 3;
      const fitness = Math.max(45, Math.min(98, baseFitness));
      const alive = gen < genCounts.length - 1 || fitness > 70;

      const node: TreeNode = {
        id: `v${versionCounter}`,
        version: `v${versionCounter}`,
        fitness,
        generation: gen,
        parentId: parent.id,
        x: spacing * (i + 1),
        alive,
        isBestPath: false,
        color: LINEAGE_COLORS[colorIdx],
        label: TRAIT_LABELS[(versionCounter - 1) % TRAIT_LABELS.length],
        visible: false,
      };
      nodes.push(node);
      genNodes.push(node);
      branches.push({ fromId: parent.id, toId: node.id, visible: false });
    }
    nodesByGen.push(genNodes);
  }

  // Find best path (highest fitness chain from leaf to root)
  const leaves = nodes.filter(
    (n) => n.generation === genCounts.length - 1 && n.alive
  );
  let bestLeaf = leaves.reduce(
    (best, n) => (n.fitness > best.fitness ? n : best),
    leaves[0]
  );

  // If no alive leaves, pick the best overall
  if (!bestLeaf) {
    bestLeaf = nodes.reduce((best, n) => (n.fitness > best.fitness ? n : best), nodes[0]);
  }

  const bestPath: string[] = [];
  let current: TreeNode | undefined = bestLeaf;
  while (current) {
    bestPath.unshift(current.id);
    current.isBestPath = true;
    current = current.parentId ? nodes.find((n) => n.id === current!.parentId) : undefined;
  }

  return { nodes, branches, bestPath };
}

/* ------------------------------------------------------------------ */
/*  SVG layout constants                                               */
/* ------------------------------------------------------------------ */

const TREE_WIDTH = 600;
const TREE_HEIGHT = 500;
const GEN_HEIGHT = TREE_HEIGHT / 6;
const MARGIN_X = 50;
const MARGIN_TOP = 40;
const NODE_RADIUS = 14;

function getNodePos(node: TreeNode): { x: number; y: number } {
  return {
    x: MARGIN_X + node.x * (TREE_WIDTH - 2 * MARGIN_X),
    y: TREE_HEIGHT - MARGIN_TOP - node.generation * GEN_HEIGHT,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GenomeTree() {
  const prefersReducedMotion = useReducedMotion();
  const [treeData, setTreeData] = useState(() => buildTree());
  const [nodes, setNodes] = useState<TreeNode[]>(treeData.nodes);
  const [branchesState, setBranches] = useState<Branch[]>(treeData.branches);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [growing, setGrowing] = useState(false);
  const [growStep, setGrowStep] = useState(0);
  const growRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hasGrown, setHasGrown] = useState(false);

  const maxGeneration = useMemo(
    () => Math.max(...nodes.map((n) => n.generation)),
    [nodes]
  );

  // Reset and regrow tree
  const resetTree = useCallback(() => {
    const data = buildTree();
    setTreeData(data);
    setNodes(data.nodes);
    setBranches(data.branches);
    setSelectedNode(null);
    setGrowStep(0);
    setHasGrown(false);
    setGrowing(false);
  }, []);

  // Grow animation: reveal nodes generation by generation
  const startGrow = useCallback(() => {
    if (growing) return;
    setGrowing(true);
    setGrowStep(0);
    // Reset visibility
    setNodes((prev) => prev.map((n) => ({ ...n, visible: false })));
    setBranches((prev) => prev.map((b) => ({ ...b, visible: false })));

    let step = 0;
    const maxGen = Math.max(...treeData.nodes.map((n) => n.generation));

    const advanceStep = () => {
      if (step > maxGen) {
        setGrowing(false);
        setHasGrown(true);
        return;
      }
      const currentGen = step;
      setGrowStep(currentGen);

      // Reveal nodes at this generation
      setNodes((prev) =>
        prev.map((n) => (n.generation <= currentGen ? { ...n, visible: true } : n))
      );
      // Reveal branches that connect to this generation
      setBranches((prev) =>
        prev.map((b) => {
          const toNode = treeData.nodes.find((n) => n.id === b.toId);
          return toNode && toNode.generation <= currentGen
            ? { ...b, visible: true }
            : b;
        })
      );

      step++;
      growRef.current = setTimeout(advanceStep, prefersReducedMotion ? 100 : 700);
    };
    advanceStep();
  }, [growing, treeData, prefersReducedMotion]);

  useEffect(() => () => clearTimeout(growRef.current), []);

  // Auto-start grow on mount
  useEffect(() => {
    if (!hasGrown && !growing) {
      const timeout = setTimeout(startGrow, 800);
      return () => clearTimeout(timeout);
    }
  }, [hasGrown, growing, startGrow]);

  const selectedNodeData = selectedNode
    ? nodes.find((n) => n.id === selectedNode)
    : null;

  return (
    <SectionWrapper id="genome-tree" className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-purple/[0.03] blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-cyan/[0.03] blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center relative z-10"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Evolutionary{" "}
            <GradientText className="drop-shadow-lg">phylogenetic tree</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-muted-dark font-light"
        >
          Watch prompt lineages branch, compete, and evolve.{" "}
          <span className="text-white/80 font-medium">
            The fittest survive, dead ends fade away.
          </span>
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.3fr_1fr] relative z-10">
        {/* Left: phylogenetic tree SVG */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]"
        >
          <TerminalChrome
            title="phylogenetic-tree"
            status={growing ? "growing" : "complete"}
            info={`gen ${growStep}/${maxGeneration}`}
            className="px-5 py-3"
          />

          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`}
              className="w-full h-auto min-w-[400px]"
              style={{ maxHeight: 500 }}
            >
              <defs>
                <linearGradient id="best-path-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <filter id="tree-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="best-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Generation axis labels (left side) */}
              {Array.from({ length: maxGeneration + 1 }, (_, gen) => {
                const y = TREE_HEIGHT - MARGIN_TOP - gen * GEN_HEIGHT;
                return (
                  <g key={`gen-label-${gen}`}>
                    {/* Dashed horizontal line */}
                    <line
                      x1={20}
                      y1={y}
                      x2={TREE_WIDTH - 10}
                      y2={y}
                      stroke="rgba(255,255,255,0.04)"
                      strokeDasharray="4 6"
                    />
                    <text
                      x={12}
                      y={y + 1}
                      textAnchor="end"
                      dominantBaseline="central"
                      fontSize={8}
                      fontFamily="monospace"
                      fill="rgba(255,255,255,0.2)"
                    >
                      G{gen}
                    </text>
                  </g>
                );
              })}

              {/* Branches */}
              {branchesState.map((branch) => {
                const fromNode = nodes.find((n) => n.id === branch.fromId);
                const toNode = nodes.find((n) => n.id === branch.toId);
                if (!fromNode || !toNode) return null;
                const from = getNodePos(fromNode);
                const to = getNodePos(toNode);
                const isBestPath =
                  fromNode.isBestPath && toNode.isBestPath;
                const isDead = !toNode.alive;
                const midY = (from.y + to.y) / 2;
                const pathD = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

                // Stroke dash animation for drawing effect
                const pathLength = 300; // approximate

                return (
                  <g key={`${branch.fromId}-${branch.toId}`}>
                    {branch.visible ? (
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke={
                          isBestPath
                            ? "url(#best-path-grad)"
                            : isDead
                            ? "rgba(255,255,255,0.06)"
                            : `${toNode.color}40`
                        }
                        strokeWidth={isBestPath ? 3 : isDead ? 1 : 2}
                        strokeLinecap="round"
                        filter={isBestPath ? "url(#best-glow)" : undefined}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: 1,
                          opacity: isDead ? 0.3 : 1,
                        }}
                        transition={{
                          pathLength: {
                            duration: prefersReducedMotion ? 0.1 : 0.6,
                            ease: "easeInOut",
                          },
                          opacity: { duration: 0.3 },
                        }}
                      />
                    ) : null}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                if (!node.visible) return null;
                const pos = getNodePos(node);
                const isSelected = selectedNode === node.id;
                const isDead = !node.alive;
                const isBest =
                  node.isBestPath &&
                  node.generation === maxGeneration;

                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: isDead ? 0.35 : 1,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.4,
                      duration: prefersReducedMotion ? 0.1 : 0.5,
                    }}
                    style={{
                      originX: `${pos.x}px`,
                      originY: `${pos.y}px`,
                    }}
                    onClick={() =>
                      setSelectedNode(selectedNode === node.id ? null : node.id)
                    }
                    className="cursor-pointer"
                  >
                    {/* Selection ring */}
                    {isSelected && (
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={NODE_RADIUS + 5}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.6}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from={`0 ${pos.x} ${pos.y}`}
                          to={`360 ${pos.x} ${pos.y}`}
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </motion.circle>
                    )}

                    {/* Best path glow */}
                    {node.isBestPath && !isDead && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={NODE_RADIUS + 3}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1}
                        opacity={0.3}
                        filter="url(#tree-glow)"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS}
                      fill={isDead ? "rgba(255,255,255,0.03)" : `${node.color}20`}
                      stroke={isDead ? "rgba(255,255,255,0.08)" : `${node.color}${isSelected ? "80" : "50"}`}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />

                    {/* Fitness score text */}
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={9}
                      fontFamily="monospace"
                      fontWeight={700}
                      fill={
                        isDead
                          ? "rgba(255,255,255,0.2)"
                          : node.isBestPath
                          ? "#34d399"
                          : "rgba(255,255,255,0.7)"
                      }
                    >
                      {node.fitness}
                    </text>

                    {/* Version label above */}
                    <text
                      x={pos.x}
                      y={pos.y - NODE_RADIUS - 5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={7}
                      fontFamily="monospace"
                      fill={isDead ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)"}
                    >
                      {node.version}
                    </text>

                    {/* Dead skull / best star */}
                    {isDead && (
                      <text
                        x={pos.x + NODE_RADIUS + 3}
                        y={pos.y}
                        dominantBaseline="central"
                        fontSize={8}
                        fill="rgba(244,63,94,0.4)"
                      >
                        x
                      </text>
                    )}
                    {isBest && (
                      <g>
                        <circle
                          cx={pos.x + NODE_RADIUS + 2}
                          cy={pos.y - NODE_RADIUS - 2}
                          r={7}
                          fill="#fbbf2430"
                          stroke="#fbbf2460"
                          strokeWidth={0.5}
                        />
                        <text
                          x={pos.x + NODE_RADIUS + 2}
                          y={pos.y - NODE_RADIUS - 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={8}
                          fill="#fbbf24"
                        >
                          ★
                        </text>
                      </g>
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Controls */}
          <div className="border-t border-white/4 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={startGrow}
                disabled={growing}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono transition-all duration-300 ${
                  growing
                    ? "border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald/70"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-brand-cyan/20 hover:bg-brand-cyan/5 hover:text-brand-cyan/80"
                }`}
              >
                <Play className="h-3 w-3" />
                {growing ? "Growing..." : "Replay"}
              </button>
              <button
                onClick={resetTree}
                disabled={growing}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/50 transition-all hover:border-white/20 hover:text-white/70 disabled:opacity-30"
              >
                <RotateCcw className="h-3 w-3" />
                New tree
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/25">
              <span className="flex items-center gap-1">
                <span className="h-2 w-6 rounded-full bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-emerald" />
                best path
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white/10" />
                dead end
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right: detail panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-4"
        >
          {/* Node inspector */}
          <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            <TerminalChrome
              title="node-inspector"
              status={selectedNodeData ? "viewing" : "idle"}
              info={selectedNodeData ? selectedNodeData.version : "select a node"}
              className="px-5 py-3"
            />
            <div className="p-5 min-h-[180px]">
              <AnimatePresence mode="wait">
                {selectedNodeData ? (
                  <motion.div
                    key={selectedNodeData.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${selectedNodeData.color}20` }}
                        >
                          {selectedNodeData.alive ? (
                            <GitBranch
                              className="h-5 w-5"
                              style={{ color: selectedNodeData.color }}
                            />
                          ) : (
                            <Skull className="h-5 w-5 text-brand-rose/60" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-mono font-bold text-white/90">
                            {selectedNodeData.version}
                          </div>
                          <div className="text-[10px] font-mono text-white/30">
                            Generation {selectedNodeData.generation}
                          </div>
                        </div>
                      </div>
                      <motion.div
                        key={selectedNodeData.fitness}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="text-right"
                      >
                        <div className="text-2xl font-bold font-mono" style={{ color: selectedNodeData.color }}>
                          {selectedNodeData.fitness}
                        </div>
                        <div className="text-[9px] font-mono text-white/25">fitness</div>
                      </motion.div>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-2">
                      {[
                        { label: "Trait", value: selectedNodeData.label },
                        {
                          label: "Parent",
                          value: selectedNodeData.parentId || "root (no parent)",
                        },
                        {
                          label: "Status",
                          value: selectedNodeData.alive ? "Alive" : "Dead end",
                        },
                        {
                          label: "Best path",
                          value: selectedNodeData.isBestPath ? "Yes" : "No",
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between rounded-md border border-white/4 bg-white/2 px-3 py-2"
                        >
                          <span className="text-[10px] font-mono text-white/30">
                            {row.label}
                          </span>
                          <span
                            className="text-xs font-mono"
                            style={{
                              color:
                                row.label === "Status"
                                  ? selectedNodeData.alive
                                    ? "#34d399"
                                    : "#f43f5e"
                                  : row.label === "Best path" && selectedNodeData.isBestPath
                                  ? "#fbbf24"
                                  : "rgba(255,255,255,0.6)",
                            }}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Fitness bar */}
                    <div>
                      <div className="h-2 rounded-full bg-white/4 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: selectedNodeData.color }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${selectedNodeData.fitness}%`,
                          }}
                          transition={{
                            type: "spring",
                            bounce: 0,
                            duration: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[160px] text-center"
                  >
                    <GitBranch className="h-8 w-8 text-white/10 mb-3" />
                    <div className="text-xs font-mono text-white/20">
                      Click a node on the tree
                    </div>
                    <div className="text-[10px] font-mono text-white/10 mt-1">
                      to inspect its lineage and fitness
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Evolution stats */}
          <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            <TerminalChrome
              title="evolution-stats"
              status="live"
              className="px-5 py-3"
            />
            <div className="p-4 space-y-3">
              {(() => {
                const visibleNodes = nodes.filter((n) => n.visible);
                const aliveNodes = visibleNodes.filter((n) => n.alive);
                const deadNodes = visibleNodes.filter((n) => !n.alive);
                const bestFitness = visibleNodes.length
                  ? Math.max(...visibleNodes.map((n) => n.fitness))
                  : 0;
                const avgFitness = aliveNodes.length
                  ? Math.round(
                      aliveNodes.reduce((s, n) => s + n.fitness, 0) /
                        aliveNodes.length
                    )
                  : 0;

                const stats = [
                  {
                    label: "Best fitness",
                    value: bestFitness,
                    color: "#34d399",
                    icon: Trophy,
                  },
                  {
                    label: "Avg fitness",
                    value: avgFitness,
                    color: "#06b6d4",
                    icon: Activity,
                  },
                  {
                    label: "Alive branches",
                    value: aliveNodes.length,
                    color: "#a855f7",
                    icon: GitBranch,
                  },
                  {
                    label: "Dead ends",
                    value: deadNodes.length,
                    color: "#f43f5e",
                    icon: Skull,
                  },
                  {
                    label: "Generations",
                    value: growStep,
                    color: "#fbbf24",
                    icon: Timer,
                  },
                ];

                return stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-lg border border-white/4 bg-white/2 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <stat.icon
                        className="h-3.5 w-3.5"
                        style={{ color: `${stat.color}80` }}
                      />
                      <span className="text-[11px] font-mono text-white/40">
                        {stat.label}
                      </span>
                    </div>
                    <motion.span
                      key={stat.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold font-mono"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </motion.span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Best path lineage */}
          <div className="rounded-xl border border-white/8 bg-black/50 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-3.5 w-3.5 text-brand-amber/60" />
              <span className="text-[10px] font-mono text-white/30">
                Best evolutionary path
              </span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {treeData.bestPath.map((nodeId, i) => {
                const node = nodes.find((n) => n.id === nodeId);
                if (!node) return null;
                const isVisible = node.visible;
                return (
                  <div key={nodeId} className="flex items-center gap-1 shrink-0">
                    <motion.button
                      onClick={() => setSelectedNode(nodeId)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: isVisible ? 1 : 0.2,
                        scale: isVisible ? 1 : 0.8,
                      }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-mono transition-all ${
                        selectedNode === nodeId
                          ? "border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald/80"
                          : "border-white/6 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60"
                      }`}
                    >
                      <span>{node.version}</span>
                      <span className="text-brand-emerald/60">{node.fitness}</span>
                    </motion.button>
                    {i < treeData.bestPath.length - 1 && (
                      <span className="text-white/10 text-[8px]">&rarr;</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

// Helper icon used inline in stats
function Activity(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
