"use client";

import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./copy";
import { braceSpan, type FieldLayout } from "./layout";
import { Rule } from "./ink";
import { Part } from "./parts";

/**
 * How much one sitting reached, as a measurement rather than a number.
 *
 * The span draws left to right — the direction she read — and only then do the
 * two end caps rise back up toward the seam, so the bracket closes AROUND the
 * reading instead of being stamped underneath it. The right cap of the first
 * bracket stands at exactly the same coordinate as the marker's stem, which
 * means the second bracket does not merely start near where the first ended:
 * it starts on the same line.
 *
 * Both brackets carry the identical two words, because both brackets are the
 * identical length (the twelve messages under each sum to the same number of
 * seam units — see ./copy). Two equal spans sharing one edge is the section's
 * whole claim, and no sentence anywhere in the frame has to make it.
 */
export default function Brace({
  layout,
  pass,
  closed,
  reduced,
  color,
}: {
  layout: FieldLayout;
  pass: number;
  closed: boolean;
  reduced: boolean;
  color: string;
}) {
  const { from, to } = braceSpan(layout, pass);
  const cap = (at: number) => (
    <Rule
      origin="bottom"
      drawn={closed}
      reduced={reduced}
      delay={0.4}
      centerX
      color={color}
      left={`${at}%`}
      top={`${layout.braceY - layout.braceCap}%`}
      width="1px"
      height={`${layout.braceCap}%`}
    />
  );

  return (
    <>
      <Rule
        origin="left"
        drawn={closed}
        reduced={reduced}
        color={color}
        left={`${from}%`}
        top={`${layout.braceY}%`}
        width={`${to - from}%`}
        height="1px"
      />
      {cap(from)}
      {cap(to)}
      <Part
        show={closed}
        lead={0.55}
        reduced={reduced}
        className={`absolute block text-center ${ANNOTATION}`}
        style={{ left: `${from}%`, width: `${to - from}%`, top: `${layout.braceLabelY}%` }}
      >
        {COPY.brace}
      </Part>
    </>
  );
}
