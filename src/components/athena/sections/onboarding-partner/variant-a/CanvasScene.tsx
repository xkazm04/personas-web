"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { ConnectorPanel, ConnectorRow, SlackRow } from "./modules/ConnectorRow";
import { MonitorCard } from "./modules/MonitorCard";
import { RunsTable } from "./modules/RunsTable";
import { ModuleReveal, SectionLabel, TargetPanel } from "./modules/shell";
import { TemplateCard } from "./modules/TemplateCard";
import { Toolbar } from "./modules/Toolbar";
import { TriggerCard } from "./modules/TriggerCard";
import {
  COPY,
  WIDE_ONLY,
  layoutFor,
  rectOf,
  type ActionState,
  type Rect,
  type SceneState,
} from "./data";

/**
 * All canvas content of the stylized app — a real product screen, not a
 * diagram: toolbar, two template cards, a connector list mid-handshake, the
 * schedule module, a recent-runs table, the monitoring deck, and the action
 * button the setup ends on.
 *
 * Nothing here decides WHEN anything appears or changes: every module reads
 * its existence and its state off the `SceneState` that `data.ts` derives
 * from the tick. This file only knows how each of those states looks.
 *
 * Every module is placed from the same percent rects the corner brackets and
 * the orb read (`./layout`), so lock-on is always pixel-true — and so a
 * reveal can never move anything, because absolute rects do not reflow.
 * `compact` (md breakpoint) swaps the two-column screen for a single-column
 * one and drops the right rail — fewer items, never smaller type.
 */
export function CanvasScene({
  scene,
  compact,
  reduced,
}: {
  scene: SceneState;
  compact: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const L = layoutFor(compact);
  const { shown, lockedId } = scene;
  return (
    <div className="absolute inset-0">
      <Toolbar rect={L.toolbar} shown={shown.toolbar} reduced={reduced} />

      <SectionLabel
        at={L.labels.templates}
        w={L.labelW}
        text={c.templatesLabel}
        hint={c.templatesHint}
        shown={shown.templates}
        reduced={reduced}
      />
      <TargetPanel
        rect={rectOf("template", compact)}
        shown={shown.templates}
        locked={lockedId === "template"}
        selected={scene.templateChosen}
        reduced={reduced}
        className="flex-col justify-start gap-1.5 px-3 py-2.5"
      >
        <TemplateCard card={c.template} selected={scene.templateChosen} reduced={reduced} />
      </TargetPanel>
      {/* The runner-up: an equal until the choice commits, then the unchosen
          one. `overflow-hidden` matches its TargetPanel twin — without it the
          card's health strip spills out of the rect and lands on whatever
          module (or skeleton) sits below it. */}
      <ModuleReveal
        rect={WIDE_ONLY.templateAlt}
        shown={shown.templates}
        reduced={reduced}
        ghostClassName="hidden md:block"
        className="hidden flex-col justify-start gap-1.5 overflow-hidden rounded-xl border border-glass px-3 py-2.5 md:flex"
      >
        <TemplateCard card={c.templateAlt} dim={scene.templateChosen} />
      </ModuleReveal>
      <RunsTable rect={WIDE_ONLY.runs} shown={shown.runs} reduced={reduced} />

      <ConnectorPanel
        rect={L.connectors}
        shown={shown.connectors}
        connected={scene.slack === "connected"}
        reduced={reduced}
      />
      <SlackRow
        rect={rectOf("connect", compact)}
        shown={shown.connectors}
        state={scene.slack}
        locked={lockedId === "connect"}
        reduced={reduced}
      />
      {L.connRows.map((rect, i) => (
        <ConnectorRow
          key={c.chips[i].name}
          rect={rect}
          chip={c.chips[i]}
          shown={shown.connectors}
          reduced={reduced}
        />
      ))}
      <MonitorCard rect={WIDE_ONLY.monitor} shown={shown.monitor} reduced={reduced} />

      {/* The timezone lives inside the scheduler, where it belongs — the
          label row stays clear so her caption can pass through it */}
      <SectionLabel
        at={L.labels.trigger}
        w={L.labelW}
        text={c.triggerLabel}
        shown={shown.trigger}
        reduced={reduced}
      />
      <TriggerCard
        rect={rectOf("trigger", compact)}
        shown={shown.trigger}
        locked={lockedId === "trigger"}
        armed={scene.scheduleArmed}
        reduced={reduced}
      />

      <ActionButton
        rect={rectOf("action", compact)}
        shown={shown.action}
        state={scene.action}
        reduced={reduced}
      />
    </div>
  );
}

/**
 * The closing stop — a real action button. It beckons while she presents it,
 * then commits into its done face; the runs table and the monitoring deck
 * arrive on the same beat, because that click is what created them.
 */
function ActionButton({
  rect,
  shown,
  state,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  state: ActionState;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const done = state === "done";
  const Icon = done ? c.actionDoneIcon : c.actionIcon;
  const live = state === "pulse" && !reduced;
  return (
    <ModuleReveal rect={rect} shown={shown} reduced={reduced}>
      <motion.button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl text-base font-semibold text-background"
        style={{
          backgroundColor: BRAND_VAR.cyan,
          boxShadow: brandShadow("cyan", live ? 36 : 18, live ? 40 : 22),
        }}
        animate={live ? { scale: [1, 1.045, 1] } : { scale: 1 }}
        transition={live ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <motion.span
          key={done ? "done" : "idle"}
          className="flex items-center gap-2"
          initial={reduced ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : SPRING_POP}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          {done ? c.actionDone : c.action}
        </motion.span>
      </motion.button>
    </ModuleReveal>
  );
}
