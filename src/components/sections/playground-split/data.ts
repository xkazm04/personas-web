import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Inbox,
  Mail,
  MessageSquare,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import type {
  ExampleBase,
  ExamplePrompt,
  FlowNode,
  NodeStatus,
  PlaygroundCopy,
  ResultDimension,
} from "./types";

export const RESULT_DIMENSIONS: ResultDimension[] = [
  { key: "messages", icon: Inbox, color: "#06b6d4" },
  { key: "humanReview", icon: UserCheck, color: "#fbbf24" },
  { key: "events", icon: Radio, color: "#a855f7" },
  { key: "memories", icon: Brain, color: "#34d399" },
];

/**
 * The four sample prompts: identity, icons and the code-shaped text (intent
 * ids, emitted events). Every natural-language string is translated copy in
 * `t.playgroundSection`, joined in by `localizeExamples`.
 */
const EXAMPLE_BASES: ExampleBase[] = [
  {
    id: "gmail",
    icon: Mail,
    iconColor: "#ea4335",
    intentText: "email_triage + auto_reply",
    tools: [
      { id: "gmailApi", icon: Mail },
      { id: "nlpClassifier", icon: Cpu },
    ],
    event: "priority.email.triaged { sender: legal@acme.com }",
  },
  {
    id: "pr",
    icon: Github,
    iconColor: "#8b5cf6",
    intentText: "code_review",
    tools: [
      { id: "githubApi", icon: Github },
      { id: "astAnalyzer", icon: Search },
      { id: "testScanner", icon: ShieldCheck },
    ],
    event: "pr.review.needs_changes { pr: 142, blocker: true }",
  },
  {
    id: "slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    intentText: "channel_digest",
    tools: [
      { id: "slackApi", icon: MessageSquare },
      { id: "summarizer", icon: Sparkles },
    ],
    event: "digest.ready { channels: [eng, product], items: 14 }",
  },
  {
    id: "schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    intentText: "schedule_optimize",
    tools: [
      { id: "calendarApi", icon: Calendar },
      { id: "scheduleAnalyzer", icon: Clock },
    ],
    event: "calendar.focus_block.created { duration: 2h }",
  },
];

/** Joins each sample prompt's identity with its translated words. */
export function localizeExamples(copy: PlaygroundCopy): ExamplePrompt[] {
  return EXAMPLE_BASES.map(({ id, tools, event, ...base }) => {
    const words = copy.examples[id];
    return {
      ...base,
      label: words.label,
      prompt: words.prompt,
      tools: tools.map((tool) => ({ label: copy.tools[tool.id], icon: tool.icon })),
      result: {
        messages: words.messages,
        humanReview: words.humanReview,
        events: event,
        memories: words.memories,
      },
    };
  });
}

export function buildFlowNodes(example: ExamplePrompt, labels: PlaygroundCopy["nodes"]): FlowNode[] {
  const nodes: FlowNode[] = [];
  const centerX = 280;
  let currentY = 30;
  const rowGap = 90;

  nodes.push({
    id: "parse",
    label: labels.parse,
    icon: Search,
    status: "pending",
    x: centerX,
    y: currentY,
  });
  currentY += rowGap;

  nodes.push({
    id: "select",
    label: labels.select,
    icon: Wrench,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "parse",
  });
  currentY += rowGap;

  const toolCount = example.tools.length;
  const toolSpacing = 190;
  const toolStartX = centerX - ((toolCount - 1) * toolSpacing) / 2;

  example.tools.forEach((tool, i) => {
    nodes.push({
      id: `tool-${i}`,
      label: tool.label,
      icon: tool.icon,
      status: "pending",
      x: toolStartX + i * toolSpacing,
      y: currentY,
      parentId: "select",
      color: i === 0 ? "#06b6d4" : i === 1 ? "#a855f7" : "#f43f5e",
    });
  });
  currentY += rowGap;

  nodes.push({
    id: "execute",
    label: labels.execute,
    icon: Zap,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "tool-merge",
  });
  currentY += rowGap;

  nodes.push({
    id: "verify",
    label: labels.verify,
    icon: ShieldCheck,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "execute",
  });
  currentY += rowGap;

  nodes.push({
    id: "result",
    label: labels.result,
    icon: CheckCircle2,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "verify",
  });

  return nodes;
}

export function getStatusColor(status: NodeStatus): string {
  switch (status) {
    case "active":
      return "border-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.4)]";
    case "done":
      return "border-brand-emerald/50 bg-brand-emerald/5";
    default:
      return "border-glass-hover";
  }
}

// Single source of truth for the prompt-highlighter keywords. The regex and the
// membership test are derived from this in SyntaxPrompt (previously there were
// three drifting copies). Note the `#`-prefixed tokens — a leading `\b` can
// never match before `#`, so the pattern is built with boundary lookarounds.
export const SYNTAX_KEYWORDS: string[] = [
  "inbox", "draft", "replies", "urgent", "emails", "PR", "#142", "bugs",
  "style", "issues", "missing", "tests", "#engineering", "#product",
  "channels", "24h", "calendar", "focus", "time", "next week",
];
