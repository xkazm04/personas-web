"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Brain,
  Check,
  Hash,
  MessageSquare,
  Pause,
  Play,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";

/* ── Types ── */

interface ChatMessage {
  sender: "bot" | "system";
  text: string;
  tone: "neutral" | "warning" | "error" | "success" | "thinking";
  timestamp: string;
}

interface ChatScenario {
  id: string;
  name: string;
  userMessage: string;
  workflow: {
    messages: ChatMessage[];
    satisfaction: number;
  };
  agent: {
    messages: ChatMessage[];
    satisfaction: number;
  };
}

/* ── Scenario Data ── */

const scenarios: ChatScenario[] = [
  {
    id: "ambiguous-email",
    name: "Ambiguous Request",
    userMessage:
      "Cancel my order #4821... actually, never mind, just change the shipping address to 742 Evergreen Terrace.",
    workflow: {
      messages: [
        {
          sender: "bot",
          text: "Processing cancellation for order #4821...",
          tone: "neutral",
          timestamp: "0:01",
        },
        {
          sender: "bot",
          text: "Order #4821 found. Initiating cancellation workflow.",
          tone: "neutral",
          timestamp: "0:03",
        },
        {
          sender: "system",
          text: "WARNING: I detected conflicting instructions. I can't understand what you actually want.",
          tone: "warning",
          timestamp: "0:05",
        },
        {
          sender: "bot",
          text: "I can only handle one thing at a time. Please create a new request for the address change.",
          tone: "error",
          timestamp: "0:08",
        },
        {
          sender: "system",
          text: "Transferred to our team. Expected wait: 47 minutes.",
          tone: "error",
          timestamp: "0:10",
        },
      ],
      satisfaction: 2,
    },
    agent: {
      messages: [
        {
          sender: "bot",
          text: "I see you initially mentioned cancelling, but then corrected yourself. Let me focus on your actual request.",
          tone: "thinking",
          timestamp: "0:01",
        },
        {
          sender: "bot",
          text: "Updating shipping address for order #4821 to 742 Evergreen Terrace.",
          tone: "neutral",
          timestamp: "0:02",
        },
        {
          sender: "bot",
          text: "Address updated successfully. Your order will ship to the new address tomorrow.",
          tone: "success",
          timestamp: "0:04",
        },
        {
          sender: "system",
          text: "RESOLVED. Confirmation email sent.",
          tone: "success",
          timestamp: "0:04",
        },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "split-refund",
    name: "Split Refund",
    userMessage:
      "I need a refund for order #7733. I paid $40 with a gift card and $60 with my Visa.",
    workflow: {
      messages: [
        {
          sender: "bot",
          text: "Looking up order #7733 for refund processing.",
          tone: "neutral",
          timestamp: "0:01",
        },
        {
          sender: "bot",
          text: "Order found. Initiating refund to original payment method.",
          tone: "neutral",
          timestamp: "0:03",
        },
        {
          sender: "system",
          text: "ERROR: I found two payment methods but I can't split refunds.",
          tone: "error",
          timestamp: "0:06",
        },
        {
          sender: "bot",
          text: "I can't handle split refunds. Creating a help request for you.",
          tone: "error",
          timestamp: "0:09",
        },
        {
          sender: "system",
          text: "Sent to our finance team. This will take about 3 business days.",
          tone: "error",
          timestamp: "0:12",
        },
      ],
      satisfaction: 2,
    },
    agent: {
      messages: [
        {
          sender: "bot",
          text: "I see this order used two payment methods. Let me calculate the correct split refund.",
          tone: "thinking",
          timestamp: "0:01",
        },
        {
          sender: "bot",
          text: "Refunding $40.00 to your gift card balance...",
          tone: "neutral",
          timestamp: "0:03",
        },
        {
          sender: "bot",
          text: "Refunding $60.00 to your Visa ending in 4242...",
          tone: "neutral",
          timestamp: "0:04",
        },
        {
          sender: "bot",
          text: "Both refunds processed! Gift card balance available now, Visa refund in 2-3 days.",
          tone: "success",
          timestamp: "0:06",
        },
        {
          sender: "system",
          text: "RESOLVED. Refund confirmation sent to email.",
          tone: "success",
          timestamp: "0:06",
        },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "staging-env",
    name: "Staging Setup",
    userMessage:
      "Set up a staging environment identical to production but with debug logging enabled for all 12 services.",
    workflow: {
      messages: [
        {
          sender: "bot",
          text: "Found the 'create environment' template. Copying production setup.",
          tone: "neutral",
          timestamp: "0:02",
        },
        {
          sender: "bot",
          text: "Production config cloned. Applying debug logging flag.",
          tone: "neutral",
          timestamp: "0:05",
        },
        {
          sender: "system",
          text: "WARNING: 12 connected services each need separate changes.",
          tone: "warning",
          timestamp: "0:08",
        },
        {
          sender: "system",
          text: "ERROR: Too many possible combinations (47 paths). I can't figure this out.",
          tone: "error",
          timestamp: "0:14",
        },
        {
          sender: "bot",
          text: "Only partially done. 6 of 12 services are broken. Someone needs to fix them manually.",
          tone: "error",
          timestamp: "0:18",
        },
      ],
      satisfaction: 1,
    },
    agent: {
      messages: [
        {
          sender: "bot",
          text: "I'll enumerate all 12 production services first, then modify each config systematically.",
          tone: "thinking",
          timestamp: "0:02",
        },
        {
          sender: "bot",
          text: "Cloning configs for all 12 services with debug logging overrides applied.",
          tone: "neutral",
          timestamp: "0:05",
        },
        {
          sender: "bot",
          text: "Deploying services sequentially with health checks after each...",
          tone: "neutral",
          timestamp: "0:08",
        },
        {
          sender: "bot",
          text: "All 12 services deployed and verified healthy. Debug logging active across the board.",
          tone: "success",
          timestamp: "0:12",
        },
        {
          sender: "system",
          text: "RESOLVED. Full staging environment ready in 90 seconds.",
          tone: "success",
          timestamp: "0:12",
        },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "batch-error",
    name: "Batch Recovery",
    userMessage:
      "The payment API just returned a 503 error in the middle of processing 200 transactions. Fix this.",
    workflow: {
      messages: [
        {
          sender: "bot",
          text: "Checking batch status. 147 of 200 transactions processed successfully.",
          tone: "neutral",
          timestamp: "0:02",
        },
        {
          sender: "system",
          text: "ERROR: Transaction #148 failed — the server is down. Trying again (attempt 1 of 3)...",
          tone: "error",
          timestamp: "0:05",
        },
        {
          sender: "system",
          text: "ERROR: All 3 retries failed. The server is still down.",
          tone: "error",
          timestamp: "0:12",
        },
        {
          sender: "bot",
          text: "All retries failed. Undoing everything — even the 147 transactions that worked.",
          tone: "error",
          timestamp: "0:15",
        },
        {
          sender: "system",
          text: "FAILED. All 200 transactions undone. Someone needs to redo everything manually.",
          tone: "error",
          timestamp: "0:18",
        },
      ],
      satisfaction: 1,
    },
    agent: {
      messages: [
        {
          sender: "bot",
          text: "The server is temporarily down. I'll save my progress at transaction #147 — no need to redo those.",
          tone: "thinking",
          timestamp: "0:02",
        },
        {
          sender: "bot",
          text: "Waiting a few seconds before trying #148 again...",
          tone: "neutral",
          timestamp: "0:05",
        },
        {
          sender: "bot",
          text: "Provider is back online. Resuming batch from transaction #148.",
          tone: "neutral",
          timestamp: "0:11",
        },
        {
          sender: "bot",
          text: "All 200 transactions processed successfully. Zero data loss.",
          tone: "success",
          timestamp: "0:16",
        },
        {
          sender: "system",
          text: "RESOLVED. All 200 transactions done. Progress was saved so nothing was wasted.",
          tone: "success",
          timestamp: "0:16",
        },
      ],
      satisfaction: 5,
    },
  },
];

const CYCLE_MS = 6000;
const MSG_INTERVAL_MS = 800;

/* ── Typing Indicator ── */

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${color}`}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Star Rating ── */

function StarRating({
  score,
  maxScore = 5,
  color,
}: {
  score: number;
  maxScore?: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxScore }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
        >
          <Star
            className={`h-3.5 w-3.5 ${
              i < score ? color : "text-muted-dark"
            }`}
            fill={i < score ? "currentColor" : "none"}
          />
        </motion.div>
      ))}
      <span className={`ml-1.5 text-sm font-mono ${color}`}>
        {score}/{maxScore}
      </span>
    </div>
  );
}

/* ── Chat Bubble ── */

function ChatBubble({
  message,
  isWorkflow,
  index,
  isVisible,
}: {
  message: ChatMessage;
  isWorkflow: boolean;
  index: number;
  isVisible: boolean;
}) {
  const prefersReduced = useReducedMotion();

  const toneStyles = {
    neutral: "border-white/[0.06] bg-white/[0.03] text-muted",
    thinking:
      "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/80 italic",
    warning: "border-yellow-400/20 bg-yellow-400/5 text-yellow-400/80",
    error: "border-brand-rose/20 bg-brand-rose/5 text-brand-rose/80",
    success:
      "border-brand-emerald/20 bg-brand-emerald/5 text-brand-emerald/80",
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
      ? "text-brand-rose/60"
      : message.tone === "warning"
        ? "text-yellow-400/60"
        : message.tone === "success"
          ? "text-brand-emerald/60"
          : message.tone === "thinking"
            ? "text-brand-purple/60"
            : "text-muted-dark";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, y: 10, scale: 0.95 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`rounded-lg border px-3 py-2 ${toneStyles[message.tone]} ${
            message.sender === "system"
              ? "mx-2 text-center text-sm font-mono uppercase tracking-wider"
              : "text-sm leading-relaxed"
          }`}
        >
          <div className="flex items-start gap-2">
            {message.sender !== "system" && (
              <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${iconColor}`} />
            )}
            <div className="flex-1 min-w-0">
              <span>{message.text}</span>
            </div>
            <span className="shrink-0 text-sm font-mono text-muted-dark mt-0.5">
              {message.timestamp}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Chat Channel ── */

function ChatChannel({
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
  icon: React.ElementType;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, isTyping]);

  const channelColor = isWorkflow
    ? "border-brand-rose/10"
    : "border-brand-emerald/10";

  const headerBg = isWorkflow
    ? "bg-brand-rose/[0.03]"
    : "bg-brand-emerald/[0.03]";

  const headerColor = isWorkflow
    ? "text-brand-rose/60"
    : "text-brand-emerald/60";

  return (
    <div
      className={`rounded-xl border ${channelColor} overflow-hidden flex flex-col bg-white/[0.01]`}
    >
      {/* Channel header */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 border-b ${channelColor} ${headerBg}`}
      >
        <Hash className={`h-3.5 w-3.5 ${headerColor}`} />
        <span className={`text-sm font-mono tracking-wider ${headerColor}`}>
          {channelName}
        </span>
        <div className="ml-auto">
          <Icon className={`h-3.5 w-3.5 ${headerColor}`} />
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px] max-h-[320px] scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <ChatBubble
            key={`${msg.timestamp}-${i}`}
            message={msg}
            isWorkflow={isWorkflow}
            index={i}
            isVisible={i < visibleCount}
          />
        ))}

        {/* Typing indicator */}
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

      {/* Satisfaction footer */}
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
              <span className="text-sm font-mono uppercase tracking-wider text-muted-dark">
                Satisfaction
              </span>
              <StarRating
                score={satisfaction}
                color={
                  isWorkflow ? "text-brand-rose/70" : "text-brand-emerald/70"
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */

export default function AgentsChat() {
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [wfVisibleCount, setWfVisibleCount] = useState(0);
  const [agVisibleCount, setAgVisibleCount] = useState(0);
  const [wfTyping, setWfTyping] = useState(false);
  const [agTyping, setAgTyping] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios[activeIndex];

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const playScenario = useCallback(() => {
    clearAllTimers();
    setWfVisibleCount(0);
    setAgVisibleCount(0);
    setWfTyping(false);
    setAgTyping(false);
    setShowSatisfaction(false);

    const currentScenario = scenarios[activeIndex];
    const wfMsgs = currentScenario.workflow.messages;
    const agMsgs = currentScenario.agent.messages;
    const interval = prefersReduced ? 200 : MSG_INTERVAL_MS;

    // Animate workflow messages
    wfMsgs.forEach((_, i) => {
      // Show typing before each message
      const typingTimer = setTimeout(() => {
        setWfTyping(true);
      }, i * interval);
      timerRefs.current.push(typingTimer);

      const msgTimer = setTimeout(() => {
        setWfTyping(false);
        setWfVisibleCount(i + 1);
      }, i * interval + interval * 0.6);
      timerRefs.current.push(msgTimer);
    });

    // Animate agent messages (same timing)
    agMsgs.forEach((_, i) => {
      const typingTimer = setTimeout(() => {
        setAgTyping(true);
      }, i * interval);
      timerRefs.current.push(typingTimer);

      const msgTimer = setTimeout(() => {
        setAgTyping(false);
        setAgVisibleCount(i + 1);
      }, i * interval + interval * 0.6);
      timerRefs.current.push(msgTimer);
    });

    // Show satisfaction after all messages
    const maxMsgs = Math.max(wfMsgs.length, agMsgs.length);
    const satTimer = setTimeout(() => {
      setShowSatisfaction(true);
    }, maxMsgs * interval + 400);
    timerRefs.current.push(satTimer);
  }, [activeIndex, prefersReduced, clearAllTimers]);

  // Play scenario when activeIndex changes
  useEffect(() => {
    playScenario();
  }, [activeIndex, playScenario]);

  // Auto-cycle
  useEffect(() => {
    if (paused || hovered) return;
    cycleTimerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % scenarios.length);
    }, CYCLE_MS);
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [activeIndex, paused, hovered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return (
    <SectionWrapper
      id="agents-chat"
      aria-label="Agents vs Workflows chat comparison"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center mb-14">
        <SectionHeading>
          Same Message, <GradientText>Different Intelligence</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Same customer message, two very different experiences. See why
          intelligence matters more than rules.
        </p>
      </motion.div>

      {/* Scenario tabs */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-mono tracking-wider transition-all duration-300 ${
              i === activeIndex
                ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "border-white/[0.06] bg-white/[0.02] text-muted-dark hover:border-white/[0.12] hover:text-muted"
            }`}
          >
            {s.name}
          </button>
        ))}
      </motion.div>

      {/* User message trigger */}
      <motion.div variants={fadeUp} className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-xl border border-brand-cyan/15 bg-brand-cyan/[0.03] px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan/15 ring-1 ring-brand-cyan/20">
                  <User className="h-3 w-3 text-brand-cyan/70" />
                </div>
                <span className="text-sm font-mono uppercase tracking-wider text-brand-cyan/50">
                  Customer message
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed pl-7">
                {scenario.userMessage}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Dual chat channels */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-lg overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TerminalChrome
          title="support-channels.compare"
          status={showSatisfaction ? "complete" : "live"}
          info={
            <span className="text-sm font-mono text-muted-dark">
              {scenario.name}
            </span>
          }
          className="px-4 py-2.5"
        />

        <div className="p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {/* Workflow channel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`wf-${scenario.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatChannel
                  channelName="workflow-bot"
                  messages={scenario.workflow.messages}
                  visibleCount={wfVisibleCount}
                  isTyping={wfTyping}
                  isWorkflow={true}
                  satisfaction={scenario.workflow.satisfaction}
                  showSatisfaction={showSatisfaction}
                  icon={MessageSquare}
                />
              </motion.div>
            </AnimatePresence>

            {/* Agent channel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`ag-${scenario.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatChannel
                  channelName="agent-bot"
                  messages={scenario.agent.messages}
                  visibleCount={agVisibleCount}
                  isTyping={agTyping}
                  isWorkflow={false}
                  satisfaction={scenario.agent.satisfaction}
                  showSatisfaction={showSatisfaction}
                  icon={Sparkles}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Comparison summary */}
          <AnimatePresence>
            {showSatisfaction && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Workflow summary */}
                  <div className="text-center">
                    <div className="text-sm font-mono uppercase tracking-wider text-brand-rose/50 mb-1">
                      Workflow
                    </div>
                    <div className="text-lg font-bold text-brand-rose/70">
                      {scenario.workflow.messages.length} msgs
                    </div>
                    <div className="text-sm text-brand-rose/40 font-mono">
                      {
                        scenario.workflow.messages[
                          scenario.workflow.messages.length - 1
                        ].timestamp
                      }{" "}
                      elapsed
                    </div>
                  </div>

                  {/* Center comparison */}
                  <div className="text-center">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mx-auto h-8 w-8 rounded-full border border-brand-cyan/20 flex items-center justify-center mb-1"
                    >
                      <Zap className="h-4 w-4 text-brand-cyan" />
                    </motion.div>
                    <span className="text-sm font-mono text-brand-cyan/60">
                      vs
                    </span>
                  </div>

                  {/* Agent summary */}
                  <div className="text-center">
                    <div className="text-sm font-mono uppercase tracking-wider text-brand-emerald/50 mb-1">
                      Agent
                    </div>
                    <div className="text-lg font-bold text-brand-emerald/70">
                      {scenario.agent.messages.length} msgs
                    </div>
                    <div className="text-sm text-brand-emerald/40 font-mono">
                      {
                        scenario.agent.messages[
                          scenario.agent.messages.length - 1
                        ].timestamp
                      }{" "}
                      elapsed
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress bar & controls */}
      <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
        <div className="flex gap-1.5">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveIndex(i);
                setPaused(true);
              }}
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.06] overflow-hidden"
            >
              {i === activeIndex && !paused && !hovered && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  key={`progress-${s.id}`}
                />
              )}
              {i === activeIndex && (paused || hovered) && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
              )}
              {i < activeIndex && (
                <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-mono text-muted-dark/50">
          <span>
            Chat {activeIndex + 1} of {scenarios.length}
          </span>
          <button
            onClick={() => setPaused((v) => !v)}
            className="cursor-pointer flex items-center gap-1.5 transition-colors hover:text-muted-dark"
          >
            {paused ? (
              <>
                <Play className="h-3 w-3" />
                Resume auto-play
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                Auto-cycling
              </>
            )}
          </button>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
