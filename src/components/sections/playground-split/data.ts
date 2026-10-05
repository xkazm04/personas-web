import {
  Calendar,
  Clock,
  Cpu,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import type {
  ExampleBase,
  ExamplePrompt,
  PlaygroundCopy,
} from "./types";

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

// Single source of truth for the prompt-highlighter keywords. The regex and the
// membership test are derived from this in SyntaxPrompt (previously there were
// three drifting copies). Note the `#`-prefixed tokens — a leading `\b` can
// never match before `#`, so the pattern is built with boundary lookarounds.
export const SYNTAX_KEYWORDS: string[] = [
  "inbox", "draft", "replies", "urgent", "emails", "PR", "#142", "bugs",
  "style", "issues", "missing", "tests", "#engineering", "#product",
  "channels", "24h", "calendar", "focus", "time", "next week",
];
