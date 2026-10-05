"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";
import type { Connector } from "@/data/connectors";
import { useTranslation } from "@/i18n/useTranslation";
import { buildTerminalScript } from "../terminalScript";

export default function TerminalSimulator({ connector }: { connector: Connector }) {
  const { t } = useTranslation();
  const strings = t.connectorModal;
  // Simulated: the script is narrated from this connector's own data, and nothing runs.
  const script = useMemo(() => buildTerminalScript(connector, strings), [connector, strings]);
  const [shown, setShown] = useState(0);
  const done = shown >= script.length;
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = script.map((line, i) =>
      setTimeout(() => setShown((prev) => Math.max(prev, i + 1)), line.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [script]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [shown]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-glass bg-black/60">
      <div className="flex items-center gap-2 border-b border-glass px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5" style={{ color: connector.color }} />
        <span className="text-base font-mono text-muted-dark">{strings.simulatedLabel}</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
        </div>
      </div>

      <div ref={containerRef} className="max-h-52 overflow-y-auto p-4 font-mono text-base leading-relaxed">
        {script.slice(0, shown).map((line, i) => {
          const isPrompt = line.kind === "prompt";
          const isSuccess = line.kind === "success";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={isPrompt ? "text-white font-semibold" : isSuccess ? "" : "text-muted"}
              style={isSuccess ? { color: connector.color } : undefined}
            >
              {isPrompt && <ChevronRight className="mr-1 inline h-3 w-3" style={{ color: connector.color }} />}
              {line.text}
            </motion.div>
          );
        })}
        {!done && (
          <motion.span
            animate={reduced ? { opacity: 1 } : { opacity: [1, 0] }}
            transition={reduced ? undefined : { repeat: Infinity, duration: 0.8 }}
            className="inline-block h-4 w-1.5 translate-y-0.5"
            style={{ backgroundColor: connector.color }}
          />
        )}
      </div>
    </div>
  );
}
