import type { Tool, AgentData } from "./types";

export const tools: Tool[] = [
  {
    id: "gmail",
    name: "Gmail",
    icon: { src: "/icons/connectors/gmail.svg" },
    color: "#ea4335",
    useCases: [
      { title: "Inbox triage", desc: "Auto-label, prioritize, and draft replies for inbound emails based on sender and content." },
      { title: "Follow-up reminders", desc: "Detect unanswered threads and send gentle follow-ups after configurable delays." },
      { title: "Meeting prep", desc: "Scan upcoming calendar invites, pull relevant email threads, and summarize context." },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: { src: "/icons/connectors/slack.svg" },
    color: "#4a154b",
    useCases: [
      { title: "Channel summarizer", desc: "Digest long channels into actionable summaries delivered to you every morning." },
      { title: "Standup collector", desc: "DM each team member for status updates, compile into a single standup post." },
      { title: "Alert router", desc: "Triage incoming alerts from monitoring tools and escalate to the right channel." },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: { src: "/icons/connectors/github.svg" },
    color: "#8b5cf6",
    useCases: [
      { title: "PR reviewer", desc: "Analyze pull requests for bugs, style issues, and missing tests — post inline comments." },
      { title: "Issue groomer", desc: "Auto-label stale issues, request more info, and suggest duplicates." },
      { title: "Release notes", desc: "Generate changelog entries from merged PRs grouped by category and impact." },
    ],
  },
  {
    id: "drive",
    name: "Google Drive",
    icon: { src: "/icons/connectors/google.svg" },
    color: "#34a853",
    useCases: [
      { title: "Doc organizer", desc: "Auto-file documents into folders based on content, project tags, and ownership." },
      { title: "Permissions auditor", desc: "Weekly scan of shared files — flag over-shared docs and external access." },
      { title: "Content indexer", desc: "Build a searchable knowledge base from scattered Drive documents." },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    icon: { src: "/icons/connectors/jira.svg" },
    color: "#0052cc",
    useCases: [
      { title: "Sprint planner", desc: "Analyze velocity history and suggest optimal story point allocation for next sprint." },
      { title: "Blocker detector", desc: "Monitor ticket dependencies and alert when a critical path item is stuck." },
      { title: "Status syncer", desc: "Keep Jira tickets in sync with GitHub PRs — auto-transition on merge." },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    icon: { src: "/icons/connectors/notion.svg" },
    color: "#e6e6e6",
    useCases: [
      { title: "Meeting notes", desc: "Transcribe recordings, extract action items, and create linked Notion pages." },
      { title: "Wiki gardener", desc: "Find outdated docs, suggest updates, and archive pages with no recent views." },
      { title: "Template filler", desc: "Auto-populate project brief templates from intake form responses." },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: { src: "/icons/connectors/google-calendar.svg" },
    color: "#06b6d4",
    useCases: [
      { title: "Schedule optimizer", desc: "Detect meeting-heavy days and suggest blocks for focus time automatically." },
      { title: "No-show handler", desc: "Track attendees who miss meetings and send rescheduling links." },
      { title: "Timezone coordinator", desc: "Find optimal meeting slots across global teams with minimal late-night asks." },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    icon: { src: "/icons/connectors/figma.svg" },
    color: "#f24e1e",
    useCases: [
      { title: "Design handoff", desc: "Extract component specs, tokens, and assets — post to the dev channel." },
      { title: "Comment tracker", desc: "Aggregate unresolved Figma comments and create follow-up tasks." },
      { title: "Version differ", desc: "Compare file versions and summarize visual changes for stakeholder review." },
    ],
  },
];

export const initialAgents: AgentData[] = [
  { name: "Email Triage", iconSrc: "/icons/connectors/gmail.svg", status: "running", executions: 12_847, rate: 94, color: "#06b6d4" },
  { name: "Slack Digest", iconSrc: "/icons/connectors/slack.svg", status: "running", executions: 8_320, rate: 87, color: "#a855f7" },
  { name: "PR Reviewer", iconSrc: "/icons/connectors/github.svg", status: "running", executions: 5_614, rate: 99, color: "#34d399" },
  { name: "Deploy Monitor", iconSrc: "/icons/connectors/google-calendar.svg", status: "healing", executions: 3_271, rate: 72, color: "#f43f5e" },
  { name: "Meeting Notes", iconSrc: "/icons/connectors/notion.svg", status: "idle", executions: 2_908, rate: 100, color: "#fbbf24" },
  { name: "Doc Indexer", iconSrc: "/icons/connectors/google.svg", status: "running", executions: 1_456, rate: 91, color: "#60a5fa" },
];

export const statusStyles: Record<string, { dot: string; label: string }> = {
  running: { dot: "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.6)]", label: "Running" },
  healing: { dot: "bg-brand-amber shadow-[0_0_6px_rgba(251,191,36,0.6)]", label: "Healing" },
  idle: { dot: "bg-white/20", label: "Idle" },
};

export const AUTOPLAY_INTERVAL = 4000;
