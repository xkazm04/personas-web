"use client";

import { motion } from "framer-motion";
import { CornerDownLeft } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import ToolLogo from "../shared/ToolLogo";
import { brandInk, type LogoTool } from "../shared/catalog";
import type { ChannelKey } from "./twinData";

const A = "var(--brand-amber)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** Each channel's own shape, so the same message visibly lands in three different places. */
const SHAPE: Record<ChannelKey, string> = {
  slack: "rounded-lg",
  gmail: "rounded-md",
  linkedin: "rounded-[20px]",
};

/** Where each channel's tone sits between casual (0) and formal (1), drawn as a small gauge. */
const FORMALITY: Record<ChannelKey, number> = { slack: 0.1, linkedin: 0.5, gmail: 0.9 };

/**
 * One channel the twin writes into, shaped like that channel: a Slack line
 * under your avatar, a Gmail reply with its subject and sign-off, a LinkedIn
 * message bubble. Before the message lands the card shows the twin writing;
 * the reply row fills when the contact answers. Markup never changes - only
 * opacity does - so a still frame is the same tree as a moving one.
 */
export default function ChannelCard({
  channel,
  tool,
  typing,
  sent,
  replied,
  index,
  run,
}: {
  channel: ChannelKey;
  tool: LogoTool;
  typing: boolean;
  sent: boolean;
  replied: boolean;
  index: number;
  run: boolean;
}) {
  const copy = useTranslation().t.featuresSections.plugins.twin;
  const words = copy.channels[channel];
  const ink = brandInk(tool);
  // Fades in over 0.4s after `delay`, and out in 0.2s with no delay, so the
  // "writing" line has left before the message arrives in its place.
  const fade = (on: boolean, delay = 0) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 4 },
    transition: { duration: run ? (on ? 0.4 : 0.2) : 0, delay: run && on ? delay : 0 },
  });

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col justify-center gap-1.5 overflow-hidden border px-4 py-2.5 transition-[border-color,box-shadow,background] duration-500 ${SHAPE[channel]}`}
      style={{
        borderColor: sent ? mix(A, 45) : mix("var(--foreground)", 12),
        background: sent ? `linear-gradient(120deg, ${mix(A, 9)}, ${mix("var(--foreground)", 2)} 70%)` : mix("var(--foreground)", 3),
        boxShadow: sent ? `0 10px 30px -18px ${mix(A, 60)}` : undefined,
      }}
    >
      {channel === "slack" && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full" style={{ background: ink }} />}
      <div className="flex items-center gap-2">
        <span style={{ color: ink }}>
          <ToolLogo icon={tool.icon} className="h-[18px] w-[18px]" />
        </span>
        <span className="text-[15px] font-semibold text-foreground">{tool.label}</span>
        <span className="font-mono text-[13px] text-foreground/65">
          {channel === "gmail" ? copy.channels.gmail.subject : `@${copy.contact}`}
        </span>
        <span aria-hidden="true" className="relative ml-auto h-[3px] w-12 rounded-full" style={{ background: mix("var(--foreground)", 14) }}>
          <span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background,box-shadow] duration-500"
            style={{ left: `${FORMALITY[channel] * 100}%`, background: sent || typing ? A : mix(A, 40), boxShadow: sent || typing ? `0 0 8px ${A}` : undefined }}
          />
        </span>
        <span
          className="rounded-full border px-2.5 py-0.5 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-500"
          style={{ borderColor: mix(A, sent || typing ? 55 : 25), color: sent || typing ? A : "color-mix(in srgb, var(--foreground) 65%, transparent)" }}
        >
          {words.tone}
        </span>
      </div>

      <div className="relative">
        <motion.p
          {...fade(sent, 0.2 + index * 0.18)}
          className={`text-[15px] leading-snug text-foreground/90 ${channel === "linkedin" ? "rounded-2xl rounded-bl-md px-3 py-1.5" : ""}`}
          style={channel === "linkedin" ? { background: mix(A, 12) } : undefined}
        >
          {channel === "slack" && <span className="mr-1.5 font-semibold text-foreground">{copy.sender}</span>}
          {words.message}
          {channel === "gmail" && <span className="block text-[14px] italic text-foreground/65">{copy.channels.gmail.signoff}</span>}
        </motion.p>
        <motion.span
          {...fade(typing)}
          className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-2 font-mono text-[13px] text-foreground/65"
        >
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: A }}
                animate={typing && run ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.6 }}
                transition={typing && run ? { duration: 0.9, repeat: Infinity, delay: d * 0.15 } : { duration: 0 }}
              />
            ))}
          </span>
          {copy.typing}
        </motion.span>
      </div>

      <motion.div {...fade(replied)} className="flex items-center gap-1.5 text-[14px] text-foreground/75">
        <CornerDownLeft className="h-3.5 w-3.5 shrink-0" style={{ color: A }} aria-hidden="true" />
        <span className="font-semibold text-foreground/85">{copy.contact}</span>
        {words.reply}
      </motion.div>
    </div>
  );
}
