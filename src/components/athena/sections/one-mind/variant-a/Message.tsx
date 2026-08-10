"use client";

import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { Line } from "./copy";
import { Part } from "./parts";

/**
 * One line of one conversation — something you typed, or something she said.
 *
 * Side and weight carry who is speaking, so no line ever has to be labelled.
 *
 * The important part is the highlight. The fact wears an IDENTICAL mark in the
 * conversation it was told in and in the answer it later produces somewhere
 * else — that visual identity is the section's whole argument in its smallest
 * form, and it is why a viewer can point at the thing and follow it instead of
 * being asked to take the claim on trust. The mark carries its padding at all
 * times, bleeding outside its own run, so lighting a phrase adds no width and
 * a line can never re-wrap around it.
 */
function Said({ line }: { line: Line }) {
  if (!line.fact) return <>{line.text}</>;
  const at = line.text.indexOf(line.fact);
  if (at < 0) return <>{line.text}</>;
  return (
    <>
      {line.text.slice(0, at)}
      <span
        className="box-decoration-clone -mx-1 rounded-md px-1 font-medium"
        style={{
          backgroundColor: tint("cyan", 18),
          color: BRAND_VAR.cyan,
          boxShadow: brandShadow("cyan", 14, 22),
        }}
      >
        {line.fact}
      </span>
      {line.text.slice(at + line.fact.length)}
    </>
  );
}

export default function Message({ line, i, reduced }: { line: Line; i: number; reduced: boolean }) {
  const yours = line.from === "you";
  return (
    <Part
      show
      i={i}
      reduced={reduced}
      className={`flex ${yours ? "justify-end" : "justify-start"}`}
    >
      {/* Two lines at most, at every breakpoint. A line that would run longer
          is a line that should have been written shorter — clamping the ANSWER
          down to one line on a phone would truncate the very words the section
          is asking you to follow. */}
      <span
        className="line-clamp-2 max-w-[94%] rounded-xl border px-2.5 py-1 text-base leading-snug text-foreground"
        style={{
          borderColor: tint("cyan", yours ? 14 : 26),
          backgroundColor: tint("cyan", yours ? 4 : 9),
        }}
      >
        <Said line={line} />
      </span>
    </Part>
  );
}
