"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { CONNECTOR_COUNT, FEATURED_IDS, pickTools } from "../shared/catalog";
import ToolLogo from "../shared/ToolLogo";

const TOOLS = pickTools(FEATURED_IDS.slice(0, 18));

/** The other half of "plug in": the connector catalog, as real brand marks. */
export default function ReachPlate() {
  const t = useTranslation().t.featuresLab.plugins;
  return (
    <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3">
      <div className="mb-2.5 flex items-baseline justify-between text-[14px] font-semibold text-foreground/80">
        {fillTemplate(t.v1.reach, { count: CONNECTOR_COUNT })}
        <span className="font-mono text-[12px] font-normal text-foreground/60">
          {fillTemplate(t.more, { count: CONNECTOR_COUNT - TOOLS.length })}
        </span>
      </div>
      <ul className="grid grid-cols-6 gap-2">
        {TOOLS.map((tool) => (
          <li
            key={tool.id}
            title={tool.label}
            className="flex aspect-square items-center justify-center rounded-lg border border-foreground/[0.08] bg-background/60 text-foreground/75"
          >
            <ToolLogo icon={tool.icon} className="h-[18px] w-[18px]" />
            <span className="sr-only">{tool.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
