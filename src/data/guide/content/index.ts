import { content as gettingStarted } from "./getting-started";
import { content as credentials } from "./credentials";
import { content as agentsPrompts } from "./agents-prompts";
import { content as triggers } from "./triggers";
import { content as pipelines } from "./pipelines";
import { content as memories } from "./memories";
import { content as monitoring } from "./monitoring";
import { content as testing } from "./testing";
import { content as deployment } from "./deployment";
import { content as troubleshooting } from "./troubleshooting";

export const GUIDE_CONTENT: Record<string, string> = {
  ...gettingStarted,
  ...credentials,
  ...agentsPrompts,
  ...triggers,
  ...pipelines,
  ...memories,
  ...monitoring,
  ...testing,
  ...deployment,
  ...troubleshooting,
};
