import {
  Mail, MessageSquare, Github, HardDrive, SquareKanban,
  BookOpen, CreditCard, Calendar, Figma,
  type LucideIcon,
} from "lucide-react";

export type Category = "DevOps" | "Communication" | "Productivity";
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
}

export const categories: Category[] = ["DevOps", "Communication", "Productivity"];
export const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export const templates: AgentTemplate[] = [
  // Gmail
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
  },
  // Slack
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
  },
  // GitHub
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
  },
  // Google Drive
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
  },
  // Jira
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
  },
  // Notion
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
  },
  // Stripe
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
  },
  // Calendar
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
  },
  // Figma
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
  },
];

export const difficultyColors: Record<Difficulty, string> = {
  Beginner: "text-green-400 border-green-400/30 bg-green-400/10",
  Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Advanced: "text-red-400 border-red-400/30 bg-red-400/10",
};

export const categoryColors: Record<Category, string> = {
  DevOps: "text-brand-purple border-brand-purple/30 bg-brand-purple/10",
  Communication: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10",
  Productivity: "text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10",
};
