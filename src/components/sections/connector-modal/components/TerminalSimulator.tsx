"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";
import type { Connector } from "@/data/connectors";

function generateSimOutput(connector: Connector): { text: string; delay: number }[] {
  const uc = connector.useCases[0];
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toISOString().slice(11, 23);
  };

  return [
    { text: `$ ${uc.command}`, delay: 0 },
    { text: `[${ts(0)}] Connecting to ${connector.label}...`, delay: 600 },
    { text: `[${ts(820)}] Connected. Fetching data...`, delay: 1200 },
    { text: `[${ts(1540)}] Working on ${uc.title.toLowerCase()}...`, delay: 1800 },
    { text: `[${ts(2300)}] Found 24 results. Filtering...`, delay: 2400 },
    { text: `[${ts(3100)}] All done! 3 items updated.`, delay: 3200 },
    { text: `[${ts(3400)}] Finished in 3.4s`, delay: 3800 },
  ];
}

export default function TerminalSimulator({ connector }: { connector: Connector }) {
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
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5" style={{ color: connector.color }} />
        <span className="text-base font-mono text-muted-dark">Live preview</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
        </div>
      </div>

      <div ref={containerRef} className="max-h-52 overflow-y-auto p-4 font-mono text-base leading-relaxed">
        {lines.map((line, i) => {
          const isCommand = line.startsWith("$");
          const isDone = line.includes("Finished in");
          const isSuccess = line.includes("All done!");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={isCommand ? "text-white font-semibold" : isDone || isSuccess ? "" : "text-muted"}
              style={isDone || isSuccess ? { color: connector.color } : undefined}
            >
              {isCommand && <ChevronRight className="mr-1 inline h-3 w-3" style={{ color: connector.color }} />}
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
