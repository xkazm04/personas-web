"use client";

import { useState } from "react";
import { CornerDownLeft } from "lucide-react";
import type { BoardCopy } from "./copy";
import { fill, type SimAgent } from "./model";
import { ctlBtn } from "./Controls";

interface AnswerBoxProps {
  agent: SimAgent;
  copy: BoardCopy;
  /** What it asked (its top review's title), when known. */
  question: string | null;
  /** Offline, or an answer already on its way. */
  disabled: boolean;
  onSend: (text: string) => void;
  /** Bigger type, for the triage card. */
  large?: boolean;
}

const QUICK = ["go", "safe", "hold", "overseer"] as const;

/**
 * Answer a paused agent: what it asked, four quick answers that fill the box,
 * and a field to say it in your own words. Enter sends (Shift+Enter is a new
 * line); the run resumes when the machine picks the answer up.
 */
export default function AnswerBox({ agent: a, copy: c, question, disabled, onSend, large = false }: AnswerBoxProps) {
  const [text, setText] = useState("");
  const [prevId, setPrevId] = useState(a.id);
  if (prevId !== a.id) {
    setPrevId(a.id);
    setText("");
  }
  const id = `answer-${a.id}`;
  const send = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div>
      {question && (
        <>
          <div className="text-xs uppercase tracking-[0.12em] text-muted-dark">{c.answer.asks}</div>
          <p className={`mt-1 font-semibold leading-snug text-foreground ${large ? "text-2xl" : "text-lg"}`}>“{question}”</p>
        </>
      )}
      <div role="group" aria-label={c.answer.quickLabel} className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.map((k, i) => (
          <button
            key={k}
            type="button"
            data-quick
            disabled={disabled}
            onClick={() => {
              setText(c.answer.quick[k]);
              document.getElementById(id)?.focus();
            }}
            className="rounded-full px-3 py-1 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)] transition-colors hover:bg-[color-mix(in_oklab,var(--st-input_required)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-foreground"
          >
            {large && <kbd className="mr-1.5 font-mono text-xs text-muted-dark">{i + 1}</kbd>}
            {c.answer.quick[k]}
          </button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">{fill(c.answer.label, { callsign: a.callsign })}</label>
      <textarea
        id={id}
        data-answer
        rows={large ? 3 : 2}
        value={text}
        disabled={disabled}
        placeholder={c.answer.placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className="mt-2.5 w-full resize-none rounded-xl bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-3 py-2 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)] placeholder:text-muted-dark focus:shadow-[inset_0_0_0_1.5px_var(--st-input_required)] focus-visible:outline-none! disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-end">
        <button
          type="button"
          data-answer-send
          disabled={disabled || !text.trim()}
          onClick={send}
          className={ctlBtn}
          style={{ background: "var(--st-input_required)", color: "color-mix(in oklab, var(--st-input_required) 18%, black)" }}
        >
          {c.answer.send}
          <CornerDownLeft aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
