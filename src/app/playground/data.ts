import {
  Mail,
  GitPullRequest,
  MessageSquare,
  Calendar,
  FileText,
  Search,
  type LucideIcon,
} from "lucide-react";

export type OutputLineType =
  | "header"
  | "info"
  | "tool"
  | "process"
  | "success"
  | "result";

export interface OutputLine {
  text: string;
  type: OutputLineType;
  indent?: number;
}

export interface PromptCard {
  icon: LucideIcon;
  title: string;
  description: string;
  lines: OutputLine[];
}

export const LINE_COLORS: Record<OutputLineType, string> = {
  header: "text-foreground",
  info: "text-muted-dark",
  tool: "text-brand-cyan",
  process: "text-amber-400/90",
  success: "text-brand-emerald",
  result: "text-muted",
};

export const LINE_ICONS: Record<OutputLineType, string> = {
  header: "\u25B6",
  info: "\u2022",
  tool: "\u2692",
  process: "\u21BB",
  success: "\u2714",
  result: "\u2500",
};

export const PROMPTS: PromptCard[] = [
  {
    icon: Mail,
    title: "Triage my inbox",
    description: "Read new emails, classify by urgency, and draft replies",
    lines: [
      { text: '> Parsing: "Triage my inbox"', type: "header" },
      { text: "  Intent: email_triage", type: "success" },
      { text: "  Tools: gmail_api, nlp_classifier", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching 12 new emails from Gmail...", type: "process", indent: 1 },
      { text: "  Classifying by urgency and sender...", type: "process", indent: 1 },
      { text: "  3 urgent, 5 follow-up, 4 FYI", type: "info", indent: 1 },
      { text: "  Drafting reply for urgent #1...", type: "process", indent: 1 },
      { text: "  Drafting reply for urgent #2...", type: "process", indent: 1 },
      { text: "  Drafting reply for urgent #3...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 4.2s", type: "success" },
      { text: "  3 replies drafted, 5 flagged for follow-up, 4 archived", type: "result", indent: 1 },
    ],
  },
  {
    icon: GitPullRequest,
    title: "Review this PR",
    description: "Analyze code changes, find bugs, and suggest improvements",
    lines: [
      { text: '> Parsing: "Review this PR"', type: "header" },
      { text: "  Intent: code_review", type: "success" },
      { text: "  Tools: github_api, ast_analyzer, test_scanner", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching PR #142 diff (14 files, +342 / -89)...", type: "process", indent: 1 },
      { text: "  Analyzing code structure and patterns...", type: "process", indent: 1 },
      { text: "  Found 2 potential null derefs in api/handler.ts", type: "info", indent: 1 },
      { text: "  Checking test coverage for changed files...", type: "process", indent: 1 },
      { text: "  auth middleware: 0% coverage (gap detected)", type: "info", indent: 1 },
      { text: "  Posting 6 inline review comments...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 3.8s", type: "success" },
      { text: "  2 bugs flagged, 3 style notes, 1 test gap identified", type: "result", indent: 1 },
    ],
  },
  {
    icon: MessageSquare,
    title: "Summarize Slack",
    description: "Digest today's channels into actionable highlights",
    lines: [
      { text: '> Parsing: "Summarize Slack"', type: "header" },
      { text: "  Intent: channel_digest", type: "success" },
      { text: "  Tools: slack_api, summarizer, nlp_extractor", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Connecting to workspace (4 channels)...", type: "process", indent: 1 },
      { text: "  Reading #engineering: 127 messages, 14 threads...", type: "process", indent: 1 },
      { text: "  Reading #product: 83 messages, 9 threads...", type: "process", indent: 1 },
      { text: "  Extracting decisions and action items...", type: "process", indent: 1 },
      { text: "  3 key decisions, 2 blockers, 5 action items found", type: "info", indent: 1 },
      { text: "  Generating structured digest...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 5.1s", type: "success" },
      { text: "  Digest posted to #my-updates with action items tagged", type: "result", indent: 1 },
    ],
  },
  {
    icon: Calendar,
    title: "Optimize my schedule",
    description: "Find free slots, resolve conflicts, and block focus time",
    lines: [
      { text: '> Parsing: "Optimize my schedule"', type: "header" },
      { text: "  Intent: schedule_optimize", type: "success" },
      { text: "  Tools: calendar_api, schedule_analyzer", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Loading next week's calendar...", type: "process", indent: 1 },
      { text: "  Mon: 6h meetings | Tue: 3h | Wed: 5h | Thu: 2h | Fri: 4h", type: "info", indent: 1 },
      { text: "  Detecting meeting-heavy days...", type: "process", indent: 1 },
      { text: "  Monday and Wednesday exceed 4h threshold", type: "info", indent: 1 },
      { text: "  Finding optimal focus time slots...", type: "process", indent: 1 },
      { text: "  Creating 3 focus blocks: Tue 9-11, Thu 9-12, Fri 9-11", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 2.9s", type: "success" },
      { text: "  3 focus blocks added (6h total), 0 conflicts", type: "result", indent: 1 },
    ],
  },
  {
    icon: FileText,
    title: "Draft release notes",
    description: "Scan recent commits and write user-facing changelog",
    lines: [
      { text: '> Parsing: "Draft release notes"', type: "header" },
      { text: "  Intent: release_changelog", type: "success" },
      { text: "  Tools: git_api, commit_analyzer, markdown_writer", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching commits since v2.3.0 (47 commits)...", type: "process", indent: 1 },
      { text: "  Categorizing: 12 features, 8 fixes, 27 chores...", type: "process", indent: 1 },
      { text: "  Filtering user-facing changes...", type: "process", indent: 1 },
      { text: "  12 features and 8 fixes qualify for changelog", type: "info", indent: 1 },
      { text: "  Writing human-readable descriptions...", type: "process", indent: 1 },
      { text: "  Formatting as markdown with categories...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 3.4s", type: "success" },
      { text: "  CHANGELOG.md updated: 12 features, 8 fixes documented", type: "result", indent: 1 },
    ],
  },
  {
    icon: Search,
    title: "Research competitors",
    description: "Find pricing changes, new features, and market positioning",
    lines: [
      { text: '> Parsing: "Research competitors"', type: "header" },
      { text: "  Intent: competitive_analysis", type: "success" },
      { text: "  Tools: web_scraper, pricing_tracker, diff_engine", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Scanning 5 competitor websites...", type: "process", indent: 1 },
      { text: "  Checking pricing pages for changes...", type: "process", indent: 1 },
      { text: "  Competitor A: price increase +15% detected", type: "info", indent: 1 },
      { text: "  Analyzing new feature announcements...", type: "process", indent: 1 },
      { text: "  Competitor B: launched AI assistant feature", type: "info", indent: 1 },
      { text: "  Comparing positioning statements...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 6.7s", type: "success" },
      { text: "  Report generated: 2 pricing changes, 3 new features, 1 pivot", type: "result", indent: 1 },
    ],
  },
];
