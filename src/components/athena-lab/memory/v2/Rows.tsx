"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { MONO, fg, fsOf } from "../shared/frame";
import { ROWS, type PhraseKey, type SceneState } from "./data";
import type { Geo, Words } from "./geometry";
import { place } from "../shared/place";

/** How many words a row's whole message took. */
function countWords(words: Words, r: number): number {
  const row = ROWS[r];
  const text = [words[row.ask], ...row.phrases.map((k) => words.phrases[k])].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Your side of the scene: the same request three times, one row each, oldest
 * at the top. Each row is a composer slab of pills - the ask, then every
 * detail you had to spell out - and her reply at the end of the row.
 *
 * A row is mounted for the whole loop as a dashed outline and solidifies when
 * you start typing it, so the staircase never shifts as it fills. Rows behind
 * you dim one step; a detail she has taken to carry gets a cyan seam, so on
 * the last frame you can see in your own old messages exactly which words you
 * will never have to type again.
 */
export default function Rows({
  geo,
  words,
  scene,
  reduced,
}: {
  geo: Geo;
  words: Words;
  scene: SceneState;
  reduced: boolean;
}) {
  const c = useTranslation().t.athenaLab.memory.v2;
  const fs = fsOf(geo.W);
  const at = place(geo);

  return (
    <>
      {ROWS.map((row, r) => {
        const g = geo.rows[r];
        const typed = scene.typed[r];
        const past = scene.current > r;
        const last = g.pills[g.pills.length - 1];
        const typing = scene.current === r && !scene.replied[r] && typed > 0;
        return (
          <motion.div
            key={row.when}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: past ? 0.62 : 1 }}
            transition={{ duration: reduced ? 0 : 0.9 }}
          >
            <span
              className={`absolute -translate-y-1/2 text-muted-dark ${MONO}`}
              style={{ ...at({ x: g.label.x, y: g.label.y }), ...fs(geo.fs.label, 12) }}
            >
              {c.when[row.when]}
            </span>
            {/* How much you had to type. The number is the argument. */}
            <motion.span
              className={`absolute -translate-y-1/2 whitespace-nowrap ${MONO}`}
              style={{
                ...at(g.count),
                ...fs(geo.fs.label * 0.95, 12),
                color: BRAND_VAR.cyan,
              }}
              initial={false}
              animate={{ opacity: typed >= (row.phrases.length ? 2 : 1) ? 0.9 : 0 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            >
              {c.words.replace("{n}", String(countWords(words, r)))}
            </motion.span>

            <span
              className={`absolute rounded-2xl border duration-500 transition-[background-color,border-color] ${typed ? "" : "border-dashed"}`}
              style={{
                ...at(g.slab),
                borderColor: typed ? fg(16) : tint("cyan", 14),
                backgroundColor: typed ? fg(4) : "transparent",
                boxShadow: typed ? `inset 0 1px 0 ${fg(10)}` : "none",
              }}
            />

            {g.pills.map((p, i) => {
              const shown = p.key === "ask" ? typed >= 1 : typed >= 2;
              const key = p.key === "ask" ? null : (p.key as PhraseKey);
              const kept = key !== null && scene.carried.has(key) && row.keeps.includes(key);
              const lifting = key !== null && scene.flying.includes(key) && row.keeps.includes(key);
              const said = key !== null && r === 0 && scene.repeats && ROWS[1].phrases.includes(key);
              return (
                <motion.span
                  key={p.key}
                  className={`absolute flex items-center whitespace-nowrap rounded-xl border ${p.key === "ask" ? "justify-start" : "justify-center"} duration-500 transition-[background-color,border-color,box-shadow] ${said && !kept ? "border-dashed" : ""}`}
                  style={{
                    ...at(p),
                    ...fs(geo.fs.pill, 14),
                    color: p.key === "ask" ? "var(--foreground)" : fg(88),
                    fontWeight: p.key === "ask" ? 600 : 400,
                    borderColor: kept || lifting ? tint("cyan", 60) : said ? tint("cyan", 45) : p.key === "ask" ? "transparent" : fg(14),
                    backgroundColor: lifting ? tint("cyan", 18) : kept ? tint("cyan", 7) : p.key === "ask" ? "transparent" : fg(6),
                    boxShadow: lifting ? brandShadow("cyan", 18, 45) : "none",
                  }}
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }}
                  transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: shown ? Math.max(0, i - 1) * 0.14 : 0 }}
                >
                  {p.key === "ask" ? words[row.ask] : words.phrases[p.key as PhraseKey]}
                </motion.span>
              );
            })}

            {/* The caret, while this row is still being typed. */}
            <motion.span
              className="absolute w-[2px] -translate-y-1/2 rounded-full"
              style={{
                ...at({ x: last.x + last.w + 8, y: last.y + last.h / 2 }),
                height: `${(last.h * 0.6 * 100) / geo.H}%`,
                backgroundColor: BRAND_VAR.cyan,
              }}
              initial={false}
              animate={{ opacity: typing ? (reduced ? 1 : [1, 0, 1]) : 0 }}
              transition={typing && !reduced ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
            />

            <Reply geo={geo} r={r} shown={scene.replied[r]} full={r === 2 && scene.recall > 0} reduced={reduced} label={c.done} />
          </motion.div>
        );
      })}
    </>
  );
}

/** Her answer. The month-two one lights up as everything she carries flows
 *  into it - just as complete as day one, from three words. */
function Reply({ geo, r, shown, full, reduced, label }: { geo: Geo; r: number; shown: boolean; full: boolean; reduced: boolean; label: string }) {
  const fs = fsOf(geo.W);
  const box = geo.rows[r].reply;
  return (
    <motion.span
      className="absolute flex items-center justify-center gap-[0.45em] rounded-full border font-semibold"
      style={{
        ...place(geo)(box),
        ...fs(geo.fs.pill * 0.86, 13),
        color: BRAND_VAR.cyan,
        borderColor: tint("cyan", full ? 70 : 40),
        backgroundColor: tint("cyan", full ? 16 : 8),
        boxShadow: full ? brandShadow("cyan", 22, 45) : "none",
      }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.8 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
    >
      <svg viewBox="0 0 16 16" className="h-[0.9em] w-[0.9em]" aria-hidden="true">
        <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </motion.span>
  );
}
