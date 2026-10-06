"use client";

import { SCRIPT, mix } from "../shared/scenarios";
import type { Word } from "./timing";

/** The message as the scripted bot sees it. A cursor checks each word against
 *  the keyword list; a match lights up, everything else is blacked out - the
 *  bot never sees it. The still frame is the finished, redacted reading. */
export default function ScriptedReading({ words, t, step }: { words: Word[]; t: number; step: number }) {
  return (
    <p className="m-0 leading-[1.7]">
      {words.map((w, i) => {
        const checked = t >= w.at;
        const scanning = checked && t < w.at + step * 2.5;
        const lit = checked && w.key;
        const gone = checked && !w.key;
        return (
          <span key={i}>
            <span
              className="relative inline-block rounded-[0.18em] px-[0.12em] leading-tight transition-[color,background-color,box-shadow] duration-300"
              style={{
                color: gone ? "transparent" : lit ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 82%, transparent)",
                background: gone ? "color-mix(in srgb, var(--muted-dark) 34%, transparent)" : lit ? mix(SCRIPT, 30) : "transparent",
                boxShadow: scanning ? `0 0 0 2px ${mix(SCRIPT, 70)}` : lit ? `0 0 22px -4px ${mix(SCRIPT, 70)}, inset 0 -3px 0 ${SCRIPT}` : "none",
                fontWeight: lit ? 700 : undefined,
              }}
            >
              {w.text}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}
