export interface QueueTask {
  id: string;
  label: string;
  project: string;
  status: "queued" | "running" | "done" | "failed";
  durationMs?: number;
}

export const INITIAL_QUEUE: QueueTask[] = [
  { id: "1", label: "pnpm typecheck", project: "personas-web", status: "done", durationMs: 4218 },
  { id: "2", label: "pnpm test --changed", project: "personas-web", status: "done", durationMs: 11300 },
  { id: "3", label: "cargo build --release", project: "personas", status: "running" },
  { id: "4", label: "pnpm lint --fix", project: "personas-web", status: "queued" },
  { id: "5", label: "docker build agents-worker", project: "personas-cloud", status: "queued" },
];

export const OUTPUT_LINES = [
  { text: "  Compiling tauri v2.0.0", color: "#a8ccd8" },
  { text: "  Compiling personas v0.3.1", color: "#a8ccd8" },
  { text: "warning: unused import `std::sync::Mutex`", color: "#fbbf24" },
  { text: "  --> src/agents/scheduler.rs:7:5", color: "#a8ccd8" },
  { text: "   | pub use std::sync::Mutex;", color: "#a8ccd8" },
  { text: "  Finished `release` profile in 19.6s", color: "#34d399" },
];

export const HEALING_ACTIONS = [
  {
    icon: "fix",
    label: "Detected: 1 warning (unused import)",
    action: "Auto-remove on next build",
    color: "#fbbf24",
  },
  {
    icon: "zap",
    label: "Detected: type error in agents/auth.ts",
    action: "Quick fix applied - missing `async`",
    color: "#06b6d4",
  },
  {
    icon: "shield",
    label: "Detected: flaky test `user-auth.spec`",
    action: "Retry queued (1/3)",
    color: "#a855f7",
  },
];
