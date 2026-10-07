"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Link2, Search, Sparkles } from "lucide-react";
import { useLoopGate } from "@/hooks/useLoopGate";
import { BACKLINKS, CAPTURES } from "@/components/feature-sections/plugins/second-brain/secondBrainData";
import BrainGraph from "./BrainGraph";
import { pluginsExtraCopy } from "@/i18n/pending/pluginsExtra";

const P = "var(--brand-purple)";
const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const RECALL_MS = 2600;
/** Notes the graph recalls in turn - each one has a backlink row in the panel. */
const RECALLS = BACKLINKS.map((b) => b.noteKey);

/**
 * Obsidian Brain at work: the live showcase's vault graph and side panel,
 * now tied together - each recall lights one note in the graph and its
 * backlink in the panel at the same moment.
 */
export default function BrainScene() {
  const copy = pluginsExtraCopy.brain;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { run } = useLoopGate(rootRef);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setStep((s) => s + 1), RECALL_MS);
    return () => clearInterval(id);
  }, [run]);

  const recalled = RECALLS[step % RECALLS.length];

  return (
    <div ref={rootRef} className="flex h-full flex-col px-5 pb-4 pt-4">
      <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: mix(P, 28), background: mix(P, 6) }}>
        <Search className="h-4 w-4 text-foreground/60" aria-hidden="true" />
        <span className="font-mono text-[15px] text-foreground/65">{copy.recall}</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[13px] font-semibold" style={{ color: P }}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.capture}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-3">
        <BrainGraph recalled={recalled} run={run} />
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: mix(P, 24), background: mix(P, 5) }}>
            <div className="mb-2 flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: P }}>
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.connections}
            </div>
            <ul className="space-y-0.5">
              {BACKLINKS.map((b) => {
                const hot = b.noteKey === recalled;
                return (
                  <li
                    key={b.label}
                    className="flex items-start gap-2 rounded-lg px-2 py-[3px] transition-colors duration-500"
                    style={{ background: hot ? mix(P, 16) : "transparent" }}
                  >
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: P }} aria-hidden="true" />
                    <span className="min-w-0 leading-tight">
                      <span className="block font-mono text-[13px] text-foreground/90">{b.label}</span>
                      <span className="block text-[13px] text-foreground/65">{copy.backlinkNotes[b.noteKey]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="min-h-0 flex-1 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-2.5">
            <div className="mb-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
              {copy.recentThoughts}
            </div>
            <ul className="space-y-1">
              {CAPTURES.map((c) => (
                <li key={c.textKey} className="flex gap-2 text-[13px] leading-snug">
                  <span className="w-7 shrink-0 font-mono tabular-nums text-foreground/60">{c.time}</span>
                  <span className="text-foreground/85">{copy.captures[c.textKey]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[13px] uppercase tracking-[0.16em] text-foreground/65">
        <span>
          {copy.vault} <span className="font-semibold normal-case tracking-normal" style={{ color: P }}>~/obsidian/work</span>
        </span>
        <span className="flex gap-4">
          <span><b className="tabular-nums" style={{ color: P }}>4,281</b> {copy.notes}</span>
          <span><b className="tabular-nums" style={{ color: P }}>18,904</b> {copy.links}</span>
          <span><b className="tabular-nums" style={{ color: P }}>92%</b> {copy.recallRate}</span>
        </span>
      </div>
    </div>
  );
}
