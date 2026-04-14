import {
  Mail,
  MessageSquare,
  Calendar,
  ArrowRight,
  Search,
  Cpu,
  Wrench,
  Zap,
  Sparkles,
  FileOutput,
} from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import type { ExamplePrompt } from "./types";

export const examples: ExamplePrompt[] = [
  {
    label: "Triage my Gmail",
    icon: Mail,
    iconColor: "#ea4335",
    prompt: "Triage my Gmail inbox and draft replies for urgent emails",
    stages: [
      { id: "input", label: "Input", icon: ArrowRight, description: "Received natural language instruction", timing: "+0.0s", duration: 400 },
      { id: "parse", label: "Parse", icon: Search, description: "Intent: email_triage + auto_reply", timing: "+0.4s", duration: 600 },
      { id: "plan", label: "Plan", icon: Cpu, description: "Strategy: fetch, classify, draft", timing: "+1.0s", duration: 500 },
      { id: "tool1", label: "Gmail API", icon: Mail, description: "Fetched 47 unread messages", timing: "+1.5s", duration: 800 },
      { id: "tool2", label: "NLP Classifier", icon: Sparkles, description: "8 urgent, 12 follow-up, 19 FYI, 8 spam", timing: "+2.3s", duration: 700 },
      { id: "synthesize", label: "Synthesize", icon: Zap, description: "Drafting 8 replies, applying labels", timing: "+3.0s", duration: 600 },
      { id: "output", label: "Output", icon: FileOutput, description: "8 drafts saved, 8 labels applied, 8 spam archived.", timing: "+3.6s", duration: 500 },
    ],
  },
  {
    label: "Review this PR",
    icon: Github,
    iconColor: "#8b5cf6",
    prompt: "Review PR #142 for bugs, style issues, and missing tests",
    stages: [
      { id: "input", label: "Input", icon: ArrowRight, description: "Received code review request", timing: "+0.0s", duration: 400 },
      { id: "parse", label: "Parse", icon: Search, description: "Intent: code_review", timing: "+0.4s", duration: 500 },
      { id: "plan", label: "Plan", icon: Cpu, description: "Strategy: fetch diff, analyze AST, scan tests", timing: "+0.9s", duration: 500 },
      { id: "tool1", label: "GitHub API", icon: Github, description: "PR #142: 14 files, +342 / -89", timing: "+1.4s", duration: 900 },
      { id: "tool2", label: "AST Analyzer", icon: Search, description: "2 null derefs, 3 naming issues", timing: "+2.3s", duration: 800 },
      { id: "synthesize", label: "Synthesize", icon: Zap, description: "Composing 6 inline comments", timing: "+3.1s", duration: 600 },
      { id: "output", label: "Output", icon: FileOutput, description: "Review posted: 2 bugs, 3 style notes, 1 test gap.", timing: "+3.7s", duration: 500 },
    ],
  },
  {
    label: "Summarize Slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    prompt: "Summarize #engineering and #product channels from the last 24h",
    stages: [
      { id: "input", label: "Input", icon: ArrowRight, description: "Received digest request", timing: "+0.0s", duration: 400 },
      { id: "parse", label: "Parse", icon: Search, description: "Intent: channel_digest", timing: "+0.4s", duration: 500 },
      { id: "plan", label: "Plan", icon: Cpu, description: "Strategy: fetch channels, summarize", timing: "+0.9s", duration: 500 },
      { id: "tool1", label: "Slack API", icon: MessageSquare, description: "210 messages, 23 threads from 2 channels", timing: "+1.4s", duration: 800 },
      { id: "tool2", label: "Summarizer", icon: Sparkles, description: "3 key decisions, 2 action items", timing: "+2.2s", duration: 700 },
      { id: "synthesize", label: "Synthesize", icon: Zap, description: "Formatting digest with action items", timing: "+2.9s", duration: 600 },
      { id: "output", label: "Output", icon: FileOutput, description: "Digest posted to #my-digest with action items.", timing: "+3.5s", duration: 500 },
    ],
  },
  {
    label: "Optimize my schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    prompt: "Analyze next week's calendar and block focus time",
    stages: [
      { id: "input", label: "Input", icon: ArrowRight, description: "Received schedule optimization request", timing: "+0.0s", duration: 400 },
      { id: "parse", label: "Parse", icon: Search, description: "Intent: schedule_optimize", timing: "+0.4s", duration: 500 },
      { id: "plan", label: "Plan", icon: Cpu, description: "Strategy: load calendar, find gaps, block time", timing: "+0.9s", duration: 500 },
      { id: "tool1", label: "Calendar API", icon: Calendar, description: "20h meetings across 5 days loaded", timing: "+1.4s", duration: 800 },
      { id: "tool2", label: "Schedule Analyzer", icon: Wrench, description: "Mon & Wed exceed 4h threshold", timing: "+2.2s", duration: 700 },
      { id: "synthesize", label: "Synthesize", icon: Zap, description: "Creating 3 focus time blocks", timing: "+2.9s", duration: 600 },
      { id: "output", label: "Output", icon: FileOutput, description: "3 focus blocks added (6h total). Conflicts: 0.", timing: "+3.5s", duration: 500 },
    ],
  },
];
