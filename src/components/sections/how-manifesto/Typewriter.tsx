"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * One display line typed in character by character once it scrolls into view.
 * Reduced motion gates the CLASS, never the markup: every character is in the
 * server HTML and simply shows at once (the end state is the content - see
 * the DECORATIVE vs CONTENT-BEARING rule in lib/animations.ts). The final
 * character (the full stop) takes the line's accent colour.
 */
export default function TypewriterLine({
  text,
  className,
  accent,
  baseDelay = 0,
  charStep = 0.03,
  pulseAfter = false,
}: {
  text: string;
  className: string;
  accent: string;
  baseDelay?: number;
  charStep?: number;
  pulseAfter?: boolean;
}) {
  const still = useStillMotion();
  const lineRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(lineRef, { once: true, margin: "-60px" });
  const chars = Array.from(text);
  const typing = inView && !still;
  const revealDuration = chars.length * charStep;
  // Each word with the index of its first character in the whole line.
  const words = text.split(" ").reduce<{ word: string; start: number }[]>((acc, word) => {
    const prev = acc[acc.length - 1];
    acc.push({ word, start: prev ? prev.start + Array.from(prev.word).length + 1 : 0 });
    return acc;
  }, []);

  return (
    <span ref={lineRef} className={`relative block ${className}`}>
      {/* Read as one line, not letter by letter. */}
      <span className="sr-only">{text}</span>
      {/* Characters are grouped per word, so a narrow screen wraps between
          words and never inside one. */}
      <span aria-hidden>
        {words.map(({ word, start }, w) => (
          <span key={`${w}-${word}`}>
            {w > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, i) => (
                <span
                  key={`${i}-${char}`}
                  className={`inline-block ${still ? "" : inView ? "tw-char-reveal" : "tw-char-hidden"}`}
                  style={{
                    animationDelay: typing ? `${baseDelay + (start + i) * charStep}s` : undefined,
                    color: start + i === chars.length - 1 ? accent : undefined,
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {/* Rendered either way: reduced motion gates the class, never the markup. */}
      {pulseAfter && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-brand-cyan/20 to-transparent mix-blend-screen ${
            typing ? "tw-pulse-reveal" : "tw-char-hidden"
          }`}
          style={typing ? { animationDelay: `${baseDelay + revealDuration + 0.12}s` } : undefined}
        />
      )}
    </span>
  );
}
