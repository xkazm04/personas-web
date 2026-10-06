import { Fragment } from "react";
import ToolMark from "./ToolMark";

/** U+2011, so "#triage-inbox" never breaks at its hyphen. */
const NB_HYPHEN = String.fromCharCode(0x2011);

/**
 * A decision's words with the real connector marks it names. "Gmail - Slack"
 * with two tools interleaves a mark before each name; otherwise the marks
 * lead the sentence.
 */
export default function DecisionText({ value: raw, tools, mark = "1.15em" }: { value: string; tools?: string[]; mark?: string }) {
  const size = { width: mark, height: mark };
  // Keep hyphenated names ("#triage-inbox") whole: a non-breaking hyphen.
  const value = raw.replace(/(\w)-(\w)/g, `$1${NB_HYPHEN}$2`);
  if (!tools?.length) return <>{value}</>;
  const parts = value.split(/\s+-\s+/);
  if (parts.length === tools.length) {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-[0.45em]">
        {parts.map((p, i) => (
          <Fragment key={p}>
            {i > 0 && <span className="opacity-60">&middot;</span>}
            <span className="inline-flex items-center gap-[0.35em]">
              <ToolMark name={tools[i]} style={size} />
              {p}
            </span>
          </Fragment>
        ))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[0.4em]">
      {tools.map((t) => (
        <ToolMark key={t} name={t} style={size} />
      ))}
      <span>{value}</span>
    </span>
  );
}
