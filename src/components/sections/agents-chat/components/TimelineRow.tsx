"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Bot, Brain, Check, X, Zap } from "lucide-react";
import type { ChatMessage } from "../types";
import type { LaneState, RaceChannel, RaceRow } from "../timeline-utils";
import StarRating from "./StarRating";

const TONE_TEXT: Record<ChatMessage["tone"], string> = {
  neutral: "text-muted",
  thinking: "text-brand-purple/80 italic",
  warning: "text-brand-amber/80",
  error: "text-brand-rose/80",
  success: "text-brand-emerald/80",
};

const TONE_ICON: Record<ChatMessage["tone"], typeof Bot> = {
  neutral: Bot,
  thinking: Brain,
  warning: AlertTriangle,
  error: X,
  success: Check,
};

const LANE_LINE: Record<RaceChannel, string> = {
  workflow: "bg-brand-rose/25",
  agent: "bg-brand-emerald/25",
};

const LANE_DOT: Record<RaceChannel, string> = {
  workflow: "bg-brand-rose/70",
  agent: "bg-brand-emerald/70",
};

const CHANNEL_LABEL: Record<RaceChannel, string> = {
  workflow: "text-brand-rose/70",
  agent: "text-brand-emerald/70",
};

function LaneCell({
  channel,
  state,
  own,
  resolved,
}: {
  channel: RaceChannel;
  state: LaneState;
  own: boolean;
  resolved: boolean;
}) {
  const terminal = own && state === "end";
  const TerminalIcon = resolved ? Check : X;
  return (
    <div className="relative w-5 self-stretch">
      {state !== "none" && (
        <div
          className={`absolute left-1/2 w-px -translate-x-1/2 ${LANE_LINE[channel]} ${
            state === "end" ? "top-0 h-[10px]" : "inset-y-0"
          }`}
        />
      )}
      {own && !terminal && (
        <div
          className={`absolute left-1/2 top-[14px] h-2 w-2 -translate-x-1/2 rounded-full ${LANE_DOT[channel]}`}
        />
      )}
      {terminal && (
        <div
          className={`absolute left-1/2 top-[10px] flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border ${
            resolved
              ? "border-brand-emerald/40 bg-brand-emerald/15 text-brand-emerald/90"
              : "border-brand-rose/40 bg-brand-rose/15 text-brand-rose/90"
          }`}
        >
          <TerminalIcon className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  );
}

export default function TimelineRow({
  row,
  visible,
  laneWorkflow,
  laneAgent,
  satisfaction,
  showSatisfaction,
}: {
  row: RaceRow;
  visible: boolean;
  laneWorkflow: LaneState;
  laneAgent: LaneState;
  satisfaction: number;
  showSatisfaction: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const { msg, channel } = row;
  const resolved = msg.tone === "success";
  const Icon = msg.sender === "system" ? Zap : TONE_ICON[msg.tone];

  return (
    <motion.div
      initial={false}
      animate={
        visible ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
      }
      transition={
        prefersReduced
          ? { duration: 0 }
          : // Linear height growth — constant-velocity expansion reads as one
            // continuous motion instead of per-row ease-out lurches.
            {
              height: { duration: 0.45, ease: "linear" },
              opacity: { duration: 0.3, ease: "easeOut", delay: 0.1 },
            }
      }
      className="overflow-hidden"
    >
      <div className="flex items-stretch gap-2 sm:gap-3">
        <div className="flex shrink-0">
          <LaneCell
            channel="workflow"
            state={laneWorkflow}
            own={channel === "workflow"}
            resolved={resolved}
          />
          <LaneCell
            channel="agent"
            state={laneAgent}
            own={channel === "agent"}
            resolved={resolved}
          />
        </div>

        <div className="flex flex-1 min-w-0 items-start gap-2 py-1.5 sm:gap-3">
          <span className="w-14 shrink-0 pt-0.5 font-mono text-base text-muted-dark">
            T+{msg.timestamp}
          </span>
          <span
            className={`hidden w-24 shrink-0 pt-0.5 font-mono text-base uppercase tracking-wider md:block ${CHANNEL_LABEL[channel]}`}
          >
            {channel === "workflow" ? "workflow-bot" : "agent-bot"}
          </span>
          <Icon
            className={`mt-1 h-3.5 w-3.5 shrink-0 ${TONE_TEXT[msg.tone]}`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-base leading-relaxed ${TONE_TEXT[msg.tone]} ${
                msg.sender === "system"
                  ? "font-mono uppercase tracking-wider"
                  : ""
              }`}
            >
              {msg.text}
            </p>
            {row.isLastOfChannel && showSatisfaction && (
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-1.5 mb-1 flex flex-wrap items-center gap-2.5"
              >
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-base uppercase tracking-wider ${
                    resolved
                      ? "border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald/90"
                      : "border-brand-rose/30 bg-brand-rose/10 text-brand-rose/90"
                  }`}
                >
                  {resolved ? "resolved" : "handed to humans"}
                </span>
                <StarRating
                  score={satisfaction}
                  color={
                    resolved ? "text-brand-emerald/70" : "text-brand-rose/70"
                  }
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
