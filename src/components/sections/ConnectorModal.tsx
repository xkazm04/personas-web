"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Terminal, ChevronRight } from "lucide-react";
import type { Connector } from "@/data/connectors";
import { categories } from "@/data/connectors";

/* ── Simulation output generator ── */

function generateSimOutput(connector: Connector): { text: string; delay: number }[] {
  const uc = connector.useCases[0];
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toISOString().slice(11, 23);
  };

  return [
    { text: `$ ${uc.command}`, delay: 0 },
    { text: `[${ts(0)}] Authenticating with ${connector.label} (${connector.authType})...`, delay: 600 },
    { text: `[${ts(820)}] Connection established. Fetching data...`, delay: 1200 },
    { text: `[${ts(1540)}] Processing ${uc.title.toLowerCase()}...`, delay: 1800 },
    { text: `[${ts(2300)}] Received 24 records. Applying filters...`, delay: 2400 },
    { text: `[${ts(3100)}] Task completed successfully. 3 items updated.`, delay: 3200 },
    { text: `[${ts(3400)}] Done in 3.4s`, delay: 3800 },
  ];
}

/* ── Terminal Simulator ── */

function TerminalSimulator({ connector }: { connector: Connector }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outputs = generateSimOutput(connector);
    const timers: ReturnType<typeof setTimeout>[] = [];

    outputs.forEach((o, i) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, o.text]);
        if (i === outputs.length - 1) setDone(true);
      }, o.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [connector]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-black/60">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5" style={{ color: connector.color }} />
        <span className="text-[11px] font-mono text-muted-dark">personas-agent</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Output area */}
      <div ref={containerRef} className="max-h-52 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed">
        {lines.map((line, i) => {
          const isCommand = line.startsWith("$");
          const isDone = line.includes("Done in");
          const isSuccess = line.includes("successfully");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`${
                isCommand
                  ? "text-white font-semibold"
                  : isDone || isSuccess
                    ? ""
                    : "text-muted"
              }`}
              style={
                isDone || isSuccess
                  ? { color: connector.color }
                  : undefined
              }
            >
              {isCommand && (
                <ChevronRight
                  className="mr-1 inline h-3 w-3"
                  style={{ color: connector.color }}
                />
              )}
              {line}
            </motion.div>
          );
        })}
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block h-4 w-1.5 translate-y-0.5"
            style={{ backgroundColor: connector.color }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Main Modal ── */

export default function ConnectorModal({
  connector,
  onClose,
}: {
  connector: Connector | null;
  onClose: () => void;
}) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simKey, setSimKey] = useState(0);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Reset simulator state when connector changes
  useEffect(() => {
    setShowSimulator(false);
    setSimKey((k) => k + 1);
  }, [connector]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (connector) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [connector]);

  const categoryMeta = connector
    ? categories.find((c) => c.key === connector.category)
    : null;

  return (
    <AnimatePresence>
      {connector && (
        <motion.div
          key="connector-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal content */}
          <motion.div
            key="connector-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0a0a12] shadow-2xl shadow-black/50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted-dark transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{
                background: `linear-gradient(90deg, transparent, ${connector.color}60, transparent)`,
              }}
            />

            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-start gap-4">
                {/* Monogram / icon circle */}
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold"
                  style={{
                    borderColor: `${connector.color}30`,
                    backgroundColor: `${connector.color}10`,
                    color: connector.color,
                  }}
                >
                  {connector.monogram}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {connector.label}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* Category badge */}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                      style={{
                        backgroundColor: `${connector.color}10`,
                        color: connector.color,
                        border: `1px solid ${connector.color}25`,
                      }}
                    >
                      {categoryMeta?.label ?? connector.category}
                    </span>

                    {/* Auth type */}
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-muted-dark">
                      {connector.authType}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {connector.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-8 h-px bg-white/[0.06]" />

            {/* Use case cards */}
            <div className="px-8 py-6 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-dark mb-4">
                Use Cases
              </h3>
              {connector.useCases.map((uc, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{
                        backgroundColor: `${connector.color}15`,
                        color: connector.color,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white">
                        {uc.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-dark">
                        {uc.description}
                      </p>
                      <code
                        className="mt-2 block truncate rounded-md border px-2.5 py-1.5 text-[11px] font-mono"
                        style={{
                          borderColor: `${connector.color}15`,
                          backgroundColor: `${connector.color}05`,
                          color: `${connector.color}cc`,
                        }}
                      >
                        {uc.command}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-8 h-px bg-white/[0.06]" />

            {/* Try it now toggle */}
            <div className="px-8 py-6">
              <button
                onClick={() => {
                  if (!showSimulator) {
                    setSimKey((k) => k + 1);
                  }
                  setShowSimulator(!showSimulator);
                }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 text-sm font-medium transition-all hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer w-full"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${connector.color}15`,
                  }}
                >
                  <Play
                    className="h-4 w-4"
                    style={{ color: connector.color }}
                  />
                </div>
                <span className="text-white">Try it now</span>
                <div className="ml-auto">
                  <div
                    className={`h-5 w-9 rounded-full transition-colors duration-300 flex items-center ${
                      showSimulator ? "justify-end" : "justify-start"
                    }`}
                    style={{
                      backgroundColor: showSimulator
                        ? `${connector.color}40`
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <motion.div
                      layout
                      className="h-3.5 w-3.5 rounded-full mx-0.5"
                      style={{
                        backgroundColor: showSimulator
                          ? connector.color
                          : "rgba(255,255,255,0.3)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showSimulator && (
                  <motion.div
                    key={`sim-${simKey}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <TerminalSimulator
                      key={`terminal-${simKey}`}
                      connector={connector}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
