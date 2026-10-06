"use client";

import { ActionButton } from "./modules/ActionButton";
import { ConnectorPanel, ConnectorRow, SlackRow } from "./modules/ConnectorRow";
import { MonitorCard } from "./modules/MonitorCard";
import { RunsTable } from "./modules/RunsTable";
import { ModuleReveal, SectionLabel, TargetPanel } from "./modules/shell";
import { TemplateCard } from "./modules/TemplateCard";
import { Toolbar } from "./modules/Toolbar";
import { TriggerCard } from "./modules/TriggerCard";
import { useTranslation } from "@/i18n/useTranslation";
import { SCENE, WIDE_ONLY, atStage, layoutFor, rectOf, type SceneState } from "./data";

/**
 * All canvas content of the stylized app — a real product screen, not a
 * diagram: toolbar, two template cards, a connector list mid-handshake, the
 * schedule module, a recent-runs table, the monitoring deck, and the action
 * button the setup ends on.
 *
 * Nothing here decides WHEN anything appears or changes: every module reads
 * its STAGE off the `SceneState` that `data.ts` derives from the tick, and
 * composes itself from that — frame, then structure, then texture, then the
 * mark a committed choice leaves. This file only knows how each stage looks.
 *
 * Every module is placed from the same percent rects the corner brackets and
 * the orb read (`./layout`), and its box is mounted for the whole loop, so
 * composing can never move anything: the ghost occupies the exact final rect
 * and the content builds INSIDE it. `compact` (md breakpoint) swaps the
 * two-column screen for a single-column one and drops the right rail — fewer
 * items, never smaller type.
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
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const g = SCENE.canvas;
  const L = layoutFor(compact);
  const { stage, lockedId } = scene;
  return (
    <div className="absolute inset-0">
      <Toolbar rect={L.toolbar} stage={stage.toolbar} reduced={reduced} />

      <SectionLabel
        at={L.labels.templates}
        w={L.labelW}
        text={c.templatesLabel}
        hint={c.templatesHint}
        show={atStage(stage.templates, "shell")}
        reduced={reduced}
      />
      <TargetPanel
        rect={rectOf("template", compact)}
        stage={stage.templates}
        locked={lockedId === "template"}
        selected={scene.templateChosen}
        reduced={reduced}
        className="flex-col justify-start gap-1.5 px-3 py-2.5"
      >
        <TemplateCard
          card={c.template}
          glyph={g.templateGlyph}
          stage={stage.templates}
          selected={scene.templateChosen}
          reduced={reduced}
        />
      </TargetPanel>
      {/* The runner-up: an equal until the choice commits, then the unchosen
          one. `overflow-hidden` matches its TargetPanel twin — without it the
          card's health strip spills out of the rect and lands on whatever
          module (or ghost) sits below it. */}
      <ModuleReveal
        rect={WIDE_ONLY.templateAlt}
        stage={stage.templates}
        reduced={reduced}
        className="hidden flex-col justify-start gap-1.5 overflow-hidden rounded-xl border border-glass px-3 py-2.5 md:flex"
      >
        <TemplateCard
          card={c.templateAlt}
          glyph={g.templateAltGlyph}
          stage={stage.templates}
          dim={scene.templateDimmed}
          reduced={reduced}
        />
      </ModuleReveal>
      <RunsTable rect={WIDE_ONLY.runs} stage={stage.runs} reduced={reduced} />

      <ConnectorPanel
        rect={L.connectors}
        stage={stage.connectors}
        connected={scene.slack === "connected"}
        reduced={reduced}
      />
      <SlackRow
        rect={rectOf("connect", compact)}
        stage={stage.connectors}
        state={scene.slack}
        locked={lockedId === "connect"}
        reduced={reduced}
      />
      {L.connRows.map((rect, i) => (
        <ConnectorRow
          key={c.chips[i].name}
          rect={rect}
          chip={c.chips[i]}
          glyph={g.chipGlyphs[i]}
          stage={stage.connectors}
          lead={(i + 1) * 0.14}
          reduced={reduced}
        />
      ))}
      <MonitorCard rect={WIDE_ONLY.monitor} stage={stage.monitor} reduced={reduced} />

      {/* The timezone lives inside the scheduler, where it belongs — the
          label row stays clear so her caption can pass through it */}
      <SectionLabel
        at={L.labels.trigger}
        w={L.labelW}
        text={c.triggerLabel}
        show={atStage(stage.trigger, "shell")}
        reduced={reduced}
      />
      <TriggerCard
        rect={rectOf("trigger", compact)}
        stage={stage.trigger}
        locked={lockedId === "trigger"}
        armed={scene.scheduleArmed}
        reduced={reduced}
      />

      <ActionButton
        rect={rectOf("action", compact)}
        stage={stage.action}
        state={scene.action}
        reduced={reduced}
      />
    </div>
  );
}
