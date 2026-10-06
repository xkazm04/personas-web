import type { ToolId } from "./data";
import { TOOL_PATHS } from "./tool-paths";
import s from "./clock.module.css";

/** Each tool's own drawn scene behind its mark (120 box), in the tool's brand colours. */
const MOTIF: Record<ToolId, React.ReactNode> = {
  slack: (
    <g fill="none" strokeWidth={9} strokeLinecap="round">
      <path d="M44 22V98" stroke="var(--c-slack-a)" />
      <path d="M76 22V98" stroke="var(--c-slack-b)" />
      <path d="M22 44H98" stroke="var(--c-slack-c)" />
      <path d="M22 76H98" stroke="var(--c-slack-d)" />
    </g>
  ),
  gmail: (
    <g fill="none" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="19" y="31" width="82" height="58" rx="10" stroke="var(--c-gmail-a)" />
      <path d="M22 38L60 68 98 38" stroke="var(--c-gmail-b)" />
    </g>
  ),
  github: (
    <g fill="none" strokeWidth={5} strokeLinecap="round">
      <path d="M38 28V92" stroke="var(--c-github-a)" />
      <path d="M38 80C38 54 84 70 84 40" stroke="var(--c-github-b)" />
      <circle cx="38" cy="28" r="8" fill="var(--c-github-a)" stroke="none" />
      <circle cx="38" cy="92" r="8" fill="var(--c-github-a)" stroke="none" />
      <circle cx="84" cy="36" r="8" fill="var(--c-github-b)" stroke="none" />
    </g>
  ),
  drive: (
    <g fill="none" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 22L24 84" stroke="var(--c-drive-b)" />
      <path d="M24 84H96" stroke="var(--c-drive-c)" />
      <path d="M96 84L60 22" stroke="var(--c-drive-a)" />
    </g>
  ),
  jira: (
    <g stroke="none">
      <rect x="23" y="24" width="21" height="72" rx="7" fill="var(--c-jira-b)" />
      <rect x="50" y="24" width="21" height="48" rx="7" fill="var(--c-jira-a)" />
      <rect x="77" y="24" width="21" height="30" rx="7" fill="var(--c-jira-c)" />
    </g>
  ),
  notion: (
    <g strokeWidth={3.6} strokeLinecap="round" fill="none">
      <rect x="27" y="23" width="58" height="72" rx="8" stroke="var(--c-notion-b)" transform="rotate(-9 60 60)" />
      <rect x="35" y="24" width="58" height="72" rx="8" stroke="var(--c-notion-a)" transform="rotate(5 60 60)" />
      <path d="M47 44H79M47 58H79M47 72H67" stroke="var(--c-notion-b)" transform="rotate(5 60 60)" />
    </g>
  ),
  stripe: (
    <g fill="none" strokeWidth={8} strokeLinecap="round">
      <path d="M14 86L74 22" stroke="var(--c-stripe-a)" />
      <path d="M32 100L100 28" stroke="var(--c-stripe-b)" />
      <path d="M58 108L108 56" stroke="var(--c-stripe-c)" />
    </g>
  ),
};

/** The tool's lens: a plate, its motif and its mark (120 box). Rendered inside an <svg>. */
export function LensArt({ tool }: { tool: ToolId }) {
  return (
    <>
      <circle className={s.lensBg} cx="60" cy="60" r="57" />
      <g className={s.lensMo} opacity={0.9}>
        {MOTIF[tool]}
      </g>
      <circle cx="60" cy="60" r="27" fill="var(--lens-plate)" />
      <path className={s.lensMark} transform="translate(42 42) scale(1.5)" d={TOOL_PATHS[tool]} />
    </>
  );
}
