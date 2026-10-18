"use client";

import { useEffect, useRef, useState } from "react";
import { Rocket, RotateCcw } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { CHAT_SCRIPT } from "../../../data";
import { REFINED_VERSION } from "../../../ledger";
import type { LabVariantProps } from "../../types";
import { BroadcastFrame, CAPS, OnAirButton, Ticker } from "../Frame";
import { useOnAir } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { SEGMENTS, chatMs, segmentOf } from "./plays";
import { SpokenLine, StatOverlay } from "./Lines";
import Telestrator from "./Telestrator";

/**
 * Chat as a coach's huddle: each request is a called play, the analyst reads
 * the tape, and the applied diff goes up on the telestrator. The run sheet
 * plays once; afterwards the play list re-cues any play, and the final
 * whistle answers "promote this?" through the ledger.
 */
export default function ChatHuddle({ ledger, dispatch }: Omit<LabVariantProps, "active">) {
  const { t } = useTranslation();
  const c = broadcastCopy.chat;
  const ref = useRef<HTMLDivElement>(null);
  const air = useOnAir(ref, CHAT_SCRIPT.length, chatMs);
  const [pick, setPick] = useState<{ seg: number; run: number } | null>(null);

  const latest = Math.max(0, air.at - 1);
  const followed = segmentOf(latest);
  const viewed = air.done && pick && pick.run === air.run ? pick.seg : followed;
  const seg = SEGMENTS[viewed];
  const isLive = ledger.liveId === REFINED_VERSION;

  // Follow the newest line inside the on-air panel while the run sheet plays
  // (a DOM scroll of the panel only - never the page).
  const airRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = airRef.current;
    if (!box || !air.ticking) return;
    const item = air.at - 1;
    const last = box.querySelector<HTMLElement>(`[data-item="${item}"]`);
    if (!last) return;
    // A new play starts at the top of the panel; inside a play, keep the newest line in view.
    const opens = SEGMENTS.some((s) => s.items[0] === item);
    const top = opens ? 0 : Math.max(0, last.offsetTop - box.clientHeight + last.offsetHeight + 16);
    box.scrollTo({ top, behavior: "smooth" });
  }, [air.at, air.ticking]);

  const msg = CHAT_SCRIPT[latest];
  const ticker =
    air.at === 0
      ? c.warmup
      : air.done
        ? isLive
          ? fillTemplate(t.labVersions.nowLive, { version: REFINED_VERSION })
          : fillTemplate(c.tickerWrap, { version: REFINED_VERSION })
        : msg.role === "user"
          ? fillTemplate(c.tickerCall, { n: SEGMENTS[followed].n })
          : msg.role === "diff"
            ? fillTemplate(c.tickerApplied, { n: SEGMENTS[followed].n, lines: msg.content.split("\n").length })
            : c.tickerRead;

  const segName = (s: (typeof SEGMENTS)[number]) =>
    s.kind === "wrap" ? c.wrapName : s.call && s.call in c.playNames ? c.playNames[s.call as keyof typeof c.playNames] : fillTemplate(c.play, { n: s.n });

  return (
    <BroadcastFrame
      rootRef={ref}
      tone="cyan"
      segment={broadcastCopy.segments.chat}
      live={air.live}
      moving={air.moving}
      meta={
        <span className="flex items-center gap-2 text-foreground/70">
          <span className="h-2 w-2 rounded-full" style={{ background: air.done ? BRAND_VAR.emerald : BRAND_VAR.amber }} />
          {air.done ? labSectionCopy.chat.synced : labSectionCopy.chat.applying}
        </span>
      }
      footer={
        <Ticker label={c.ticker} tone="cyan" text={ticker} moving={air.moving}>
          <OnAirButton tone="cyan" onClick={air.replay} disabled={air.ticking}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {c.replay}
          </OnAirButton>
          {air.done &&
            (isLive ? (
              <span className={`${CAPS} px-1 text-sm`} style={{ color: BRAND_VAR.emerald }}>
                {fillTemplate(t.labVersions.nowLive, { version: REFINED_VERSION })}
              </span>
            ) : (
              <OnAirButton tone="emerald" onClick={() => dispatch({ type: "activate", id: REFINED_VERSION })}>
                <Rocket className="h-3.5 w-3.5" aria-hidden />
                {fillTemplate(t.labVersions.activateVersion, { version: REFINED_VERSION })}
              </OnAirButton>
            ))}
        </Ticker>
      }
    >
      <div className="flex h-full flex-col md:grid md:grid-cols-[12rem_minmax(0,1fr)]">
        {/* the play list: called plays light up as the huddle reaches them */}
        <ol aria-label={c.plays} className="flex gap-2 overflow-x-auto border-b border-glass p-3 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
          <li className={`${CAPS} hidden text-sm text-foreground/70 md:block`}>{c.plays}</li>
          {SEGMENTS.map((s, i) => {
            const reached = s.items[0] < air.at;
            const on = i === viewed;
            const tone = s.kind === "wrap" ? "emerald" : "cyan";
            return (
              <li key={i} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!air.done}
                  onClick={() => setPick({ seg: i, run: air.run })}
                  className="flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 enabled:hover:border-glass-hover"
                  style={{
                    borderColor: on ? tint(tone, 60) : "var(--border-glass)",
                    background: on ? tint(tone, 12) : "transparent",
                    opacity: reached ? 1 : 0.6,
                  }}
                >
                  <span className="font-mono text-base font-black italic tabular-nums" style={{ color: BRAND_VAR[tone] }}>
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold leading-tight text-foreground">{segName(s)}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* on air: the viewed play, every line laid out so the height holds */}
        <div ref={airRef} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide stage:py-3">
          <div className="sticky -top-4 z-10 -mx-4 -mt-4 flex items-center gap-2 bg-background/95 px-4 pb-1 pt-4 stage:-top-3 stage:-mt-3 stage:pt-3">
            <span className={`${CAPS} text-2xl`} style={{ color: BRAND_VAR[seg.kind === "wrap" ? "emerald" : "cyan"] }}>
              {seg.kind === "wrap" ? c.wrap : fillTemplate(c.play, { n: seg.n })}
            </span>
            <span className="h-px flex-1 bg-foreground/15" />
          </div>
          {seg.items.map((idx) => {
            const m = CHAT_SCRIPT[idx];
            const shown = idx < air.at;
            if (m.role === "diff")
              return (
                <div key={idx} data-item={idx}>
                  <Telestrator content={m.content} shown={shown} moving={air.moving} />
                </div>
              );
            const coach = m.role === "user";
            return (
              <div key={idx} data-item={idx}>
                <SpokenLine
                  who={coach ? c.coach : c.analyst}
                  tone={coach ? "cyan" : "purple"}
                  tag={coach ? segName(seg) : undefined}
                  text={labSectionCopy.chat.messages[m.message]}
                  shown={shown}
                  moving={air.moving}
                />
              </div>
            );
          })}
          {seg.kind === "wrap" && <StatOverlay shown={air.done} moving={air.moving} />}
        </div>
      </div>
    </BroadcastFrame>
  );
}
