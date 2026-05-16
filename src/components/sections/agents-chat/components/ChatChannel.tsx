"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Bot, Hash } from "lucide-react";
import type { ChatMessage } from "../types";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import StarRating from "./StarRating";

const STICKY_BOTTOM_THRESHOLD_PX = 24;

export default function ChatChannel({
  channelName,
  messages,
  visibleCount,
  isTyping,
  isWorkflow,
  satisfaction,
  showSatisfaction,
  icon: Icon,
}: {
  channelName: string;
  messages: ChatMessage[];
  visibleCount: number;
  isTyping: boolean;
  isWorkflow: boolean;
  satisfaction: number;
  showSatisfaction: boolean;
  icon: ElementType;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distance <= STICKY_BOTTOM_THRESHOLD_PX;
      stickyBottomRef.current = atBottom;
      setShowJumpToLatest((prev) => (prev === !atBottom ? prev : !atBottom));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (stickyBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [visibleCount, isTyping]);

  const channelColor = isWorkflow ? "border-brand-rose/10" : "border-brand-emerald/10";
  const headerBg = isWorkflow ? "bg-brand-rose/[0.03]" : "bg-brand-emerald/[0.03]";
  const headerColor = isWorkflow ? "text-brand-rose/60" : "text-brand-emerald/60";
  const jumpChipColor = isWorkflow
    ? "border-brand-rose/30 bg-brand-rose/10 text-brand-rose/80 hover:bg-brand-rose/15"
    : "border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald/80 hover:bg-brand-emerald/15";

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stickyBottomRef.current = true;
    setShowJumpToLatest(false);
  };

  return (
    <div
      className={`rounded-xl border ${channelColor} overflow-hidden flex flex-col bg-white/[0.01]`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2.5 border-b ${channelColor} ${headerBg}`}
      >
        <Hash className={`h-3.5 w-3.5 ${headerColor}`} />
        <span className={`text-base font-mono tracking-wider ${headerColor}`}>
          {channelName}
        </span>
        <div className="ml-auto">
          <Icon className={`h-3.5 w-3.5 ${headerColor}`} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[200px] max-h-[320px]">
        <div
          ref={scrollRef}
          className="absolute inset-0 p-3 space-y-2 overflow-y-auto scrollbar-hide"
        >
          {messages.map((msg, i) => (
            <ChatBubble
              key={`${msg.timestamp}-${i}`}
              message={msg}
              isVisible={i < visibleCount}
            />
          ))}

          <AnimatePresence>
            {isTyping && visibleCount < messages.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Bot className="h-3 w-3 text-muted-dark" />
                <TypingIndicator
                  color={isWorkflow ? "bg-brand-rose/40" : "bg-brand-emerald/40"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showJumpToLatest && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              onClick={jumpToLatest}
              aria-label="Jump to latest message"
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono backdrop-blur-sm transition-colors ${jumpChipColor}`}
            >
              <ArrowDown className="h-3 w-3" />
              Jump to latest
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSatisfaction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`px-3 py-2.5 border-t ${channelColor} ${headerBg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-mono uppercase tracking-wider text-muted-dark">
                Satisfaction
              </span>
              <StarRating
                score={satisfaction}
                color={isWorkflow ? "text-brand-rose/70" : "text-brand-emerald/70"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
