"use client";

import { Fragment, useId } from "react";
import type { DimCopy } from "../shared/copy";
import { segmentSentence } from "../shared/Sentence";
import { RING_D } from "./geometry";

/**
 * The visitor's sentence written around the crown of the flower: typed word
 * by word, then the words that drove a decision take that decision's colour.
 */
export default function Ring({
  sentence,
  dims,
  typing,
  read,
  moving,
  typeMs,
}: {
  sentence: string;
  dims: DimCopy[];
  typing: boolean;
  read: boolean;
  moving: boolean;
  typeMs: number;
}) {
  const id = useId().replace(/:/g, "");
  const segments = segmentSentence(sentence, dims);
  const total = sentence.split(" ").length;
  const per = (typeMs * 0.85) / total;
  let w = 0;
  return (
    <g>
      <path id={`${id}ring`} d={RING_D} fill="none" />
      <text fontSize={21} fontWeight={600} letterSpacing={0.4} fill="var(--foreground)">
        <textPath href={`#${id}ring`} startOffset="50%" textAnchor="middle">
          {segments.map((seg, si) => (
            <Fragment key={si}>
              {seg.text.split(/(\s+)/).map((word, wi) => {
                if (word === "") return null;
                if (/^\s+$/.test(word)) return <tspan key={wi}>{word}</tspan>;
                const i = w++;
                const lit = read && seg.dim;
                return (
                  <tspan
                    key={wi}
                    fill={lit ? seg.dim?.ink : "var(--foreground)"}
                    style={{
                      fillOpacity: typing ? 1 : 0.14,
                      transition: moving ? `fill-opacity .25s ${typing ? i * per : 0}ms, fill .5s` : "none",
                    }}
                  >
                    {word}
                  </tspan>
                );
              })}
            </Fragment>
          ))}
        </textPath>
      </text>
    </g>
  );
}
