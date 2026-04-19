"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Bot, Brain, Check, X, Zap } from "lucide-react";
import type { ChatMessage } from "../types";

export default function ChatBubble({
  message,
  isVisible,
}: {
  message: ChatMessage;
  isVisible: boolean;
}) {
  const prefersReduced = useReducedMotion();

  const toneStyles = {
    neutral: "border-glass bg-white/[0.03] text-muted",
    thinking: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/80 italic",
    warning: "border-yellow-400/20 bg-yellow-400/5 text-yellow-400/80",
    error: "border-brand-rose/20 bg-brand-rose/5 text-brand-rose/80",
    success: "border-brand-emerald/20 bg-brand-emerald/5 text-brand-emerald/80",
  };

  const toneIcon = {
    neutral: Bot,
    thinking: Brain,
    warning: AlertTriangle,
    error: X,
    success: Check,
  };

  const Icon = message.sender === "system" ? Zap : toneIcon[message.tone];
  const iconColor =
    message.tone === "error"
      ? "text-brand-rose/90"
      : message.tone === "warning"
        ? "text-yellow-400/90"
        : message.tone === "success"
          ? "text-brand-emerald/90"
          : message.tone === "thinking"
            ? "text-brand-purple/90"
            : "text-muted-dark";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`rounded-lg border px-3 py-2 ${toneStyles[message.tone]} ${
            message.sender === "system"
              ? "mx-2 text-center text-base font-mono uppercase tracking-wider"
              : "text-base leading-relaxed"
          }`}
        >
          <div className="flex items-start gap-2">
            {message.sender !== "system" && (
              <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${iconColor}`} />
            )}
            <div className="flex-1 min-w-0">
              <span>{message.text}</span>
            </div>
            <span className="shrink-0 text-base font-mono text-muted-dark mt-0.5">
              {message.timestamp}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
