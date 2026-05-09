import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import type { CommandSequence, OutputLine } from "./types";

export const commands: CommandSequence[] = [
  {
    command: 'personas design "Email triage assistant"',
    icon: Wand2,
    pillar: "Design",
    output: [
      { text: "", color: "muted" },
      { text: "  Analyzing request...", color: "cyan" },
      { text: "  Feasibility: HIGH  (3 tools available)", color: "emerald" },
      { text: "", color: "muted" },
      { text: "  Generated agent.config:", color: "purple" },
      { text: "  ┌─────────────────────────────────────┐", color: "purple", indent: 0 },
      { text: "  │  role     : \"Email triage assistant\" │", color: "purple", indent: 0 },
      { text: "  │  tools    : [gmail, slack, jira]     │", color: "amber", indent: 0 },
      { text: "  │  trigger  : \"every 15 minutes\"       │", color: "cyan", indent: 0 },
      { text: "  │  healing  : true                     │", color: "emerald", indent: 0 },
      { text: "  └─────────────────────────────────────┘", color: "purple", indent: 0 },
      { text: "", color: "muted" },
      { text: "  ✓ Agent scaffolded successfully", color: "emerald" },
    ],
  },
  {
    command: "personas connect email slack github",
    icon: Zap,
    pillar: "Coordinate",
    output: [
      { text: "", color: "muted" },
      { text: "  Wiring event bus...", color: "cyan" },
      { text: "", color: "muted" },
      { text: "  ┌──────┐     ┌──────┐     ┌──────┐", color: "cyan" },
      { text: "  │ Email │ ──► │ Slack│ ──► │GitHub│", color: "cyan" },
      { text: "  └──────┘     └──────┘     └──────┘", color: "cyan" },
      { text: "", color: "muted" },
      { text: "  Routes:", color: "white" },
      { text: "    email.received  → slack.post-message", color: "cyan", indent: 2 },
      { text: "    slack.reaction  → github.create-issue", color: "cyan", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ 3 agents connected via event bus", color: "emerald" },
      { text: "  ⚡ Running locally — no cloud required", color: "amber" },
    ],
  },
  {
    command: "personas deploy --target cloud",
    icon: Cloud,
    pillar: "Deploy",
    output: [
      { text: "", color: "muted" },
      { text: "  Packaging agents...", color: "cyan" },
      { text: "  Uploading bundle [====            ]  25%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [========        ]  50%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [============    ]  75%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [================] 100%", color: "emerald", delay: 200 },
      { text: "", color: "muted" },
      { text: "  Provisioning infrastructure...", color: "cyan" },
      { text: "    ✓ Container runtime ready", color: "emerald", indent: 2 },
      { text: "    ✓ Event bus connected", color: "emerald", indent: 2 },
      { text: "    ✓ Secrets injected", color: "emerald", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ Deployed to cloud — running 24/7", color: "emerald" },
      { text: "  🌐 https://agents.personas.dev/triage", color: "cyan" },
    ],
  },
  {
    command: "personas monitor --live",
    icon: Activity,
    pillar: "Monitor",
    output: [
      { text: "", color: "muted" },
      { text: "  Live telemetry stream:", color: "amber" },
      { text: "", color: "muted" },
      { text: "  Executions ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇  42/hr", color: "amber" },
      { text: "  Latency    ▂▂▃▂▁▁▂▃▂▁▁▂▂▃▂  avg 1.2s", color: "cyan" },
      { text: "  Success    ████████████████  99.7%", color: "emerald" },
      { text: "", color: "muted" },
      { text: "  Recent events:", color: "white" },
      { text: "    12:04:32  email.triage     → classified 3 urgent", color: "amber", indent: 2 },
      { text: "    12:04:33  slack.notify     → sent to #alerts", color: "cyan", indent: 2 },
      { text: "    12:04:35  github.issue     → created GH-1847", color: "purple", indent: 2 },
      { text: "    12:04:36  healing.engine   → auto-fixed timeout", color: "emerald", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ All systems operational", color: "emerald" },
    ],
  },
];

export const summaryLines: OutputLine[] = [
  { text: "", color: "muted" },
  { text: "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "muted" },
  { text: "  Platform ready. 4 capabilities active.", color: "emerald" },
  { text: "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "muted" },
];

export const colorClasses: Record<OutputLine["color"], string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  white: "text-muted",
  muted: "text-muted-dark",
  rose: "text-rose-400",
};

/** Brand keys indexed by command position (for CommandBadge). */
export const commandBrands = ["purple", "cyan", "emerald", "amber"] as const;

export function getTypingDelay(): number {
  const base = 35;
  const variation = Math.random();
  if (variation > 0.95) return base + 120;
  if (variation > 0.85) return base + 50;
  return base + Math.random() * 20;
}
