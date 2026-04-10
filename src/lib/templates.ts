import {
  Mail, MessageSquare, HardDrive, SquareKanban,
  BookOpen, CreditCard, Calendar,
  DollarSign, Receipt,
  TrendingUp, Target, Users,
  Headphones, LifeBuoy, MessageCircle,
  Search, Telescope,
  Megaphone, BarChart, Share2,
  Scale, FileCheck, Shield,
  Lock, Eye, AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { Github, Figma } from "@/components/icons/brand-icons";

export type Category = "DevOps" | "Communication" | "Productivity" | "Finance" | "Sales" | "Support" | "Research" | "Marketing" | "Legal" | "Security";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface AgentTemplate {
  id: string;
  title: string;
  description: string;
  tool: string;
  toolIcon: LucideIcon;
  toolColor: string;
  category: Category;
  difficulty: Difficulty;
  config: string;
  serviceFlow: string[];
  triggers: string[];
  complexity: "basic" | "professional" | "enterprise";
  designHighlights: string[];
}

export const categories: Category[] = ["DevOps", "Communication", "Productivity", "Finance", "Sales", "Support", "Research", "Marketing", "Legal", "Security"];
export const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export const templates: AgentTemplate[] = [
  // ─── Gmail ──────────────────────────────────────────────────────────
  {
    id: "gmail-inbox-triage",
    title: "Inbox Triage",
    description: "Auto-label, prioritize, and draft replies for inbound emails based on sender and content.",
    tool: "Gmail",
    toolIcon: Mail,
    toolColor: "#ea4335",
    category: "Communication",
    difficulty: "Beginner",
    config: `name: inbox-triage
tool: gmail
trigger: on_new_email
steps:
  - classify:
      labels: [urgent, follow-up, fyi, spam]
      model: sentiment + sender_history
  - prioritize:
      sort_by: urgency_score
  - draft_reply:
      tone: professional
      max_length: 150`,
    serviceFlow: ["Gmail"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Smart labeling", "Priority scoring", "Auto-draft replies"],
  },
  {
    id: "gmail-follow-up",
    title: "Follow-up Reminders",
    description: "Detect unanswered threads and send gentle follow-ups after configurable delays.",
    tool: "Gmail",
    toolIcon: Mail,
    toolColor: "#ea4335",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: follow-up-reminders
tool: gmail
trigger: cron("0 9 * * *")
steps:
  - scan_threads:
      status: awaiting_reply
      older_than: 48h
  - compose_follow_up:
      tone: friendly
      include_context: true
  - send:
      delay: 30m
      deduplicate: true`,
    serviceFlow: ["Gmail"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Thread scanning", "Configurable delays", "Deduplication"],
  },
  {
    id: "gmail-meeting-prep",
    title: "Meeting Prep",
    description: "Scan upcoming calendar invites, pull relevant email threads, and summarize context.",
    tool: "Gmail",
    toolIcon: Mail,
    toolColor: "#ea4335",
    category: "Productivity",
    difficulty: "Advanced",
    config: `name: meeting-prep
tools: [gmail, calendar]
trigger: 30m_before_meeting
steps:
  - fetch_attendees:
      source: calendar_event
  - search_threads:
      participants: attendees
      window: 14d
  - summarize:
      format: bullet_points
      max_items: 10
  - deliver:
      channel: email | slack`,
    serviceFlow: ["Gmail"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Attendee context", "Thread summarization", "Multi-channel delivery"],
  },
  // ─── Slack ──────────────────────────────────────────────────────────
  {
    id: "slack-channel-summarizer",
    title: "Channel Summarizer",
    description: "Digest long channels into actionable summaries delivered to you every morning.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "Communication",
    difficulty: "Beginner",
    config: `name: channel-summarizer
tool: slack
trigger: cron("0 8 * * 1-5")
steps:
  - fetch_messages:
      channels: [general, engineering]
      window: 24h
  - summarize:
      style: action_items
      group_by: topic
  - post:
      channel: "#my-digest"`,
    serviceFlow: ["Slack"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Multi-channel digest", "Action item extraction", "Scheduled delivery"],
  },
  {
    id: "slack-standup-collector",
    title: "Standup Collector",
    description: "DM each team member for status updates, compile into a single standup post.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: standup-collector
tool: slack
trigger: cron("0 9 * * 1-5")
steps:
  - dm_team:
      prompt: "What did you work on? Any blockers?"
      timeout: 2h
  - compile:
      format: table
      columns: [member, yesterday, today, blockers]
  - post:
      channel: "#standups"`,
    serviceFlow: ["Slack"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Team DM collection", "Table compilation", "Blocker tracking"],
  },
  {
    id: "slack-alert-router",
    title: "Alert Router",
    description: "Triage incoming alerts from monitoring tools and escalate to the right channel.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: alert-router
tool: slack
trigger: on_message("#alerts")
steps:
  - classify:
      severity: [p0, p1, p2, p3]
      service: auto_detect
  - route:
      p0: "#incidents" + page_oncall
      p1: "#engineering"
      p2: "#monitoring"
  - acknowledge:
      react: true`,
    serviceFlow: ["Slack"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Severity classification", "Smart routing", "On-call paging"],
  },
  // ─── GitHub ─────────────────────────────────────────────────────────
  {
    id: "github-pr-reviewer",
    title: "PR Reviewer",
    description: "Analyze pull requests for bugs, style issues, and missing tests - post inline comments.",
    tool: "GitHub",
    toolIcon: Github,
    toolColor: "#8b5cf6",
    category: "DevOps",
    difficulty: "Intermediate",
    config: `name: pr-reviewer
tool: github
trigger: on_pull_request
steps:
  - analyze_diff:
      checks: [bugs, style, test_coverage]
  - post_comments:
      style: inline
      severity_threshold: warning
  - summary:
      post_as: review_comment`,
    serviceFlow: ["GitHub"],
    triggers: ["webhook"],
    complexity: "basic",
    designHighlights: ["Inline code comments", "Bug detection", "Test coverage check"],
  },
  {
    id: "github-issue-groomer",
    title: "Issue Groomer",
    description: "Auto-label stale issues, request more info, and suggest duplicates.",
    tool: "GitHub",
    toolIcon: Github,
    toolColor: "#8b5cf6",
    category: "DevOps",
    difficulty: "Beginner",
    config: `name: issue-groomer
tool: github
trigger: cron("0 6 * * *")
steps:
  - scan_issues:
      stale_after: 14d
  - auto_label:
      categories: [bug, feature, question]
  - request_info:
      if: missing_reproduction
  - detect_duplicates:
      similarity: 0.85`,
    serviceFlow: ["GitHub"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Stale detection", "Auto-labeling", "Duplicate finder"],
  },
  {
    id: "github-release-notes",
    title: "Release Notes",
    description: "Generate changelog entries from merged PRs grouped by category and impact.",
    tool: "GitHub",
    toolIcon: Github,
    toolColor: "#8b5cf6",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: release-notes
tool: github
trigger: on_tag_push
steps:
  - collect_prs:
      since: last_release
      merged_only: true
  - categorize:
      groups: [features, fixes, breaking, docs]
  - generate:
      format: markdown
      include: [title, author, pr_link]
  - publish:
      target: github_release`,
    serviceFlow: ["GitHub"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["PR categorization", "Markdown generation", "Auto-publish"],
  },
  // ─── Google Drive ───────────────────────────────────────────────────
  {
    id: "drive-doc-organizer",
    title: "Doc Organizer",
    description: "Auto-file documents into folders based on content, project tags, and ownership.",
    tool: "Google Drive",
    toolIcon: HardDrive,
    toolColor: "#34a853",
    category: "Productivity",
    difficulty: "Beginner",
    config: `name: doc-organizer
tool: google_drive
trigger: on_file_create
steps:
  - analyze_content:
      extract: [project, department, type]
  - move_to_folder:
      structure: "/{department}/{project}"
      create_if_missing: true
  - tag:
      apply: extracted_tags`,
    serviceFlow: ["Google Drive"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Content analysis", "Auto-filing", "Tag extraction"],
  },
  {
    id: "drive-permissions-auditor",
    title: "Permissions Auditor",
    description: "Weekly scan of shared files - flag over-shared docs and external access.",
    tool: "Google Drive",
    toolIcon: HardDrive,
    toolColor: "#34a853",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: permissions-auditor
tool: google_drive
trigger: cron("0 7 * * 1")
steps:
  - scan_permissions:
      scope: entire_drive
  - flag:
      rules:
        - external_access: warn
        - anyone_with_link: alert
        - stale_shares: > 90d
  - report:
      deliver: email
      format: summary_table`,
    serviceFlow: ["Google Drive"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Permission scanning", "External access flags", "Summary reports"],
  },
  {
    id: "drive-content-indexer",
    title: "Content Indexer",
    description: "Build a searchable knowledge base from scattered Drive documents.",
    tool: "Google Drive",
    toolIcon: HardDrive,
    toolColor: "#34a853",
    category: "Productivity",
    difficulty: "Intermediate",
    config: `name: content-indexer
tool: google_drive
trigger: cron("0 2 * * *")
steps:
  - crawl:
      file_types: [docs, sheets, slides]
  - extract_text:
      include_comments: true
  - index:
      engine: vector_search
      chunk_size: 500
  - publish:
      endpoint: /api/knowledge`,
    serviceFlow: ["Google Drive"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Full-text crawl", "Vector search indexing", "Knowledge API"],
  },
  // ─── Jira ───────────────────────────────────────────────────────────
  {
    id: "jira-sprint-planner",
    title: "Sprint Planner",
    description: "Analyze velocity history and suggest optimal story point allocation for next sprint.",
    tool: "Jira",
    toolIcon: SquareKanban,
    toolColor: "#0052cc",
    category: "Productivity",
    difficulty: "Intermediate",
    config: `name: sprint-planner
tool: jira
trigger: manual | pre_sprint
steps:
  - analyze_velocity:
      sprints: last_5
  - rank_backlog:
      by: [priority, dependencies, size]
  - suggest_allocation:
      capacity: team_availability
      buffer: 15%
  - present:
      format: sprint_board_view`,
    serviceFlow: ["Jira"],
    triggers: ["manual"],
    complexity: "basic",
    designHighlights: ["Velocity analysis", "Backlog ranking", "Capacity planning"],
  },
  {
    id: "jira-blocker-detector",
    title: "Blocker Detector",
    description: "Monitor ticket dependencies and alert when a critical path item is stuck.",
    tool: "Jira",
    toolIcon: SquareKanban,
    toolColor: "#0052cc",
    category: "DevOps",
    difficulty: "Beginner",
    config: `name: blocker-detector
tool: jira
trigger: cron("*/30 * * * *")
steps:
  - scan_tickets:
      status: in_progress
      stale_after: 2d
  - check_dependencies:
      depth: 3
  - alert:
      if: blocking_critical_path
      channel: slack`,
    serviceFlow: ["Jira"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Dependency scanning", "Critical path detection", "Slack alerts"],
  },
  {
    id: "jira-status-syncer",
    title: "Status Syncer",
    description: "Keep Jira tickets in sync with GitHub PRs - auto-transition on merge.",
    tool: "Jira",
    toolIcon: SquareKanban,
    toolColor: "#0052cc",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: status-syncer
tools: [jira, github]
trigger: on_pr_merge
steps:
  - extract_ticket:
      from: pr_title | branch_name
      pattern: "[A-Z]+-\\d+"
  - transition:
      to: done
      add_comment: "Merged in PR #{pr_number}"
  - update_fix_version:
      version: next_release`,
    serviceFlow: ["Jira"],
    triggers: ["webhook"],
    complexity: "basic",
    designHighlights: ["PR-to-ticket sync", "Auto-transition", "Fix version tracking"],
  },
  // ─── Notion ─────────────────────────────────────────────────────────
  {
    id: "notion-meeting-notes",
    title: "Meeting Notes",
    description: "Transcribe recordings, extract action items, and create linked Notion pages.",
    tool: "Notion",
    toolIcon: BookOpen,
    toolColor: "#e6e6e6",
    category: "Productivity",
    difficulty: "Intermediate",
    config: `name: meeting-notes
tools: [notion, calendar]
trigger: on_meeting_end
steps:
  - transcribe:
      source: recording_url
  - extract:
      items: [decisions, action_items, questions]
  - create_page:
      parent: "Meetings/{date}"
      template: meeting_notes
  - assign_actions:
      notify: slack`,
    serviceFlow: ["Notion"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Transcription", "Action item extraction", "Linked pages"],
  },
  {
    id: "notion-wiki-gardener",
    title: "Wiki Gardener",
    description: "Find outdated docs, suggest updates, and archive pages with no recent views.",
    tool: "Notion",
    toolIcon: BookOpen,
    toolColor: "#e6e6e6",
    category: "Productivity",
    difficulty: "Beginner",
    config: `name: wiki-gardener
tool: notion
trigger: cron("0 6 * * 1")
steps:
  - scan_pages:
      workspace: all
  - flag_outdated:
      not_edited_in: 90d
      no_views_in: 60d
  - suggest_updates:
      notify: page_owner
  - archive:
      if: confirmed_stale`,
    serviceFlow: ["Notion"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Staleness detection", "Owner notifications", "Auto-archival"],
  },
  {
    id: "notion-template-filler",
    title: "Template Filler",
    description: "Auto-populate project brief templates from intake form responses.",
    tool: "Notion",
    toolIcon: BookOpen,
    toolColor: "#e6e6e6",
    category: "Productivity",
    difficulty: "Advanced",
    config: `name: template-filler
tool: notion
trigger: on_form_submit
steps:
  - parse_response:
      fields: [project_name, goals, timeline, stakeholders]
  - duplicate_template:
      source: "Templates/Project Brief"
  - populate:
      map_fields: auto
  - notify:
      stakeholders: email + slack`,
    serviceFlow: ["Notion"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Form parsing", "Template duplication", "Stakeholder notifications"],
  },
  // ─── Stripe ─────────────────────────────────────────────────────────
  {
    id: "stripe-failed-payment",
    title: "Failed Payment Recovery",
    description: "Email customers with failed charges - offer retry links and alternative methods.",
    tool: "Stripe",
    toolIcon: CreditCard,
    toolColor: "#635bff",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: failed-payment-recovery
tool: stripe
trigger: on_payment_failed
steps:
  - identify_customer:
      include: [email, name, plan]
  - compose_email:
      template: payment_failed
      include_retry_link: true
  - schedule_retries:
      attempts: [1d, 3d, 7d]
  - escalate:
      if: all_retries_failed
      action: notify_support`,
    serviceFlow: ["Stripe"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Retry scheduling", "Customer communication", "Escalation flow"],
  },
  {
    id: "stripe-revenue-alerting",
    title: "Revenue Alerting",
    description: "Monitor MRR changes and notify Slack when churn spikes or upgrades surge.",
    tool: "Stripe",
    toolIcon: CreditCard,
    toolColor: "#635bff",
    category: "DevOps",
    difficulty: "Beginner",
    config: `name: revenue-alerting
tool: stripe
trigger: cron("0 8 * * *")
steps:
  - calculate_mrr:
      compare: previous_day
  - detect_anomalies:
      churn_threshold: 5%
      growth_threshold: 10%
  - notify:
      channel: "#revenue"
      include_chart: true`,
    serviceFlow: ["Stripe"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["MRR tracking", "Anomaly detection", "Chart notifications"],
  },
  {
    id: "stripe-invoice-reconciler",
    title: "Invoice Reconciler",
    description: "Match Stripe payouts against your accounting system and flag discrepancies.",
    tool: "Stripe",
    toolIcon: CreditCard,
    toolColor: "#635bff",
    category: "Productivity",
    difficulty: "Advanced",
    config: `name: invoice-reconciler
tools: [stripe, accounting]
trigger: on_payout
steps:
  - fetch_payout:
      include: [charges, refunds, fees]
  - match_records:
      source: accounting_system
      match_by: invoice_id
  - flag_discrepancies:
      tolerance: $0.01
  - report:
      deliver: email
      cc: finance_team`,
    serviceFlow: ["Stripe"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Payout matching", "Discrepancy flagging", "Finance reports"],
  },
  // ─── Calendar ───────────────────────────────────────────────────────
  {
    id: "calendar-schedule-optimizer",
    title: "Schedule Optimizer",
    description: "Detect meeting-heavy days and suggest blocks for focus time automatically.",
    tool: "Calendar",
    toolIcon: Calendar,
    toolColor: "#06b6d4",
    category: "Productivity",
    difficulty: "Beginner",
    config: `name: schedule-optimizer
tool: calendar
trigger: cron("0 18 * * 0")
steps:
  - analyze_week:
      look_ahead: 7d
  - detect_heavy_days:
      threshold: 4h_meetings
  - suggest_focus_blocks:
      duration: 2h
      preferred: morning
  - auto_block:
      if: approved`,
    serviceFlow: ["Calendar"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Meeting-load detection", "Focus block suggestions", "Auto-blocking"],
  },
  {
    id: "calendar-noshow-handler",
    title: "No-Show Handler",
    description: "Track attendees who miss meetings and send rescheduling links.",
    tool: "Calendar",
    toolIcon: Calendar,
    toolColor: "#06b6d4",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: noshow-handler
tool: calendar
trigger: on_meeting_end
steps:
  - check_attendance:
      source: meeting_platform
  - identify_noshows:
      exclude: [declined, tentative]
  - send_reschedule:
      template: missed_meeting
      include_link: calendly
  - log:
      store: attendance_history`,
    serviceFlow: ["Calendar"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Attendance tracking", "Auto-reschedule links", "History logging"],
  },
  {
    id: "calendar-timezone-coordinator",
    title: "Timezone Coordinator",
    description: "Find optimal meeting slots across global teams with minimal late-night asks.",
    tool: "Calendar",
    toolIcon: Calendar,
    toolColor: "#06b6d4",
    category: "Productivity",
    difficulty: "Advanced",
    config: `name: timezone-coordinator
tool: calendar
trigger: manual
steps:
  - collect_timezones:
      from: attendee_list
  - find_overlaps:
      working_hours: 9am-6pm
      avoid: lunch_hours
  - rank_slots:
      minimize: late_night_count
  - propose:
      top_n: 3
      include_poll: true`,
    serviceFlow: ["Calendar"],
    triggers: ["manual"],
    complexity: "basic",
    designHighlights: ["Global timezone handling", "Overlap detection", "Slot ranking"],
  },
  // ─── Figma ──────────────────────────────────────────────────────────
  {
    id: "figma-design-handoff",
    title: "Design Handoff",
    description: "Extract component specs, tokens, and assets - post to the dev channel.",
    tool: "Figma",
    toolIcon: Figma,
    toolColor: "#f24e1e",
    category: "DevOps",
    difficulty: "Intermediate",
    config: `name: design-handoff
tool: figma
trigger: on_page_publish
steps:
  - extract_specs:
      include: [colors, spacing, typography, components]
  - export_assets:
      formats: [svg, png@2x]
  - generate_tokens:
      format: css_variables
  - post:
      channel: "#dev-design"
      include_preview: true`,
    serviceFlow: ["Figma"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Spec extraction", "Asset export", "Token generation"],
  },
  {
    id: "figma-comment-tracker",
    title: "Comment Tracker",
    description: "Aggregate unresolved Figma comments and create follow-up tasks.",
    tool: "Figma",
    toolIcon: Figma,
    toolColor: "#f24e1e",
    category: "Communication",
    difficulty: "Beginner",
    config: `name: comment-tracker
tool: figma
trigger: cron("0 9 * * 1-5")
steps:
  - fetch_comments:
      status: unresolved
  - group_by:
      field: assignee
  - create_tasks:
      target: jira | notion
  - notify:
      channel: slack_dm`,
    serviceFlow: ["Figma"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Comment aggregation", "Task creation", "Assignee grouping"],
  },
  {
    id: "figma-version-differ",
    title: "Version Differ",
    description: "Compare file versions and summarize visual changes for stakeholder review.",
    tool: "Figma",
    toolIcon: Figma,
    toolColor: "#f24e1e",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: version-differ
tool: figma
trigger: on_version_save
steps:
  - capture_screenshots:
      pages: changed_only
  - diff:
      method: pixel + layer
      highlight: true
  - summarize:
      include: [added, removed, modified]
  - share:
      stakeholders: file_collaborators
      format: visual_report`,
    serviceFlow: ["Figma"],
    triggers: ["event"],
    complexity: "basic",
    designHighlights: ["Visual diffing", "Change summarization", "Stakeholder reports"],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NEW TEMPLATES (30)
  // ═══════════════════════════════════════════════════════════════════

  // ─── Communication (3 new) ──────────────────────────────────────────
  {
    id: "comms-cross-platform-notifier",
    title: "Cross-Platform Notifier",
    description: "Routes critical notifications across email, Slack, and SMS based on urgency and recipient preferences.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: cross-platform-notifier
model: gpt-4o
tools: [slack, gmail]
trigger:
  type: webhook
  source: internal_api
system: |
  Route notifications to the right channel based
  on urgency and recipient preferences.
  Deduplicate across platforms.
steps:
  - classify_urgency:
      levels: [critical, high, normal, low]
  - resolve_preferences:
      source: user_settings
      fallback: slack
  - deliver:
      critical: [slack_dm, email, sms]
      high: [slack_dm, email]
      normal: [slack_channel]
  - track:
      log: delivery_receipt`,
    serviceFlow: ["Slack", "Gmail"],
    triggers: ["webhook"],
    complexity: "professional",
    designHighlights: ["Multi-channel routing", "Preference-based delivery", "Deduplication"],
  },
  {
    id: "comms-meeting-recap-broadcaster",
    title: "Meeting Recap Broadcaster",
    description: "Generates and distributes meeting summaries to all stakeholders who couldn't attend.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "Communication",
    difficulty: "Advanced",
    config: `name: meeting-recap-broadcaster
model: gpt-4o
tools: [slack, gmail, notion]
trigger:
  type: event
  source: calendar
  event: meeting.ended
system: |
  After meetings end, generate a structured recap
  with decisions, action items, and key discussion
  points. Distribute to absentees and stakeholders.
steps:
  - gather_notes:
      sources: [transcript, chat_log, shared_docs]
  - generate_recap:
      sections: [decisions, action_items, discussion, next_steps]
  - distribute:
      attendees: slack_thread
      absentees: email
      archive: notion
  - track_actions:
      assign: mentioned_owners
      due: extracted_dates`,
    serviceFlow: ["Slack", "Gmail", "Notion"],
    triggers: ["event"],
    complexity: "enterprise",
    designHighlights: ["Auto-summarization", "Multi-channel distribution", "Action tracking"],
  },
  {
    id: "comms-feedback-aggregator",
    title: "Feedback Aggregator",
    description: "Collects feedback from multiple channels and compiles themed digests for product teams.",
    tool: "Slack",
    toolIcon: MessageSquare,
    toolColor: "#4a154b",
    category: "Communication",
    difficulty: "Intermediate",
    config: `name: feedback-aggregator
model: gpt-4o
tools: [slack, notion]
trigger:
  type: schedule
  cron: "0 9 * * 1"
system: |
  Aggregate user feedback from Slack channels,
  support threads, and form submissions.
  Cluster by theme and deliver weekly digest.
steps:
  - collect:
      channels: ["#feedback", "#support", "#ideas"]
      window: 7d
  - cluster:
      method: semantic_similarity
      min_group: 2
  - summarize:
      per_theme: [count, sentiment, top_quotes]
  - deliver:
      digest: notion
      alert: "#product-feedback"`,
    serviceFlow: ["Slack", "Notion"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Multi-channel collection", "Theme clustering", "Sentiment analysis"],
  },

  // ─── Productivity (3 new) ──────────────────────────────────────────
  {
    id: "productivity-daily-planner",
    title: "Daily Planner Agent",
    description: "Synthesizes calendar, tasks, and email into a prioritized daily action plan each morning.",
    tool: "Calendar",
    toolIcon: Calendar,
    toolColor: "#06b6d4",
    category: "Productivity",
    difficulty: "Intermediate",
    config: `name: daily-planner
model: gpt-4o
tools: [calendar, gmail, jira]
trigger:
  type: schedule
  cron: "0 7 * * 1-5"
system: |
  Morning briefing agent. Pull today's meetings,
  pending emails, and open tasks. Generate a
  prioritized action plan for the day.
steps:
  - fetch_calendar:
      window: today
  - scan_inbox:
      unread: true
      flagged: true
  - pull_tasks:
      source: jira
      assigned_to: me
      status: in_progress
  - generate_plan:
      prioritize_by: [deadline, impact, energy]
      deliver: slack_dm`,
    serviceFlow: ["Calendar", "Gmail", "Jira"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Multi-source synthesis", "Priority ranking", "Morning briefings"],
  },
  {
    id: "productivity-doc-template-generator",
    title: "Doc Template Generator",
    description: "Creates structured document templates from project requirements and past successful docs.",
    tool: "Notion",
    toolIcon: BookOpen,
    toolColor: "#e6e6e6",
    category: "Productivity",
    difficulty: "Advanced",
    config: `name: doc-template-generator
model: gpt-4o
tools: [notion, google_drive, slack]
trigger:
  type: manual
  also: on_project_kickoff
system: |
  Generate custom document templates based on
  project type, team preferences, and successful
  past documents. Seed with relevant context.
steps:
  - analyze_request:
      fields: [project_type, team, deliverables]
  - find_precedents:
      source: [notion, google_drive]
      similarity: 0.7
  - generate_template:
      sections: auto_from_precedents
      include: [placeholders, instructions, examples]
  - deliver:
      target: notion
      notify: "#project-ops"`,
    serviceFlow: ["Notion", "Google Drive", "Slack"],
    triggers: ["manual", "event"],
    complexity: "enterprise",
    designHighlights: ["Precedent analysis", "Smart section generation", "Context seeding"],
  },
  {
    id: "productivity-weekly-report-compiler",
    title: "Weekly Report Compiler",
    description: "Aggregates team activity across tools and generates a structured weekly status report.",
    tool: "Google Sheets",
    toolIcon: HardDrive,
    toolColor: "#34a853",
    category: "Productivity",
    difficulty: "Intermediate",
    config: `name: weekly-report-compiler
model: gpt-4o
tools: [google_sheets, jira, slack]
trigger:
  type: schedule
  cron: "0 16 * * 5"
system: |
  Friday afternoon report generation. Aggregate
  completed work, blockers, and metrics from
  Jira and Slack into a formatted weekly report.
steps:
  - fetch_completed:
      source: jira
      period: this_week
      group_by: team_member
  - pull_metrics:
      source: google_sheets
      sheet: "Team KPIs"
  - compile_report:
      sections: [accomplishments, blockers, next_week, metrics]
      format: structured_markdown
  - distribute:
      channel: "#team-updates"
      email: stakeholders`,
    serviceFlow: ["Google Sheets", "Jira", "Slack"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Cross-tool aggregation", "Auto-formatted reports", "Stakeholder distribution"],
  },

  // ─── Finance ────────────────────────────────────────────────────────
  {
    id: "finance-revenue-alert-monitor",
    title: "Revenue Alert Monitor",
    description: "Monitors Stripe for revenue anomalies, sends alerts to Slack.",
    tool: "Stripe",
    toolIcon: DollarSign,
    toolColor: "#16a34a",
    category: "Finance",
    difficulty: "Intermediate",
    config: `name: revenue-alert-monitor
model: gpt-4o
tools: [stripe, slack]
trigger:
  type: schedule
  cron: "0 */4 * * *"
system: |
  Monitor Stripe revenue metrics every 4 hours.
  Detect anomalies against 30-day rolling average.
  Alert Slack #finance channel on threshold breach.
steps:
  - fetch_revenue:
      source: stripe
      window: 4h
  - compare_baseline:
      method: rolling_average_30d
      threshold: 15%
  - alert:
      channel: "#finance"
      include: [delta, trend_chart, top_transactions]`,
    serviceFlow: ["Stripe", "Slack"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Real-time anomaly detection", "Threshold-based alerts", "Daily revenue summaries"],
  },
  {
    id: "finance-invoice-reconciler",
    title: "Invoice Reconciler",
    description: "Matches invoices against bank statements, flags discrepancies.",
    tool: "Stripe",
    toolIcon: Receipt,
    toolColor: "#16a34a",
    category: "Finance",
    difficulty: "Intermediate",
    config: `name: invoice-reconciler
model: gpt-4o
tools: [stripe, google_sheets]
trigger:
  type: schedule
  cron: "0 6 * * 1"
system: |
  Weekly reconciliation of Stripe invoices against
  bank statement data in Google Sheets.
  Flag any unmatched or mismatched amounts.
steps:
  - fetch_invoices:
      source: stripe
      period: last_7d
  - load_statements:
      source: google_sheets
      sheet: "Bank Reconciliation"
  - match:
      by: [amount, date, reference]
      tolerance: $0.50
  - report:
      output: google_sheets
      flag_discrepancies: true`,
    serviceFlow: ["Stripe", "Google Sheets"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Automated matching", "Discrepancy reports", "Monthly reconciliation"],
  },
  {
    id: "finance-expense-categorizer",
    title: "Expense Categorizer",
    description: "Auto-categorizes team expenses from receipts.",
    tool: "Gmail",
    toolIcon: CreditCard,
    toolColor: "#16a34a",
    category: "Finance",
    difficulty: "Advanced",
    config: `name: expense-categorizer
model: gpt-4o
tools: [gmail, google_sheets, slack]
trigger:
  type: event
  source: gmail
  filter: "subject:receipt OR subject:expense"
system: |
  Process incoming expense receipts from email.
  Extract vendor, amount, date, and category via OCR.
  Log to expense tracking sheet and notify finance.
steps:
  - extract_receipt:
      method: ocr + llm
      fields: [vendor, amount, date, category]
  - categorize:
      taxonomy: [travel, meals, software, office, other]
  - log:
      target: google_sheets
      sheet: "Team Expenses"
  - notify:
      channel: "#finance"
      if: amount > 500`,
    serviceFlow: ["Gmail", "Google Sheets", "Slack"],
    triggers: ["event"],
    complexity: "enterprise",
    designHighlights: ["OCR receipt scanning", "Auto-categorization", "Budget tracking"],
  },

  // ─── Sales ──────────────────────────────────────────────────────────
  {
    id: "sales-lead-scorer",
    title: "Lead Scorer",
    description: "Scores inbound leads based on engagement and fit criteria.",
    tool: "HubSpot",
    toolIcon: Target,
    toolColor: "#f97316",
    category: "Sales",
    difficulty: "Intermediate",
    config: `name: lead-scorer
model: gpt-4o
tools: [hubspot, slack]
trigger:
  type: webhook
  source: hubspot
  event: contact.creation
system: |
  Score new leads on a 0-100 scale using company size,
  industry fit, engagement signals, and website activity.
  Auto-prioritize and sync score back to CRM.
steps:
  - enrich_lead:
      fields: [company_size, industry, job_title]
  - score:
      signals: [page_views, email_opens, form_fills]
      weights: {fit: 0.4, engagement: 0.4, timing: 0.2}
  - update_crm:
      field: lead_score
  - notify:
      channel: "#sales-leads"
      if: score > 70`,
    serviceFlow: ["HubSpot", "Slack"],
    triggers: ["webhook"],
    complexity: "professional",
    designHighlights: ["Multi-signal scoring", "Auto-prioritization", "CRM sync"],
  },
  {
    id: "sales-pipeline-monitor",
    title: "Pipeline Monitor",
    description: "Tracks deal stage progression and alerts on stalled deals.",
    tool: "HubSpot",
    toolIcon: TrendingUp,
    toolColor: "#f97316",
    category: "Sales",
    difficulty: "Advanced",
    config: `name: pipeline-monitor
model: gpt-4o
tools: [hubspot, slack, gmail]
trigger:
  type: schedule
  cron: "0 8 * * 1-5"
system: |
  Daily pipeline health check. Track deal velocity
  through stages, detect stalls, and escalate
  at-risk deals to managers via email.
steps:
  - scan_pipeline:
      stages: all
      stale_threshold: 7d
  - calculate_velocity:
      per_stage: true
      compare: team_average
  - detect_stalls:
      criteria: [no_activity_7d, past_close_date]
  - escalate:
      stalled_deals: manager_email
      summary: "#sales-pipeline"`,
    serviceFlow: ["HubSpot", "Slack", "Gmail"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Stage velocity tracking", "Stall detection", "Manager escalation"],
  },
  {
    id: "sales-outreach-sequencer",
    title: "Outreach Sequencer",
    description: "Manages multi-step email sequences for prospects.",
    tool: "Gmail",
    toolIcon: Users,
    toolColor: "#f97316",
    category: "Sales",
    difficulty: "Intermediate",
    config: `name: outreach-sequencer
model: gpt-4o
tools: [gmail, hubspot]
trigger:
  type: schedule
  cron: "0 9 * * 1-5"
  also: on_reply_detected
system: |
  Execute personalized multi-step outreach sequences.
  Pause on reply, adjust tone based on engagement,
  and log all activity back to HubSpot.
steps:
  - check_sequences:
      active: true
      due_today: true
  - personalize:
      fields: [name, company, pain_point]
      tone: consultative
  - send_or_skip:
      skip_if: replied | meeting_booked
  - log_activity:
      target: hubspot`,
    serviceFlow: ["Gmail", "HubSpot"],
    triggers: ["schedule", "event"],
    complexity: "professional",
    designHighlights: ["Personalized sequences", "Reply detection", "Auto follow-up"],
  },

  // ─── Support ────────────────────────────────────────────────────────
  {
    id: "support-ticket-classifier",
    title: "Ticket Classifier",
    description: "Auto-classifies and routes support tickets by urgency and topic.",
    tool: "Jira",
    toolIcon: Headphones,
    toolColor: "#06b6d4",
    category: "Support",
    difficulty: "Intermediate",
    config: `name: ticket-classifier
model: gpt-4o
tools: [jira, slack]
trigger:
  type: webhook
  source: jira
  event: issue.created
system: |
  Classify incoming support tickets by urgency (P0-P3)
  and topic (billing, bug, feature, account).
  Route to appropriate team queue in Jira.
steps:
  - analyze_ticket:
      fields: [summary, description, reporter]
  - classify:
      urgency: [P0, P1, P2, P3]
      topic: [billing, bug, feature, account, other]
      sentiment: true
  - route:
      assign_team: by_topic
      set_priority: by_urgency
  - notify:
      channel: "#support-triage"
      if: urgency <= P1`,
    serviceFlow: ["Jira", "Slack"],
    triggers: ["webhook"],
    complexity: "professional",
    designHighlights: ["Sentiment analysis", "Priority detection", "Smart routing"],
  },
  {
    id: "support-kb-updater",
    title: "Knowledge Base Updater",
    description: "Detects recurring questions and suggests KB article updates.",
    tool: "Jira",
    toolIcon: LifeBuoy,
    toolColor: "#06b6d4",
    category: "Support",
    difficulty: "Advanced",
    config: `name: kb-updater
model: gpt-4o
tools: [jira, notion, slack]
trigger:
  type: schedule
  cron: "0 7 * * 1"
system: |
  Weekly analysis of resolved support tickets.
  Identify recurring themes without KB coverage.
  Draft article suggestions in Notion.
steps:
  - fetch_resolved:
      period: last_7d
      status: done
  - cluster_topics:
      method: semantic_similarity
      min_cluster: 3
  - check_kb_coverage:
      source: notion
      database: "Knowledge Base"
  - draft_articles:
      for: uncovered_clusters
      notify: "#support-ops"`,
    serviceFlow: ["Jira", "Notion", "Slack"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Pattern recognition", "Auto-draft articles", "Gap analysis"],
  },
  {
    id: "support-sla-watchdog",
    title: "SLA Watchdog",
    description: "Monitors response times and escalates before SLA breaches.",
    tool: "Jira",
    toolIcon: MessageCircle,
    toolColor: "#06b6d4",
    category: "Support",
    difficulty: "Intermediate",
    config: `name: sla-watchdog
model: gpt-4o
tools: [jira, slack]
trigger:
  type: polling
  interval: 15m
system: |
  Continuously monitor open ticket response times.
  Warn at 75% SLA threshold, escalate at 90%.
  Generate daily SLA compliance reports.
steps:
  - scan_open_tickets:
      status: [open, in_progress]
  - check_sla:
      thresholds:
        warning: 75%
        critical: 90%
  - escalate:
      warning: "#support-alerts"
      critical: "@oncall-support + manager"
  - daily_report:
      metrics: [compliance_rate, avg_response, breaches]`,
    serviceFlow: ["Jira", "Slack"],
    triggers: ["polling"],
    complexity: "professional",
    designHighlights: ["Real-time SLA tracking", "Escalation alerts", "Performance reports"],
  },

  // ─── Research ───────────────────────────────────────────────────────
  {
    id: "research-competitive-intel",
    title: "Competitive Intel Scout",
    description: "Monitors competitor websites and news for changes.",
    tool: "Web Search",
    toolIcon: Search,
    toolColor: "#8b5cf6",
    category: "Research",
    difficulty: "Advanced",
    config: `name: competitive-intel-scout
model: gpt-4o
tools: [web_search, notion, slack]
trigger:
  type: schedule
  cron: "0 6 * * 1-5"
system: |
  Daily competitive intelligence scan.
  Monitor competitor websites, press releases,
  job postings, and product updates.
steps:
  - scan_competitors:
      sources: [website, news, job_boards, social]
      competitors: config.competitor_list
  - detect_changes:
      compare: previous_scan
      significance: medium+
  - summarize:
      format: intel_brief
      store: notion
  - alert:
      channel: "#competitive-intel"
      weekly_digest: friday`,
    serviceFlow: ["Web Search", "Notion", "Slack"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Automated monitoring", "Change detection", "Weekly digests"],
  },
  {
    id: "research-market-trend-analyzer",
    title: "Market Trend Analyzer",
    description: "Aggregates industry news and extracts actionable insights.",
    tool: "Web Search",
    toolIcon: BookOpen,
    toolColor: "#8b5cf6",
    category: "Research",
    difficulty: "Intermediate",
    config: `name: market-trend-analyzer
model: gpt-4o
tools: [web_search, notion]
trigger:
  type: schedule
  cron: "0 7 * * 1-5"
system: |
  Aggregate news from industry sources daily.
  Extract emerging trends, sentiment shifts,
  and actionable insights for the team.
steps:
  - aggregate_news:
      sources: [techcrunch, industry_rss, hacker_news]
      keywords: config.industry_keywords
  - extract_trends:
      method: topic_clustering
      window: 7d
  - generate_insights:
      format: bullet_points
      actionable: true
  - store:
      target: notion
      database: "Market Intelligence"`,
    serviceFlow: ["Web Search", "Notion"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Multi-source aggregation", "Trend extraction", "Insight summaries"],
  },
  {
    id: "research-patent-watcher",
    title: "Patent Watcher",
    description: "Tracks new patent filings in your technology domain.",
    tool: "Web Search",
    toolIcon: Telescope,
    toolColor: "#8b5cf6",
    category: "Research",
    difficulty: "Intermediate",
    config: `name: patent-watcher
model: gpt-4o
tools: [web_search, gmail]
trigger:
  type: schedule
  cron: "0 8 * * 1"
system: |
  Weekly patent filing monitor for specified
  technology domains. Track competitor filings
  and emerging IP trends.
steps:
  - search_patents:
      databases: [uspto, google_patents]
      domains: config.tech_domains
      period: last_7d
  - filter_relevant:
      similarity_threshold: 0.7
      exclude: own_company
  - summarize:
      per_patent: [title, assignee, abstract, relevance]
  - deliver:
      method: email
      to: config.ip_team`,
    serviceFlow: ["Web Search", "Gmail"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Domain-specific tracking", "Filing alerts", "Competitive landscape"],
  },

  // ─── Marketing ──────────────────────────────────────────────────────
  {
    id: "marketing-social-scheduler",
    title: "Social Media Scheduler",
    description: "Plans and schedules posts across platforms.",
    tool: "Notion",
    toolIcon: Megaphone,
    toolColor: "#ec4899",
    category: "Marketing",
    difficulty: "Beginner",
    config: `name: social-media-scheduler
model: gpt-4o
tools: [notion, slack]
trigger:
  type: schedule
  cron: "0 8 * * 1-5"
system: |
  Pull scheduled posts from Notion content calendar.
  Format for each platform and queue for publishing.
  Track engagement metrics after posting.
steps:
  - fetch_scheduled:
      source: notion
      database: "Content Calendar"
      filter: due_today
  - format_posts:
      platforms: [twitter, linkedin, instagram]
      adapt_length: true
  - queue_publish:
      optimal_times: per_platform
  - notify:
      channel: "#marketing"
      preview: true`,
    serviceFlow: ["Notion", "Slack"],
    triggers: ["schedule"],
    complexity: "basic",
    designHighlights: ["Cross-platform scheduling", "Content calendar sync", "Performance tracking"],
  },
  {
    id: "marketing-campaign-tracker",
    title: "Campaign Performance Tracker",
    description: "Aggregates campaign metrics and generates reports.",
    tool: "Google Sheets",
    toolIcon: BarChart,
    toolColor: "#ec4899",
    category: "Marketing",
    difficulty: "Intermediate",
    config: `name: campaign-performance-tracker
model: gpt-4o
tools: [google_sheets, slack]
trigger:
  type: schedule
  cron: "0 9 * * 1"
system: |
  Weekly campaign performance aggregation.
  Pull metrics from all active campaigns,
  calculate ROI, and generate team report.
steps:
  - fetch_metrics:
      source: google_sheets
      sheets: ["Ad Campaigns", "Email Campaigns"]
  - calculate:
      metrics: [impressions, clicks, conversions, spend]
      derive: [ctr, cpa, roas]
  - compare:
      against: previous_period
      highlight: anomalies
  - report:
      channel: "#marketing-metrics"
      format: chart + summary`,
    serviceFlow: ["Google Sheets", "Slack"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Multi-channel metrics", "ROI calculation", "Automated reports"],
  },
  {
    id: "marketing-content-distributor",
    title: "Content Distribution Agent",
    description: "Repurposes long-form content into platform-specific formats.",
    tool: "Notion",
    toolIcon: Share2,
    toolColor: "#ec4899",
    category: "Marketing",
    difficulty: "Advanced",
    config: `name: content-distribution-agent
model: gpt-4o
tools: [notion, slack, gmail]
trigger:
  type: manual
  also: on_page_publish
system: |
  Transform long-form content (blog posts, whitepapers)
  into platform-optimized formats: tweet threads,
  LinkedIn posts, email newsletters, social snippets.
steps:
  - fetch_content:
      source: notion
      type: [blog_post, whitepaper]
  - repurpose:
      formats:
        twitter: thread_5_tweets
        linkedin: professional_post
        email: newsletter_section
  - review:
      notify: "#content-review"
      require_approval: true
  - distribute:
      schedule: optimal_times
      track: engagement`,
    serviceFlow: ["Notion", "Slack", "Gmail"],
    triggers: ["manual", "event"],
    complexity: "enterprise",
    designHighlights: ["Multi-format adaptation", "Platform optimization", "Distribution tracking"],
  },

  // ─── Legal ──────────────────────────────────────────────────────────
  {
    id: "legal-contract-reviewer",
    title: "Contract Reviewer",
    description: "Scans contracts for risky clauses and missing terms.",
    tool: "Google Drive",
    toolIcon: Scale,
    toolColor: "#78716c",
    category: "Legal",
    difficulty: "Advanced",
    config: `name: contract-reviewer
model: gpt-4o
tools: [google_drive, slack]
trigger:
  type: event
  source: google_drive
  filter: folder:"Contracts/Incoming"
system: |
  Review uploaded contracts for risk factors.
  Check against standard clause library.
  Flag missing terms and unusual provisions.
steps:
  - extract_text:
      source: google_drive
      formats: [pdf, docx]
  - analyze_clauses:
      check: [liability, indemnity, termination, ip, non_compete]
      risk_score: per_clause
  - identify_missing:
      required: config.standard_terms
  - report:
      channel: "#legal-review"
      format: risk_summary
      attach: annotated_doc`,
    serviceFlow: ["Google Drive", "Slack"],
    triggers: ["event"],
    complexity: "enterprise",
    designHighlights: ["Clause risk scoring", "Missing term detection", "Summary generation"],
  },
  {
    id: "legal-compliance-monitor",
    title: "Compliance Monitor",
    description: "Tracks regulatory changes relevant to your industry.",
    tool: "Web Search",
    toolIcon: FileCheck,
    toolColor: "#78716c",
    category: "Legal",
    difficulty: "Advanced",
    config: `name: compliance-monitor
model: gpt-4o
tools: [web_search, notion, gmail]
trigger:
  type: schedule
  cron: "0 7 * * 1-5"
system: |
  Monitor regulatory bodies and legal databases
  for changes affecting your industry.
  Assess impact and generate action items.
steps:
  - scan_sources:
      regulators: config.regulatory_bodies
      databases: [federal_register, sec, gdpr_board]
  - filter_relevant:
      industries: config.industries
      keywords: config.compliance_keywords
  - assess_impact:
      score: [urgency, scope, effort]
  - deliver:
      action_items: notion
      summary: email
      alert: "#legal-compliance"`,
    serviceFlow: ["Web Search", "Notion", "Gmail"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Regulation tracking", "Impact assessment", "Action item generation"],
  },
  {
    id: "legal-nda-tracker",
    title: "NDA Tracker",
    description: "Manages NDA expiration dates and renewal reminders.",
    tool: "Google Drive",
    toolIcon: Shield,
    toolColor: "#78716c",
    category: "Legal",
    difficulty: "Intermediate",
    config: `name: nda-tracker
model: gpt-4o
tools: [google_drive, gmail, slack]
trigger:
  type: schedule
  cron: "0 8 * * 1"
system: |
  Weekly scan of NDA registry for upcoming expirations.
  Send renewal reminders 60/30/7 days before expiry.
  Track renewal status and archive expired agreements.
steps:
  - scan_ndas:
      source: google_drive
      folder: "Legal/NDAs"
  - check_expiry:
      windows: [60d, 30d, 7d]
  - send_reminders:
      method: email
      to: counterparty_contact
      cc: legal_team
  - update_status:
      notify: "#legal-ops"
      archive_if: expired`,
    serviceFlow: ["Google Drive", "Gmail", "Slack"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["Expiry tracking", "Renewal reminders", "Status dashboard"],
  },

  // ─── Security ───────────────────────────────────────────────────────
  {
    id: "security-vulnerability-scanner",
    title: "Vulnerability Scanner Agent",
    description: "Monitors CVE databases for dependencies in your stack.",
    tool: "GitHub",
    toolIcon: Lock,
    toolColor: "#dc2626",
    category: "Security",
    difficulty: "Intermediate",
    config: `name: vulnerability-scanner
model: gpt-4o
tools: [github, slack]
trigger:
  type: schedule
  cron: "0 6 * * *"
system: |
  Daily scan of project dependencies against
  CVE databases. Prioritize by CVSS score
  and exploitability. Create fix PRs when possible.
steps:
  - scan_dependencies:
      source: github
      files: [package.json, requirements.txt, go.mod]
  - check_cves:
      databases: [nvd, github_advisories]
      min_severity: medium
  - prioritize:
      by: [cvss_score, exploitability, affected_scope]
  - alert:
      channel: "#security-vulns"
      create_issue: if_critical`,
    serviceFlow: ["GitHub", "Slack"],
    triggers: ["schedule"],
    complexity: "professional",
    designHighlights: ["CVE monitoring", "Dependency scanning", "Priority triage"],
  },
  {
    id: "security-access-audit",
    title: "Access Audit Agent",
    description: "Reviews user permissions and flags over-provisioned accounts.",
    tool: "GitHub",
    toolIcon: Eye,
    toolColor: "#dc2626",
    category: "Security",
    difficulty: "Advanced",
    config: `name: access-audit-agent
model: gpt-4o
tools: [github, slack, google_drive]
trigger:
  type: schedule
  cron: "0 7 * * 1"
system: |
  Weekly audit of user permissions across GitHub
  and Google Drive. Flag accounts with excessive
  privileges or inactive access.
steps:
  - collect_permissions:
      sources: [github_org, google_drive]
  - analyze:
      checks:
        - over_provisioned: admin_without_need
        - inactive: no_activity_30d
        - external: non_org_collaborators
  - generate_report:
      format: compliance_table
      risk_score: per_account
  - deliver:
      channel: "#security-audit"
      email: security_team`,
    serviceFlow: ["GitHub", "Slack", "Google Drive"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Permission review", "Anomaly detection", "Audit reports"],
  },
  {
    id: "security-incident-response",
    title: "Incident Response Agent",
    description: "Coordinates incident response with runbooks and communication.",
    tool: "Slack",
    toolIcon: AlertTriangle,
    toolColor: "#dc2626",
    category: "Security",
    difficulty: "Advanced",
    config: `name: incident-response-agent
model: gpt-4o
tools: [slack, jira, gmail]
trigger:
  type: webhook
  source: monitoring
  also: on_message("#incidents")
system: |
  Automated incident response coordination.
  Match incidents to runbooks, notify stakeholders,
  track resolution, and generate post-mortems.
steps:
  - classify_incident:
      severity: [SEV1, SEV2, SEV3]
      type: [outage, data_breach, degradation]
  - execute_runbook:
      source: config.runbook_library
      match_by: incident_type
  - coordinate:
      create_war_room: if_sev1
      notify: [oncall, management, affected_teams]
      create_ticket: jira
  - post_mortem:
      auto_generate: on_resolution
      template: blameless_retro`,
    serviceFlow: ["Slack", "Jira", "Gmail"],
    triggers: ["webhook", "event"],
    complexity: "enterprise",
    designHighlights: ["Automated runbooks", "Stakeholder notification", "Post-mortem generation"],
  },

  // ─── DevOps (3 new) ────────────────────────────────────────────────
  {
    id: "devops-deployment-pipeline-monitor",
    title: "Deployment Pipeline Monitor",
    description: "Watches CI/CD pipelines and alerts on failures.",
    tool: "GitHub",
    toolIcon: Github,
    toolColor: "#8b5cf6",
    category: "DevOps",
    difficulty: "Intermediate",
    config: `name: deployment-pipeline-monitor
model: gpt-4o
tools: [github, slack, jira]
trigger:
  type: webhook
  source: github
  event: workflow_run.completed
system: |
  Monitor CI/CD pipeline runs. On failure, analyze
  logs, identify root cause, and alert the team.
  Track deployment frequency and success rates.
steps:
  - check_status:
      source: github_actions
      filter: deployment_workflows
  - on_failure:
      analyze_logs: true
      identify_cause: [test_failure, build_error, infra]
  - alert:
      channel: "#deploys"
      mention: commit_author
      create_ticket: if_recurring
  - metrics:
      track: [frequency, success_rate, mttr]`,
    serviceFlow: ["GitHub", "Slack", "Jira"],
    triggers: ["webhook"],
    complexity: "professional",
    designHighlights: ["Pipeline health tracking", "Failure analysis", "Auto-rollback triggers"],
  },
  {
    id: "devops-infra-cost-optimizer",
    title: "Infrastructure Cost Optimizer",
    description: "Analyzes cloud spending and suggests optimizations.",
    tool: "AWS",
    toolIcon: DollarSign,
    toolColor: "#f59e0b",
    category: "DevOps",
    difficulty: "Advanced",
    config: `name: infra-cost-optimizer
model: gpt-4o
tools: [aws, slack, google_sheets]
trigger:
  type: schedule
  cron: "0 7 * * 1"
system: |
  Weekly cloud cost analysis. Identify underutilized
  resources, right-sizing opportunities, and
  reserved instance recommendations.
steps:
  - fetch_costs:
      source: aws_cost_explorer
      period: last_7d
      group_by: [service, team, environment]
  - analyze:
      checks:
        - underutilized: cpu < 20%
        - oversized: memory_usage < 30%
        - idle: no_traffic_48h
  - recommend:
      actions: [right_size, reserve, terminate]
      savings_estimate: per_action
  - report:
      spreadsheet: google_sheets
      alert: "#infra-costs"`,
    serviceFlow: ["AWS", "Slack", "Google Sheets"],
    triggers: ["schedule"],
    complexity: "enterprise",
    designHighlights: ["Cost anomaly detection", "Right-sizing suggestions", "Savings reports"],
  },
  {
    id: "devops-oncall-rotation-manager",
    title: "On-Call Rotation Manager",
    description: "Manages on-call schedules and incident escalation.",
    tool: "Slack",
    toolIcon: Calendar,
    toolColor: "#8b5cf6",
    category: "DevOps",
    difficulty: "Intermediate",
    config: `name: oncall-rotation-manager
model: gpt-4o
tools: [slack, calendar, jira]
trigger:
  type: schedule
  cron: "0 9 * * 1"
  also: on_webhook
system: |
  Manage weekly on-call rotations. Post current
  on-call to Slack, handle swap requests, and
  ensure coverage gaps are filled.
steps:
  - rotate:
      schedule: config.rotation_list
      period: weekly
      respect: time_off_calendar
  - announce:
      channel: "#oncall"
      pin: current_schedule
  - handle_swaps:
      allow: peer_swap
      require: manager_approval_if_gap
  - escalate:
      if: no_response_15m
      chain: [backup, manager, director]`,
    serviceFlow: ["Slack", "Calendar", "Jira"],
    triggers: ["schedule", "webhook"],
    complexity: "professional",
    designHighlights: ["Auto-rotation", "Escalation chains", "Coverage gap detection"],
  },
];

/** Lightweight template list without YAML configs — use for gallery/search pages */
export const templateList = templates.map(({ config, ...rest }) => rest);
export type TemplateListItem = Omit<AgentTemplate, "config">;

export const difficultyColors: Record<Difficulty, string> = {
  Beginner: "text-green-400 border-green-400/30 bg-green-400/10",
  Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Advanced: "text-red-400 border-red-400/30 bg-red-400/10",
};

export const categoryColors: Record<Category, string> = {
  DevOps: "text-brand-purple border-brand-purple/30 bg-brand-purple/10",
  Communication: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10",
  Productivity: "text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10",
  Finance: "text-green-400 border-green-400/30 bg-green-400/10",
  Sales: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  Support: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  Research: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  Marketing: "text-pink-400 border-pink-400/30 bg-pink-400/10",
  Legal: "text-stone-400 border-stone-400/30 bg-stone-400/10",
  Security: "text-red-400 border-red-400/30 bg-red-400/10",
};
