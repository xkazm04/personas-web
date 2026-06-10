"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import TerminalChrome from "@/components/TerminalChrome";
import type { ChatSequenceView } from "../types";
import { buildRaceRows, lastRowIndexOf, laneStateAt } from "../timeline-utils";
import TimelineRow from "./TimelineRow";
import TimelineRaceSummary from "./TimelineRaceSummary";
import TypingIndicator from "./TypingIndicator";

/**
 * Variant "Race Log" — both systems merged into ONE chronological transcript
 * on a shared clock. The customer message forks into two commit-graph-style
 * lanes (rose = workflow-bot, emerald = agent-bot); the agent lane terminates
 * early with a resolved node while workflow errors keep stacking below it.
 *
 * Mounted on demand by the variant switcher, so entrance animation is driven
 * by the host in index.tsx — no inherited SectionWrapper variants here.
 */
function OriginRow({ userMessage }: { userMessage: string }) {
  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      <div className="relative w-10 shrink-0">
        <div className="absolute bottom-0 left-[10px] top-[30px] w-px -translate-x-1/2 bg-brand-rose/25" />
        <div className="absolute bottom-0 left-[30px] top-[30px] w-px -translate-x-1/2 bg-brand-emerald/25" />
        <div className="absolute left-[20px] top-[8px] flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-brand-cyan/15 ring-1 ring-brand-cyan/30">
          <User className="h-3 w-3 text-brand-cyan/80" />
        </div>
      </div>
      <div className="flex flex-1 min-w-0 items-start gap-2 py-1.5 sm:gap-3">
        <span className="w-14 shrink-0 pt-0.5 font-mono text-base text-muted-dark">
          T+0:00
        </span>
        <span className="hidden w-24 shrink-0 pt-0.5 font-mono text-base uppercase tracking-wider text-brand-cyan/70 md:block">
          customer
        </span>
        <p className="flex-1 min-w-0 text-base leading-relaxed text-muted">
          &ldquo;{userMessage}&rdquo;
        </p>
      </div>
    </div>
  );
}

export default function ChatTimelineVariant({
  scenario,
  wfVisibleCount,
  agVisibleCount,
  wfTyping,
  agTyping,
  showSatisfaction,
}: ChatSequenceView) {
  const rows = useMemo(() => buildRaceRows(scenario), [scenario]);
  const lastIdx = useMemo(
    () => ({
      workflow: lastRowIndexOf(rows, "workflow"),
      agent: lastRowIndexOf(rows, "agent"),
    }),
    [rows],
  );

  const wfDone = wfVisibleCount >= scenario.workflow.messages.length;
  const agDone = agVisibleCount >= scenario.agent.messages.length;

  return (
    <div className="rounded-2xl border border-glass bg-white/[0.02] backdrop-blur-lg overflow-hidden">
      <TerminalChrome
        title="merged-transcript.log"
        status={showSatisfaction ? "complete" : "live"}
        info={
          <span className="text-base font-mono text-muted-dark">
            {scenario.name}
          </span>
        }
        className="px-4 py-2.5"
      />

      <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-base">
          <span className="flex items-center gap-1.5 text-brand-rose/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-rose/70" />
            workflow-bot
          </span>
          <span className="flex items-center gap-1.5 text-brand-emerald/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald/70" />
            agent-bot
          </span>
          <span className="ml-auto hidden uppercase tracking-widest text-muted-dark sm:block">
            one clock · two systems
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Fixed-height, bottom-anchored log window. flex-col-reverse
                makes the browser pin scroll to the newest line natively, so
                the card NEVER changes height while the conversation grows —
                rows slide upward like a real terminal instead of ratcheting
                the section taller. Older lines fade out under the top mask
                and stay reachable by scroll. DOM order is reversed: first
                child = visual bottom. */}
            <div className="flex h-[320px] flex-col-reverse overflow-y-auto sm:h-[360px] [mask-image:linear-gradient(to_bottom,transparent_0,black_44px)]">
              {/* Reserved-height typing strip — chips toggle without shifting rows */}
              <div className="flex min-h-9 flex-wrap items-center gap-3 pl-12 pt-2 sm:pl-[52px]">
                {!wfDone && wfTyping && (
                  <span className="flex items-center gap-1 rounded-full border border-brand-rose/20 bg-brand-rose/[0.04] pl-2.5 font-mono text-base text-brand-rose/70">
                    workflow-bot
                    <TypingIndicator color="bg-brand-rose/60" />
                  </span>
                )}
                {!agDone && agTyping && (
                  <span className="flex items-center gap-1 rounded-full border border-brand-emerald/20 bg-brand-emerald/[0.04] pl-2.5 font-mono text-base text-brand-emerald/70">
                    agent-bot
                    <TypingIndicator color="bg-brand-emerald/60" />
                  </span>
                )}
              </div>

              {rows
                .map((row, i) => (
                  <TimelineRow
                    key={row.key}
                    row={row}
                    visible={
                      row.channelIndex <
                      (row.channel === "workflow"
                        ? wfVisibleCount
                        : agVisibleCount)
                    }
                    laneWorkflow={laneStateAt(i, lastIdx.workflow)}
                    laneAgent={laneStateAt(i, lastIdx.agent)}
                    satisfaction={
                      row.channel === "workflow"
                        ? scenario.workflow.satisfaction
                        : scenario.agent.satisfaction
                    }
                    showSatisfaction={showSatisfaction}
                  />
                ))
                .reverse()}

              <OriginRow userMessage={scenario.userMessage} />
            </div>

            <TimelineRaceSummary scenario={scenario} show={showSatisfaction} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
