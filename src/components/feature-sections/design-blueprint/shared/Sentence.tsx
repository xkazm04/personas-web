"use client";

import { Fragment, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { DimCopy } from "./copy";
import type { DimKey } from "./dims";

interface Segment {
  text: string;
  dim?: DimCopy;
}

/** Splits the sentence around each dimension's keyword (when it occurs). */
export function segmentSentence(sentence: string, dims: DimCopy[]): Segment[] {
  const hits = dims
    .filter((d) => d.keyword && sentence.includes(d.keyword))
    .map((d) => ({ d, at: sentence.indexOf(d.keyword as string) }))
    .sort((a, b) => a.at - b.at);
  const out: Segment[] = [];
  let pos = 0;
  for (const { d, at } of hits) {
    if (at < pos) continue;
    if (at > pos) out.push({ text: sentence.slice(pos, at) });
    out.push({ text: d.keyword as string, dim: d });
    pos = at + (d.keyword as string).length;
  }
  if (pos < sentence.length) out.push({ text: sentence.slice(pos) });
  return out;
}

/**
 * The visitor's sentence, typed word by word, with the words that drove a
 * decision underlined in that decision's ink once Personas has read them.
 * Remount it (key) to retype.
 */
export default function Sentence({
  sentence,
  dims,
  typing,
  lit,
  moving,
  typeMs,
  className = "",
  style,
}: {
  sentence: string;
  dims: DimCopy[];
  /** The typing beat has started. */
  typing: boolean;
  /** Keywords currently lit. */
  lit: (dim: DimKey) => boolean;
  moving: boolean;
  typeMs: number;
  className?: string;
  style?: CSSProperties;
}) {
  const segments = segmentSentence(sentence, dims);
  const total = sentence.split(" ").length;
  const per = (typeMs / 1000) * 0.85 / total;
  let w = 0;
  return (
    <p className={className} style={style}>
      {segments.map((seg, si) => {
        const words = seg.text.split(/(\s+)/);
        const on = seg.dim ? lit(seg.dim.key) : false;
        const body = words.map((word, wi) => {
          if (/^\s+$/.test(word) || word === "") return <Fragment key={wi}>{word}</Fragment>;
          const i = w++;
          return (
            <motion.span
              key={wi}
              initial={false}
              animate={{ opacity: typing ? 1 : 0.12 }}
              transition={{ delay: moving && typing ? i * per : 0, duration: moving ? 0.25 : 0 }}
            >
              {word}
            </motion.span>
          );
        });
        if (!seg.dim) return <Fragment key={si}>{body}</Fragment>;
        const ink = seg.dim.ink;
        return (
          <span
            key={si}
            className="bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(${ink}, ${ink})`,
              backgroundPosition: "0 100%",
              backgroundSize: on ? "100% 0.12em" : "0% 0.12em",
              color: on ? ink : undefined,
              transition: moving ? "background-size 0.6s ease-out, color 0.4s" : "none",
            }}
          >
            {body}
          </span>
        );
      })}
    </p>
  );
}
