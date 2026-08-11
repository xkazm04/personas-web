"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { Part } from "./parts";

/**
 * Glyph + name + account detail — the left side of every connector row, shared
 * by the Slack row mid-handshake and the tools that are already connected.
 *
 * It composes in two passes like everything else on the canvas: the glyph and
 * the name arrive with the content cascade (body), the account detail fills on
 * the bracket lock (detail). `lead` lets a caller walk sibling rows in one
 * after another rather than dropping the list in as a block.
 */
export function RowBody({
  glyph,
  name,
  detail,
  stage,
  lead = 0,
  reduced,
  dim,
}: {
  glyph: string;
  name: string;
  detail: string;
  stage: ModuleStage;
  lead?: number;
  reduced: boolean;
  dim?: boolean;
}) {
  return (
    <>
      <Part
        show={atStage(stage, "body")}
        i={0}
        lead={lead}
        reduced={reduced}
        className={dim ? "flex shrink-0 opacity-70" : "flex shrink-0"}
      >
        <ConnectorIcon src={glyph} size={18} />
      </Part>
      <Part
        show={atStage(stage, "body")}
        i={1}
        lead={lead}
        reduced={reduced}
        className={`min-w-0 flex-1 truncate text-base font-medium ${dim ? "text-foreground/70" : "text-foreground"}`}
      >
        {name}
      </Part>
      <Part
        show={atStage(stage, "detail")}
        i={1}
        lead={lead}
        reduced={reduced}
        className="hidden shrink-0 truncate text-base text-muted-dark md:block"
      >
        {detail}
      </Part>
    </>
  );
}
