"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { CONNECTOR_COUNT, REACH_TOOLS, TOOLS } from "./shared/catalog";
import ToolLogo from "./shared/ToolLogo";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

const SHOWN = REACH_TOOLS.map((key) => TOOLS[key]);

/** The other half of "plug in": the connector catalog, as real brand marks. */
export default function ReachPlate() {
  const { language } = useTranslation();
  const copy = featuresSectionsCopy.plugins;
  return (
    <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3">
      <div className="mb-2.5 flex items-baseline justify-between text-[15px] font-semibold text-foreground/80">
        {fillTemplate(copy.v1.reach, { count: CONNECTOR_COUNT.toLocaleString(language) })}
        <span className="font-mono text-[14px] font-normal text-foreground/65">
          {fillTemplate(copy.more, { count: (CONNECTOR_COUNT - SHOWN.length).toLocaleString(language) })}
        </span>
      </div>
      <ul className="grid grid-cols-6 gap-2">
        {SHOWN.map((tool) => (
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
