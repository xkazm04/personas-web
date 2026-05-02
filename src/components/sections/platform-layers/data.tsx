import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import type { Layer } from "./types";

export const layers: Layer[] = [
  {
    id: "deploy",
    label: "Infrastructure",
    pillar: "Deploy",
    icon: Cloud,
    brand: "emerald",
    description:
      "Run agents on your computer or in the cloud — or both at once. Deploy with a single click, and use your own servers if you prefer.",
    visual: (
      <div className="flex items-center gap-2 font-mono text-base">
        <span className="text-emerald-400/60">local</span>
        <svg width="32" height="8" className="text-emerald-500/60">
          <line x1="0" y1="4" x2="28" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points="26,1 30,4 26,7" fill="currentColor" />
        </svg>
        <span className="text-emerald-300">cloud 24/7</span>
      </div>
    ),
  },
  {
    id: "coordinate",
    label: "Execution",
    pillar: "Coordinate",
    icon: Zap,
    brand: "cyan",
    description:
      "One action triggers the next automatically. An email arrives, Slack gets notified, GitHub gets updated — all without you lifting a finger.",
    visual: (
      <div className="flex items-center gap-1.5 font-mono text-base">
        {["Em", "Sl", "GH"].map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              {n}
            </div>
            {i < 2 && <div className="h-px w-4 bg-gradient-to-r from-cyan-500/40 to-cyan-500/10" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "design",
    label: "Intelligence",
    pillar: "Design",
    icon: Wand2,
    brand: "purple",
    description:
      "Describe what you want in plain English. Personas helps you build the right agent with step-by-step guidance and smart suggestions.",
    visual: (
      <div className="font-mono text-base space-y-0.5">
        <div>
          <span className="text-purple-400">role</span>
          <span className="text-muted-dark">: </span>
          <span className="text-emerald-400">&quot;Email triage&quot;</span>
        </div>
        <div>
          <span className="text-purple-400">tools</span>
          <span className="text-muted-dark">: </span>
          <span className="text-amber-400">[gmail, slack]</span>
        </div>
        <div>
          <span className="text-purple-400">healing</span>
          <span className="text-muted-dark">: </span>
          <span className="text-emerald-400">true</span>
        </div>
      </div>
    ),
  },
  {
    id: "monitor",
    label: "Observability",
    pillar: "Monitor",
    icon: Activity,
    brand: "amber",
    description:
      "See everything your agents do in real time. Track performance, review activity logs, and let the system fix problems automatically.",
    visual: (
      <div className="flex items-end gap-0.5 h-6">
        {[30, 55, 40, 70, 45, 80, 60, 90].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-sm bg-gradient-to-t from-amber-500/20 to-amber-400/50"
            style={{ height: `${h * 0.28}px` }}
          />
        ))}
      </div>
    ),
  },
];
