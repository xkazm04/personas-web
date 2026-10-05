import type { ComponentType } from "react";
import type { TriggerId } from "@/components/sections/orchestration-hub/data";
import type { SceneProps } from "./scene-kit";
import { ScheduleScene, PollingScene, WebhookScene } from "./scenes-a";
import { FileScene, ClipboardScene, FocusScene, EventScene } from "./scenes-b";
import { ChainScene, CompositeScene, ManualScene } from "./scenes-c";

/**
 * One stylised vignette per trigger (160x120 user units), drawn for this
 * section: each acts out the moment its trigger fires, once per beat, and
 * rests on the "it fired" frame when the hub is stopped or motion is reduced.
 * Render inside <TriggerScene>, which supplies the <svg>.
 */
export const SCENES: Record<TriggerId, ComponentType<SceneProps>> = {
  schedule: ScheduleScene,
  polling: PollingScene,
  webhook: WebhookScene,
  file: FileScene,
  clipboard: ClipboardScene,
  focus: FocusScene,
  event: EventScene,
  chain: ChainScene,
  composite: CompositeScene,
  manual: ManualScene,
};
