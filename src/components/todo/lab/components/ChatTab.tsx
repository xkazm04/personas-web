"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, Bot, User, RotateCcw } from "lucide-react";
import { CHAT_SCRIPT } from "../data";
import type { ChatMsg } from "../types";
import TabBackdrop from "./TabBackdrop";

export default function ChatTab() {
  const reduced = useReducedMotion() ?? false;
  const [visible, setVisible] = useState<ChatMsg[]>(() =>
    reduced ? CHAT_SCRIPT : [],
  );
  const [phase, setPhase] = useState<"idle" | "running" | "done">(() =>
    reduced ? "done" : "idle",
  );
  const [prevReduced, setPrevReduced] = useState(reduced);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (reduced !== prevReduced) {
    setPrevReduced(reduced);
    if (reduced) {
      setVisible(CHAT_SCRIPT);
      setPhase("done");
    }
  }

  const run = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setVisible([]);
    setPhase("running");
    let cumulative = 400;
    CHAT_SCRIPT.forEach((msg, i) => {
      cumulative += msg.delay;
      const t = setTimeout(() => {
        setVisible((prev) => [...prev, msg]);
        if (containerRef.current) {
          requestAnimationFrame(() => {
            if (containerRef.current)
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
          });
        }
        if (i === CHAT_SCRIPT.length - 1) setPhase("done");
      }, cumulative);
      timeoutsRef.current.push(t);
    });
  }, []);

  useEffect(() => {
    if (reduced) return;
    const start = setTimeout(run, 0);
    return () => {
      clearTimeout(start);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [reduced, run]);

  return (
    <div className="force-dark relative flex flex-col rounded-xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden">
      <TabBackdrop tab="chat" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-brand-cyan" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            Refinement chat
          </span>
        </div>
        <div className="flex items-center gap-2 text-base font-mono text-foreground/70">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              phase === "running" ? "bg-brand-amber animate-pulse" : "bg-brand-emerald"
            }`}
          />
          {phase === "running" ? "applying changes" : "synced"}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[340px] overflow-y-auto px-5 py-4 space-y-3 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {visible.map((msg, i) => {
            if (msg.role === "diff") {
              return (
                <motion.div
                  key={`diff-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-10 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-3 py-2"
                >
                  <div className="text-base font-mono uppercase tracking-widest text-emerald-400/80 mb-1">
                    applied diff
                  </div>
                  <pre className="font-mono text-base text-emerald-300/90 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </pre>
                </motion.div>
              );
            }
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                    isUser ? "bg-brand-cyan/15" : "bg-brand-purple/15"
                  }`}
                >
                  {isUser ? (
                    <User className="h-3.5 w-3.5 text-brand-cyan" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-brand-purple" />
                  )}
                </div>
                <div
                  className={`max-w-[78%] rounded-xl border px-4 py-2 ${
                    isUser
                      ? "rounded-tr-sm border-brand-cyan/20 bg-brand-cyan/[0.06] text-foreground"
                      : "rounded-tl-sm border-foreground/[0.08] bg-foreground/[0.03] text-foreground/90"
                  }`}
                >
                  <p className="text-base leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center gap-3 border-t border-foreground/[0.06] px-5 py-3">
        <div className="flex-1 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-2 text-base text-foreground/60 font-mono">
          Tell the agent what to change…
        </div>
        <button
          onClick={run}
          disabled={phase === "running"}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 text-base font-mono uppercase tracking-wider text-brand-cyan disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" /> replay
        </button>
      </div>
    </div>
  );
}
