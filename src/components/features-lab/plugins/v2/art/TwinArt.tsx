"use client";

import { motion } from "framer-motion";
import ToolLogo from "../../shared/ToolLogo";
import { pickTools } from "../../shared/catalog";

const A = "var(--brand-amber)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** Three real channels, three tones: a quick chat line, a formal email, a polished post. */
const CHANNELS = pickTools(["slack", "gmail", "linkedin"]);
const ROWS = [
  { y: 22, rx: 22, lines: [64, 40], dot: true },
  { y: 92, rx: 4, lines: [44, 120, 104], dot: false },
  { y: 162, rx: 12, lines: [96, 72], dot: false },
];

/**
 * Twin, drawn: you, and the twin that speaks as you - the same identity
 * answering in each channel's own tone. The active channel's message writes
 * itself out; `step` picks the channel.
 */
export default function TwinArt({ step, run }: { step: number; run: boolean }) {
  const active = step % ROWS.length;
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden="true">
        {/* the twin: your silhouette, echoed */}
        <g transform="translate(14 8)" opacity={0.55}>
          <circle cx={84} cy={92} r={26} fill="none" stroke={A} strokeWidth={1.5} strokeDasharray="4 4" />
          <path d="M40 182c4-34 24-52 44-52s40 18 44 52" fill="none" stroke={A} strokeWidth={1.5} strokeDasharray="4 4" />
        </g>
        <circle cx={84} cy={92} r={26} fill={mix(A, 30)} stroke={A} strokeWidth={2} />
        <path d="M40 182c4-34 24-52 44-52s40 18 44 52z" fill={mix(A, 22)} stroke={A} strokeWidth={2} />
        {ROWS.map((r, i) => (
          <path
            key={`wire-${i}`}
            d={`M134 120 C 170 120, 170 ${r.y + 28}, 200 ${r.y + 28}`}
            fill="none"
            stroke={i === active ? A : mix(A, 25)}
            strokeWidth={i === active ? 2 : 1}
            style={{ transition: "stroke 400ms" }}
          />
        ))}
        {ROWS.map((r, i) => {
          const on = i === active;
          return (
            <g key={`card-${i}`}>
              <rect
                x={200}
                y={r.y}
                width={204}
                height={56}
                rx={r.rx}
                fill={on ? mix(A, 14) : mix("var(--foreground)", 4)}
                stroke={on ? A : mix("var(--foreground)", 16)}
                strokeWidth={1.3}
                style={{ transition: "fill 400ms, stroke 400ms" }}
              />
              {r.lines.map((w, li) => (
                <motion.rect
                  key={`${li}-${on}`}
                  x={244}
                  y={r.y + 12 + li * (r.lines.length > 2 ? 12 : 16)}
                  height={li === 0 && r.lines.length > 2 ? 4 : 5}
                  rx={2.5}
                  fill={on ? A : mix("var(--foreground)", 30)}
                  initial={on && run ? { width: 0 } : false}
                  animate={{ width: w }}
                  transition={run ? { duration: 0.5, delay: 0.15 + li * 0.35 } : { duration: 0 }}
                />
              ))}
              {r.dot && <circle cx={384} cy={r.y + 28} r={7} fill={on ? A : mix(A, 35)} />}
            </g>
          );
        })}
      </svg>
      {CHANNELS.map((tool, i) => (
        <span
          key={tool.id}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-foreground/85"
          style={{ left: `${(222 / 420) * 100}%`, top: `${((ROWS[i].y + 28) / 240) * 100}%` }}
        >
          <ToolLogo icon={tool.icon} className="h-[22px] w-[22px]" />
          <span className="sr-only">{tool.label}</span>
        </span>
      ))}
    </div>
  );
}
