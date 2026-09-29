import type { ReactNode } from "react";

/**
 * A section's kicker, headline and lede. The headline's `accent` renders in the
 * signal colour with the terminal punctuation the design uses ("... a cartridge.").
 */
export default function LnSectionHead({
  kicker,
  headingId,
  heading,
  accent,
  lede,
  className,
}: {
  kicker: string;
  headingId: string;
  heading: ReactNode;
  accent?: string;
  lede?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="ln-idx">{kicker}</p>
      <h2 className="ln-h2" id={headingId}>
        {heading}
        {accent ? <em>{accent}</em> : null}
      </h2>
      {lede ? <p className="ln-lead">{lede}</p> : null}
    </div>
  );
}
