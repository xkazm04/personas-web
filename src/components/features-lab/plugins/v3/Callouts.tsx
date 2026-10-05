"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { pluginTagline, type LabPlugin, type LabPluginKey } from "../shared/roster";
import { CATEGORY_COUNT, CONNECTOR_COUNT } from "../shared/catalog";
import { CENTER, HALF_W, layerY } from "./geometry";

/** Where the cards sit (box px) - leader lines run from each plate's right corner to its card. */
const CARD_X = 620;
const CARDS = { connectors: { top: 40, mid: 86 }, plugins: { top: 168, mid: 298 }, agents: { top: 470, mid: 508 } } as const;

/**
 * The labels of the exploded view, set off to the side like a technical
 * drawing: one card per plate, a hairline from the plate's corner to it. The
 * plugins card holds the controls - one button per shipped plugin.
 */
export default function Callouts({
  plugins,
  active,
  onSelect,
  exploded,
  still,
}: {
  plugins: LabPlugin[];
  active: LabPluginKey;
  onSelect: (key: LabPluginKey) => void;
  exploded: boolean;
  still: boolean;
}) {
  const { t } = useTranslation();
  const lab = t.featuresLab.plugins;
  const plugin = plugins.find((p) => p.key === active) ?? plugins[0];
  const corner = CENTER.x + HALF_W + 14;
  const lines = (Object.keys(CARDS) as (keyof typeof CARDS)[]).map((k) => ({ k, y0: layerY(k), y1: CARDS[k].mid }));
  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {lines.map(({ k, y0, y1 }) => (
          <motion.path
            key={k}
            d={`M${corner} ${y0} C ${corner + 50} ${y0}, ${CARD_X - 50} ${y1}, ${CARD_X - 6} ${y1}`}
            fill="none"
            stroke="color-mix(in srgb, var(--foreground) 30%, transparent)"
            strokeWidth={1.2}
            strokeDasharray="3 4"
            initial={false}
            animate={{ opacity: exploded ? 1 : 0 }}
            transition={{ duration: still ? 0 : 0.5, delay: still ? 0 : 0.9 }}
          />
        ))}
      </svg>

      <Card top={CARDS.connectors.top} tone="var(--brand-emerald)" title={lab.connectorsLabel} sub={lab.v3.layerConnectors}>
        <div className="mt-1 font-mono text-[13px] text-foreground/65">
          {fillTemplate(lab.toolCount, { count: CONNECTOR_COUNT })} · {fillTemplate(lab.categoryCount, { count: CATEGORY_COUNT })}
        </div>
      </Card>

      <Card top={CARDS.plugins.top} tone="var(--brand-purple)" title={lab.pluginsLabel} sub={lab.v3.layerPlugins}>
        <div role="group" aria-label={lab.pickLabel} className="mt-3 grid grid-cols-2 gap-2">
          {plugins.map((p) => {
            const on = p.key === active;
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                type="button"
                data-plugin-key={p.key}
                aria-pressed={on}
                onClick={() => onSelect(p.key)}
                className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[16px] font-semibold outline-none transition-[background,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-brand-cyan"
                style={{
                  borderColor: on ? BRAND_VAR[p.brand] : "color-mix(in srgb, var(--foreground) 12%, transparent)",
                  background: on ? tint(p.brand, 16) : "transparent",
                  boxShadow: on ? `0 0 20px ${tint(p.brand, 30)}` : undefined,
                  color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 75%, transparent)",
                }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: BRAND_VAR[p.brand] }} aria-hidden="true" />
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[16px] leading-snug text-foreground/80">{pluginTagline(t, plugin.copyKey)}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {lab.adds[plugin.copyKey].map((line) => (
            <li key={line} className="rounded-full px-2.5 py-0.5 text-[14px] text-foreground/85" style={{ background: tint(plugin.brand, 14) }}>
              {line}
            </li>
          ))}
        </ul>
      </Card>

      <Card top={CARDS.agents.top} tone="var(--brand-cyan)" title={lab.agentsLabel} sub={lab.v3.layerAgents} />
    </>
  );
}

function Card({ top, tone, title, sub, children }: { top: number; tone: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="absolute rounded-2xl border px-5 py-3.5" style={{ left: CARD_X, top, width: 470, borderColor: `color-mix(in srgb, ${tone} 35%, transparent)`, background: "color-mix(in srgb, var(--background) 82%, transparent)" }}>
      <div className="flex items-baseline gap-3">
        <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full" style={{ background: tone, boxShadow: `0 0 10px ${tone}` }} aria-hidden="true" />
        <span className="text-[20px] font-semibold text-foreground">{title}</span>
        <span className="text-[16px] text-foreground/70">{sub}</span>
      </div>
      {children}
    </div>
  );
}
