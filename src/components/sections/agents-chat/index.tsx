"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Sparkles, User } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { scenarios } from "./data";
import { useChatSequence } from "./use-chat-sequence";
import ChatChannel from "./components/ChatChannel";
import ChatComparisonSummary from "./components/ChatComparisonSummary";
import ChatProgressBar from "./components/ChatProgressBar";

export default function AgentsChat() {
  const {
    activeIndex,
    setActiveIndex,
    wfVisibleCount,
    agVisibleCount,
    wfTyping,
    agTyping,
    showSatisfaction,
    paused,
    setPaused,
    hovered,
    setHovered,
  } = useChatSequence();

  const scenario = scenarios[activeIndex];

  return (
    <SectionWrapper
      id="agents-chat"
      aria-label="Agents vs Workflows chat comparison"
    >
      <SectionIntro
        heading="Same Message,"
        gradient="Different Intelligence"
        description="Same customer message, two very different experiences. See why intelligence matters more than rules."
        className="mb-14"
      />

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {scenarios.map((s, i) => (
          <ThemedChip
            key={s.id}
            active={i === activeIndex}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            size="sm"
            mono
          >
            {s.name}
          </ThemedChip>
        ))}
      </motion.div>

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
                <span className="text-base font-mono uppercase tracking-wider text-brand-cyan/60">
                  Customer message
                </span>
              </div>
              <p className="text-base text-muted leading-relaxed pl-7">
                {scenario.userMessage}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-glass bg-white/[0.02] backdrop-blur-lg overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TerminalChrome
          title="support-channels.compare"
          status={showSatisfaction ? "complete" : "live"}
          info={
            <span className="text-base font-mono text-muted-dark">{scenario.name}</span>
          }
          className="px-4 py-2.5"
        />

        <div className="p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
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

          <ChatComparisonSummary
            scenario={scenario}
            showSatisfaction={showSatisfaction}
          />
        </div>
      </motion.div>

      <ChatProgressBar
        activeIndex={activeIndex}
        paused={paused}
        hovered={hovered}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
        onTogglePause={() => setPaused((v) => !v)}
      />
    </SectionWrapper>
  );
}
