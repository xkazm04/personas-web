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
  ExamplePrompt,
  FlowNode,
  NodeStatus,
  ResultDimension,
} from "./types";

export const RESULT_DIMENSIONS: ResultDimension[] = [
  { key: "messages", label: "Message", icon: Inbox, color: "#06b6d4" },
  { key: "humanReview", label: "Human review", icon: UserCheck, color: "#fbbf24" },
  { key: "events", label: "Event emitted", icon: Radio, color: "#a855f7" },
  { key: "memories", label: "Memory learned", icon: Brain, color: "#34d399" },
];

export const examples: ExamplePrompt[] = [
  {
    label: "Triage my Gmail",
    icon: Mail,
    iconColor: "#ea4335",
    prompt: "Triage my Gmail inbox and draft replies for urgent emails",
    intentText: "email_triage + auto_reply",
    tools: [
      { label: "Gmail API", icon: Mail },
      { label: "NLP Classifier", icon: Cpu },
    ],
    result: {
      messages:
        "Draft reply to sarah@acme.com — \u201CThanks for the update, I\u2019ll review by Friday.\u201D",
      humanReview: "Approve billing dispute reply before sending to legal@acme.com",
      events: "priority.email.triaged { sender: legal@acme.com }",
      memories: "legal@acme.com \u2192 always priority sender",
    },
  },
  {
    label: "Review this PR",
    icon: Github,
    iconColor: "#8b5cf6",
    prompt: "Review PR #142 for bugs, style issues, and missing tests",
    intentText: "code_review",
    tools: [
      { label: "GitHub API", icon: Github },
      { label: "AST Analyzer", icon: Search },
      { label: "Test Scanner", icon: ShieldCheck },
    ],
    result: {
      messages:
        "Inline comment on auth.ts:42 \u2014 \u201CMissing null check on user.session\u201D",
      humanReview: "Approve suggested refactor of loginFlow() before merge",
      events: "pr.review.needs_changes { pr: 142, blocker: true }",
      memories: "Team prefers early-return over nested if-else",
    },
  },
  {
    label: "Summarize Slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    prompt: "Summarize #engineering and #product channels from the last 24h",
    intentText: "channel_digest",
    tools: [
      { label: "Slack API", icon: MessageSquare },
      { label: "Summarizer", icon: Sparkles },
    ],
    result: {
      messages:
        "Digest posted to #my-digest \u2014 \u201C3 decisions, 2 blockers, 1 release\u201D",
      humanReview: "Confirm which blocker to escalate to @oncall",
      events: "digest.ready { channels: [eng, product], items: 14 }",
      memories: "\u201CRelease cut\u201D is a recurring topic on Thursdays",
    },
  },
  {
    label: "Optimize my schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    prompt: "Analyze next week's calendar and block focus time",
    intentText: "schedule_optimize",
    tools: [
      { label: "Calendar API", icon: Calendar },
      { label: "Schedule Analyzer", icon: Clock },
    ],
    result: {
      messages: "Added Tue 10\u201312 as \u201CDeep work \u2014 do not schedule\u201D",
      humanReview: "Approve moving 1:1 with Maya from Fri 2pm \u2192 Fri 4pm",
      events: "calendar.focus_block.created { duration: 2h }",
      memories: "You prefer mornings for deep work, afternoons for calls",
    },
  },
];

export function buildFlowNodes(example: ExamplePrompt): FlowNode[] {
  const nodes: FlowNode[] = [];
  const centerX = 280;
  let currentY = 30;
  const rowGap = 90;

  nodes.push({
    id: "parse",
    label: "Parse Intent",
    icon: Search,
    status: "pending",
    x: centerX,
    y: currentY,
  });
  currentY += rowGap;

  nodes.push({
    id: "select",
    label: "Select Tools",
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
    label: "Execute",
    icon: Zap,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "tool-merge",
  });
  currentY += rowGap;

  nodes.push({
    id: "verify",
    label: "Verify",
    icon: ShieldCheck,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "execute",
  });
  currentY += rowGap;

  nodes.push({
    id: "result",
    label: "Result",
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

export const SYNTAX_KEYWORDS = /\b(inbox|draft|replies|urgent|emails|PR|#142|bugs|style|issues|missing|tests|#engineering|#product|channels|24h|calendar|focus|time|next week)\b/gi;
