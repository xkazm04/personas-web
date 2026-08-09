"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import { ConnectorPanel, ConnectorRow, SlackRow } from "./modules/ConnectorRow";
import { MonitorCard } from "./modules/MonitorCard";
import { RunsTable } from "./modules/RunsTable";
import { SectionLabel, TargetPanel, rectStyle } from "./modules/primitives";
import { TemplateCard } from "./modules/TemplateCard";
import { Toolbar } from "./modules/Toolbar";
import { TriggerCard } from "./modules/TriggerCard";
import { COPY, WIDE_ONLY, layoutFor, rectOf, type ConnectState, type Rect, type StopId } from "./data";

/**
 * All canvas content of the stylized app — a real product screen, not a
 * diagram: toolbar, two template cards, a connector list mid-handshake, the
 * schedule module, a recent-runs table, the monitoring deck, and the action
 * button the walkthrough lands on.
 *
 * Every module is placed from the same percent rects the corner brackets and
 * the orb read (`./layout`), so lock-on is always pixel-true. `compact`
 * (md breakpoint) swaps the two-column screen for a single-column one and
 * drops the right rail — fewer items, never smaller type (text-base floor).
 */
export function CanvasScene({
  lockedId,
  pulse,
  slackState,
  compact,
  reduced,
}: {
  lockedId: StopId | null;
  pulse: boolean;
  slackState: ConnectState;
  compact: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const L = layoutFor(compact);
  return (
    <div className="absolute inset-0">
      <Toolbar rect={L.toolbar} />

      <SectionLabel
        at={L.labels.templates}
        w={L.labelW}
        text={c.templatesLabel}
        hint={c.templatesHint}
      />
      <TargetPanel
        rect={rectOf("template", compact)}
        locked={lockedId === "template"}
        className="flex-col justify-start gap-1.5 px-3 py-2.5"
      >
        <TemplateCard card={c.template} />
      </TargetPanel>
      <div
        className="absolute hidden flex-col justify-start gap-1.5 rounded-xl border border-glass px-3 py-2.5 md:flex"
        style={rectStyle(WIDE_ONLY.templateAlt)}
      >
        <TemplateCard card={c.templateAlt} dim />
      </div>
      <RunsTable rect={WIDE_ONLY.runs} />

      <ConnectorPanel rect={L.connectors} />
      <SlackRow
        rect={rectOf("connect", compact)}
        state={slackState}
        locked={lockedId === "connect"}
        reduced={reduced}
      />
      {L.connRows.map((rect, i) => (
        <ConnectorRow key={c.chips[i].name} rect={rect} chip={c.chips[i]} />
      ))}
      <MonitorCard rect={WIDE_ONLY.monitor} reduced={reduced} />

      {/* The timezone lives inside the scheduler, where it belongs — the
          label row stays clear so her caption can pass through it */}
      <SectionLabel at={L.labels.trigger} w={L.labelW} text={c.triggerLabel} />
      <TriggerCard rect={rectOf("trigger", compact)} locked={lockedId === "trigger"} />

      <ActionButton rect={rectOf("action", compact)} pulse={pulse} reduced={reduced} />
    </div>
  );
}

/** Final stop — a real action button; the walkthrough ends on action. */
function ActionButton({
  rect,
  pulse,
  reduced,
}: {
  rect: Rect;
  pulse: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const Icon = c.actionIcon;
  const live = pulse && !reduced;
  return (
    <motion.button
      type="button"
      tabIndex={-1}
      className="absolute flex items-center justify-center gap-2 rounded-xl text-base font-semibold text-background"
      style={{
        ...rectStyle(rect),
        backgroundColor: BRAND_VAR.cyan,
        boxShadow: brandShadow("cyan", pulse ? 36 : 18, pulse ? 40 : 22),
      }}
      animate={live ? { scale: [1, 1.045, 1] } : { scale: 1 }}
      transition={live ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
    >
      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      {c.action}
    </motion.button>
  );
}
