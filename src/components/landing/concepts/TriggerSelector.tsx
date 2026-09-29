"use client";

import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { LABEL_Y } from "./triggers-data";

/**
 * The ten detents as real buttons laid over the art (five per side). One
 * group; arrow keys move the selection around the dial like the knob does.
 */
export default function TriggerSelector({
  label,
  names,
  cur,
  onPick,
}: {
  label: string;
  names: readonly string[];
  cur: number;
  onPick: (i: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const home = e.key === "Home" ? 0 : e.key === "End" ? names.length - 1 : -1;
    if (!step && home < 0) return;
    e.preventDefault();
    const next = home >= 0 ? home : (cur + step + names.length) % names.length;
    onPick(next);
    box.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div ref={box} className="ln-ci-t-sel" role="group" aria-label={label} onKeyDown={onKey}>
      {names.map((n, i) => (
        <button
          key={n}
          type="button"
          className={`ln-ci-t-opt ${i < 5 ? "ln-l" : "ln-r"}`}
          style={{ "--ln-y": `${LABEL_Y[i]}%` } as CSSProperties}
          aria-pressed={i === cur}
          onClick={() => onPick(i)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
