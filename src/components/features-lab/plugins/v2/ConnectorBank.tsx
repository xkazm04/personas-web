"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { CATEGORY_COUNT, CONNECTOR_COUNT, FEATURED_IDS, pickTools } from "../shared/catalog";
import ToolLogo from "../shared/ToolLogo";

const TOOLS = pickTools(FEATURED_IDS.slice(0, 17));

/**
 * The strip's second half: the connector catalog as a bank of small plugs,
 * each a real brand mark from the catalog, filling in as a wave after the
 * plugins seat. The last socket counts the rest.
 */
export default function ConnectorBank({ still }: { still: boolean }) {
  const t = useTranslation().t.featuresLab.plugins;
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-3">
      <div className="flex items-baseline gap-3 whitespace-nowrap">
        <span className="text-[15px] font-semibold text-foreground">{t.v2.bank}</span>
        <span className="font-mono text-[12px] text-foreground/65">
          {fillTemplate(t.toolCount, { count: CONNECTOR_COUNT })} · {fillTemplate(t.categoryCount, { count: CATEGORY_COUNT })}
        </span>
      </div>
      <ul className="grid grid-cols-9 gap-1.5">
        {TOOLS.map((tool, i) => (
          <motion.li
            key={tool.id}
            title={tool.label}
            className="flex aspect-square items-center justify-center rounded-lg border border-foreground/[0.1] text-foreground/80 shadow-[inset_0_-2px_0_color-mix(in_srgb,var(--foreground)_6%,transparent)]"
            style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)" }}
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={still ? { duration: 0 } : { delay: 1.1 + (i % 9) * 0.05 + Math.floor(i / 9) * 0.12, type: "spring", stiffness: 260, damping: 18 }}
          >
            <ToolLogo icon={tool.icon} className="h-[18px] w-[18px]" />
            <span className="sr-only">{tool.label}</span>
          </motion.li>
        ))}
        <li className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-foreground/[0.18] font-mono text-[12px] font-semibold text-foreground/70">
          {fillTemplate(t.more, { count: CONNECTOR_COUNT - TOOLS.length })}
        </li>
      </ul>
    </div>
  );
}
