"use client";

import { useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { useBeat } from "../shared/useBeat";
import ToolLogo from "../shared/ToolLogo";
import { TOOLS, TWIN_MORE_CHANNELS } from "../shared/catalog";
import ChannelCard from "./ChannelCard";
import TwinSource from "./TwinSource";
import TwinWires from "./TwinWires";
import { CHANNELS, TWIN_STILL, twinAt } from "./twinData";

const A = "var(--brand-amber)";
const BEAT_MS = 1100;
const MORE = TWIN_MORE_CHANNELS.map((key) => TOOLS[key]);

/**
 * Twin at work, true to its catalog row: it speaks as you, with your
 * identity, a tone per channel and memory recall, and tracks the replies.
 * The motion story is the mirror: one intent from you becomes a Slack line,
 * an email and a LinkedIn message at once, each in its channel's tone, and
 * the answers come home to the twin. Stylised (the window says so).
 */
export default function TwinScene() {
  const { t, language } = useTranslation();
  const copy = t.featuresSections.plugins.twin;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { step, run } = useBeat(rootRef, BEAT_MS, TWIN_STILL);
  const frame = twinAt(step);
  const n = (v: number) => v.toLocaleString(language);

  const status = !frame.intent
    ? copy.statusListening
    : !frame.toned
      ? copy.statusRecalling
      : frame.replies === 0
        ? fillTemplate(copy.statusMirroring, { count: n(CHANNELS.length) })
        : fillTemplate(copy.statusReplies, { count: n(frame.replies), total: n(CHANNELS.length) });

  return (
    <div ref={rootRef} className="flex h-full flex-col px-5 pb-4 pt-4">
      <div className="grid min-h-0 flex-1 grid-cols-[236px_56px_1fr]">
        <TwinSource frame={frame} run={run} />
        <div className="relative">
          <TwinWires frame={frame} run={run} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-2.5">
          {CHANNELS.map((c) => (
            <ChannelCard
              key={c.key}
              channel={c.key}
              tool={c.tool}
              index={c.index}
              typing={frame.typing}
              sent={frame.sent}
              replied={c.index < frame.replies}
              run={run}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[13px] uppercase tracking-[0.16em] text-foreground/65">
        <span aria-live="off">{status}</span>
        <span className="flex items-center gap-2.5">
          <span style={{ color: A }}>{copy.alsoReaches}</span>
          {MORE.map((tool) => (
            <span key={tool.id} title={tool.label} className="text-foreground/75">
              <ToolLogo icon={tool.icon} className="h-4 w-4" />
              <span className="sr-only">{tool.label}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
