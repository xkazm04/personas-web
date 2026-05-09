"use client";

import { useEffect, useRef, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Hash } from "lucide-react";
import type { ChatMessage } from "../types";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import StarRating from "./StarRating";

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, isTyping]);

  const channelColor = isWorkflow ? "border-brand-rose/10" : "border-brand-emerald/10";
  const headerBg = isWorkflow ? "bg-brand-rose/[0.03]" : "bg-brand-emerald/[0.03]";
  const headerColor = isWorkflow ? "text-brand-rose/60" : "text-brand-emerald/60";

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

      <div
        ref={scrollRef}
        className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px] max-h-[320px] scrollbar-hide"
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
