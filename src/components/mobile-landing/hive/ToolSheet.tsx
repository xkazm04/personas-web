"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/i18n/en";
import HiveSheet from "./HiveSheet";
import { ToolCoin } from "./ReelPoster";
import { TOOL_ORDER } from "./data";
import { fill } from "./useHiveCopy";
import type { ToolKey } from "./toolIcons";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  tool: ToolKey | null;
  onHop: (tool: ToolKey) => void;
  onClose: () => void;
  u: MobileLandingCopy["useCases"];
  tools: Translations["useCasesSection"];
  back: string;
  still: boolean;
}

/** The jobs a tool adds to the persona: three cards that rise in, then a row to hop to another tool. */
function JobList({ cases }: { cases: { title: string; desc: string }[] }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShown(true), 120);
    return () => clearTimeout(id);
  }, []);
  return (
    <ul className={`jobs-l${shown ? " in" : ""}`}>
      {cases.map((j, i) => (
        <li key={j.title} style={{ "--i": i } as React.CSSProperties}>
          <b>{j.title}</b>
          <p>{j.desc}</p>
        </li>
      ))}
    </ul>
  );
}

/** Bottom sheet: the jobs one tool brings to Chief of staff (opened from the reel). */
export default function ToolSheet({ tool, onHop, onClose, u, tools, back, still }: Props) {
  const [last, setLast] = useState<ToolKey>("gmail");
  if (tool && tool !== last) setLast(tool);
  const key = tool ?? last;
  const name = tools[key].name;
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    body.current?.scrollTo?.({ top: 0 });
    const cur = body.current?.querySelector('[aria-current="true"]');
    try {
      cur?.scrollIntoView({ block: "nearest", inline: "center" });
    } catch {
      /* older engines: the row simply stays where it is */
    }
  }, [key]);

  return (
    <HiveSheet open={tool !== null} onClose={onClose} label={u.sheetLabel} labelledBy="hm-st-title" backLabel={back} still={still}>
      <div className="sbody" ref={body}>
        <div className="shead">
          <ToolCoin tool={key} />
          <h3 id="hm-st-title">{name}</h3>
        </div>
        <p className="sadds">{fill(u.adds, { tool: name })}</p>
        <JobList key={key} cases={tools[key].cases} />
        <div className="hop">
          <h4>{u.hop}</h4>
          <div className="hop-r">
            {TOOL_ORDER.map((o) => (
              <button key={o} type="button" aria-current={o === key ? "true" : undefined} aria-label={tools[o].name} onClick={() => onHop(o)}>
                <ToolCoin tool={o} />
                <span>{o === "drive" ? u.driveShort : tools[o].name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </HiveSheet>
  );
}
