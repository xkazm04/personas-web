"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { frame } from "./shared/Shell";
import { LAYERS } from "./shared/layers";
import { COL_W, COUNTS, H, W } from "./geometry";
import { howSectionsCopy } from "@/i18n/pending/howSections";

const f = frame(W, H);

/**
 * The left column: where you are in time, how many agents that is (the number
 * is the headline), and which layer each stop leans on - lit as you reach it.
 */
export default function Ledger({ stage, still }: { stage: number; still: boolean }) {
  const v = howSectionsCopy.layers.v2;
  const stop = v.stops[stage];
  const count = COUNTS[stage];
  const enter = still ? false : { opacity: 0, y: 14 };

  return (
    <div className="absolute flex flex-col" style={f.box(0, 6, COL_W, 512)} aria-live="polite">
      <motion.p
        key={`w${stage}`}
        initial={enter}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono font-semibold uppercase tracking-[0.2em]"
        style={{ ...f.fs(15, 12), color: BRAND_VAR[LAYERS[stage].brand] }}
      >
        {stop.when}
      </motion.p>
      <motion.p
        key={`a${stage}`}
        initial={enter}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="font-semibold leading-tight tracking-tight text-foreground"
        style={f.fs(40, 22)}
      >
        {stop.what}
      </motion.p>
      <div className="flex items-baseline" style={{ gap: f.u(12), marginTop: f.u(4) }}>
        <motion.span
          key={`n${stage}`}
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-brand-cyan to-brand-purple bg-clip-text font-bold leading-none tracking-tighter text-transparent tabular-nums"
          style={f.fs(132, 54)}
        >
          {count}
        </motion.span>
        <span className="text-muted" style={f.fs(22, 16)}>
          {count === 1 ? v.agent : v.agents}
        </span>
      </div>

      <p className="font-mono uppercase tracking-[0.18em] text-muted" style={{ ...f.fs(13, 12), marginTop: f.u(26) }}>
        {v.ledgerLabel}
      </p>
      <ul className="flex flex-col" style={{ gap: f.u(10), marginTop: f.u(12) }}>
        {LAYERS.map((layer, i) => {
          const lit = i <= stage;
          const Icon = layer.icon;
          return (
            <li key={layer.id} className="flex items-center" style={{ gap: f.u(14) }}>
              <span
                className="flex shrink-0 items-center justify-center rounded-xl border transition-all duration-500"
                style={{
                  width: f.u(42),
                  height: f.u(42),
                  borderColor: tint(layer.brand, lit ? 60 : 18),
                  background: tint(layer.brand, lit ? 18 : 4),
                  boxShadow: lit && i === stage ? `0 0 20px ${tint(layer.brand, 50)}` : "none",
                }}
              >
                <Icon aria-hidden style={{ width: "50%", height: "50%", color: lit ? BRAND_VAR[layer.brand] : "var(--muted-dark)" }} />
              </span>
              <span
                className={`leading-tight transition-colors duration-500 ${lit ? "text-foreground" : "text-muted-dark"}`}
                style={f.fs(19, 15)}
              >
                {v.layerLines[layer.id]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
