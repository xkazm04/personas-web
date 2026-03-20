export interface ConnectorUseCase {
  title: string;
  description: string;
  command: string;
}

export interface Connector {
  name: string;
  label: string;
  color: string;
  category: string;
  summary: string;
  monogram: string;
  authType: string;
  /** SVG filename in /public/tools/ (without extension). Defaults to `name`. */
  icon?: string;
  useCases: ConnectorUseCase[];
}

export interface ConnectorCategory {
  key: string;
  label: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
}

export const categories: ConnectorCategory[] = [
  { key: "messaging", label: "Messaging", accent: "cyan" },
  { key: "development", label: "Development", accent: "purple" },
  { key: "database", label: "Databases", accent: "emerald" },
  { key: "devops", label: "Infrastructure", accent: "amber" },
  { key: "productivity", label: "Productivity", accent: "cyan" },
  { key: "analytics", label: "Analytics", accent: "purple" },
  { key: "monitoring", label: "Monitoring", accent: "amber" },
  { key: "crm", label: "CRM", accent: "emerald" },
  { key: "creativity", label: "Design", accent: "purple" },
  { key: "social", label: "Social", accent: "cyan" },
];

/* Colors adjusted for dark-background visibility where originals are too dark */
export const connectors: Connector[] = [
  // ── Messaging ──────────────────────────────────────────────────────
  {
    name: "slack", label: "Slack", color: "#E01E5A", category: "messaging",
    summary: "Workspace messaging for channels, DMs, and workflow notifications.",
    monogram: "Sl", authType: "Bot Token",
    useCases: [
      { title: "Daily Standup Summary", description: "Collect standup updates from team members and post a formatted digest to a channel every morning.", command: "personas run slack:post-summary --channel #general" },
      { title: "Incident Alerting", description: "Forward monitoring alerts to a dedicated incident channel and tag the on-call team.", command: "personas run slack:alert --channel #incidents --mention @oncall" },
      { title: "PR Review Reminders", description: "Notify reviewers in Slack when pull requests have been waiting for review longer than 4 hours.", command: "personas run slack:pr-reminder --threshold 4h --channel #engineering" },
    ],
  },
  {
    name: "discord", label: "Discord", color: "#5865F2", category: "messaging",
    summary: "Bot integration for server messaging, moderation, and notifications.",
    monogram: "Dc", authType: "Bot Token",
    useCases: [
      { title: "Community Welcome Flow", description: "Send personalized welcome messages and role assignments when new members join the server.", command: "personas run discord:welcome --server personas-community" },
      { title: "Moderation Digest", description: "Generate a daily summary of flagged messages and moderation actions across all channels.", command: "personas run discord:mod-digest --server personas-community --channel #mod-log" },
      { title: "Release Announcements", description: "Automatically post formatted release notes to the announcements channel on new deployments.", command: "personas run discord:announce-release --channel #releases --tag latest" },
    ],
  },
  {
    name: "telegram", label: "Telegram", color: "#26A5E4", category: "messaging",
    summary: "Bot for messaging, notifications, and group automation.",
    monogram: "Tg", authType: "Bot Token",
    useCases: [
      { title: "Server Health Alerts", description: "Send real-time server health notifications to a Telegram group when CPU or memory exceeds thresholds.", command: "personas run telegram:health-alert --chat-id ops-team --cpu-threshold 90" },
      { title: "Daily Report Delivery", description: "Compile and deliver daily business metrics as a formatted Telegram message to stakeholders.", command: "personas run telegram:daily-report --chat-id leadership" },
      { title: "Feedback Collection", description: "Run an interactive survey bot that collects user feedback and stores responses in a spreadsheet.", command: "personas run telegram:survey --chat-id beta-testers --form feedback-q4" },
    ],
  },
  {
    name: "twilio_sms", label: "Twilio", color: "#F22F46", category: "messaging",
    summary: "SMS, voice, WhatsApp, and communication APIs.",
    monogram: "Tw", authType: "API Key", icon: "twilio",
    useCases: [
      { title: "Appointment Reminders", description: "Send SMS reminders to customers 24 hours before their scheduled appointments.", command: "personas run twilio:sms-reminder --list appointments --hours-before 24" },
      { title: "Two-Factor Auth Codes", description: "Generate and deliver one-time verification codes via SMS for user authentication flows.", command: "personas run twilio:send-otp --to +1234567890 --template verify" },
      { title: "Order Status Updates", description: "Notify customers via SMS when their order status changes to shipped or delivered.", command: "personas run twilio:order-update --event shipped --source orders-db" },
    ],
  },
  {
    name: "sendgrid", label: "SendGrid", color: "#1A82E2", category: "messaging",
    summary: "Transactional and marketing email delivery at scale.",
    monogram: "SG", authType: "API Key",
    useCases: [
      { title: "Onboarding Drip Campaign", description: "Trigger a multi-step welcome email sequence when new users sign up for the platform.", command: "personas run sendgrid:drip-campaign --list new-signups --template onboarding-v2" },
      { title: "Invoice Delivery", description: "Generate and send monthly invoices as formatted emails with PDF attachments.", command: "personas run sendgrid:send-invoice --month current --template invoice-standard" },
      { title: "Churn Risk Alerts", description: "Email account managers when customers show signs of disengagement based on usage metrics.", command: "personas run sendgrid:churn-alert --threshold 14d-inactive --to account-managers" },
    ],
  },
  {
    name: "resend", label: "Resend", color: "#ffffff", category: "messaging",
    summary: "Modern email API for developers with React Email support.",
    monogram: "Re", authType: "API Key",
    useCases: [
      { title: "Transactional Receipts", description: "Send beautifully styled purchase receipts using React Email templates on each transaction.", command: "personas run resend:send-receipt --template react-receipt --event purchase" },
      { title: "Magic Link Auth", description: "Deliver passwordless authentication emails with one-click magic links for sign-in.", command: "personas run resend:magic-link --to user@example.com --redirect /dashboard" },
      { title: "Weekly Changelog", description: "Compile recent product changes and send a styled weekly changelog email to subscribers.", command: "personas run resend:changelog --list subscribers --since 7d" },
    ],
  },

  // ── Development ────────────────────────────────────────────────────
  {
    name: "github", label: "GitHub", color: "#8b5cf6", category: "development",
    summary: "Repositories, issues, pull requests, and CI/CD automation.",
    monogram: "GH", authType: "PAT",
    useCases: [
      { title: "Stale Issue Cleanup", description: "Identify and label issues that have been inactive for 30+ days, then notify authors.", command: "personas run github:stale-issues --repo personas/app --days 30 --label stale" },
      { title: "PR Size Analyzer", description: "Comment on pull requests with complexity metrics and suggest breaking up large PRs.", command: "personas run github:pr-analyze --repo personas/app --max-lines 500" },
      { title: "Release Changelog", description: "Generate a formatted changelog from merged PRs since the last release tag.", command: "personas run github:changelog --repo personas/app --since last-release" },
    ],
  },
  {
    name: "jira", label: "Jira", color: "#2684FF", category: "development",
    summary: "Issue tracking and project management for agile software teams.",
    monogram: "Ji", authType: "API Token",
    useCases: [
      { title: "Sprint Velocity Report", description: "Calculate and post sprint velocity trends to help the team forecast capacity.", command: "personas run jira:velocity-report --project CORE --sprints 5" },
      { title: "Blocked Issue Escalation", description: "Detect issues stuck in 'blocked' status for more than 2 days and notify the project lead.", command: "personas run jira:escalate-blocked --project CORE --threshold 2d" },
      { title: "Auto-Triage Bug Reports", description: "Classify incoming bug reports by severity using content analysis and assign to the right team.", command: "personas run jira:auto-triage --project CORE --issue-type Bug" },
    ],
  },
  {
    name: "linear", label: "Linear", color: "#5E6AD2", category: "development",
    summary: "Issue tracking for software teams with cycles, projects, and triage.",
    monogram: "Ln", authType: "PAT",
    useCases: [
      { title: "Cycle Burndown Report", description: "Generate a burndown chart summary for the current cycle and post it to the team channel.", command: "personas run linear:burndown --team engineering --cycle current" },
      { title: "Triage Inbox Processor", description: "Auto-label and prioritize new issues in the triage inbox based on keywords and history.", command: "personas run linear:triage --team engineering --inbox triage" },
      { title: "Cross-Team Dependency Tracker", description: "Identify and report on issues that are blocking other teams' progress.", command: "personas run linear:dependencies --teams engineering,product --status blocked" },
    ],
  },
  {
    name: "circleci", label: "CircleCI", color: "#71717a", category: "development",
    summary: "Continuous integration and delivery pipeline orchestration.",
    monogram: "CI", authType: "PAT",
    useCases: [
      { title: "Flaky Test Detection", description: "Analyze recent pipeline runs to identify tests that pass and fail intermittently.", command: "personas run circleci:flaky-tests --project personas/app --runs 50" },
      { title: "Build Time Optimization", description: "Report on the slowest pipeline steps and suggest parallelization improvements.", command: "personas run circleci:optimize --project personas/app --threshold 5m" },
      { title: "Failed Deploy Rollback", description: "Automatically trigger a rollback pipeline when a production deploy fails health checks.", command: "personas run circleci:auto-rollback --project personas/app --branch main" },
    ],
  },
  {
    name: "confluence", label: "Confluence", color: "#2684FF", category: "development",
    summary: "Wiki and knowledge base for team documentation and collaboration.",
    monogram: "Cf", authType: "API Token",
    useCases: [
      { title: "Meeting Notes Publisher", description: "Transcribe meeting recordings and publish structured notes to the team's Confluence space.", command: "personas run confluence:publish-notes --space TEAM --meeting standup" },
      { title: "Stale Docs Finder", description: "Scan documentation pages and flag those not updated in 90+ days for review.", command: "personas run confluence:stale-docs --space ENGINEERING --days 90" },
      { title: "Onboarding Guide Generator", description: "Compile relevant wiki pages into a personalized onboarding guide for new team members.", command: "personas run confluence:onboarding --space HR --role engineer" },
    ],
  },

  // ── Databases ──────────────────────────────────────────────────────
  {
    name: "postgres", label: "PostgreSQL", color: "#5A9BD5", category: "database",
    summary: "Open-source relational database with advanced SQL and extensibility.",
    monogram: "Pg", authType: "Connection String", icon: "postgresql",
    useCases: [
      { title: "Schema Drift Detection", description: "Compare production schema against migration files and alert on untracked changes.", command: "personas run postgres:schema-diff --db production --migrations ./migrations" },
      { title: "Slow Query Report", description: "Identify the top 10 slowest queries from pg_stat_statements and suggest index optimizations.", command: "personas run postgres:slow-queries --db production --top 10" },
      { title: "Data Export Pipeline", description: "Export filtered query results to CSV and upload to cloud storage on a schedule.", command: "personas run postgres:export --query 'SELECT * FROM orders WHERE created_at > now() - interval 1 day' --format csv" },
    ],
  },
  {
    name: "mongodb", label: "MongoDB", color: "#47A248", category: "database",
    summary: "Document database with flexible schemas and aggregation pipelines.",
    monogram: "Mg", authType: "Connection String",
    useCases: [
      { title: "Collection Size Monitor", description: "Track collection growth rates and alert when any collection exceeds storage thresholds.", command: "personas run mongodb:size-monitor --db app --threshold 10GB" },
      { title: "Aggregation Pipeline Builder", description: "Generate optimized aggregation pipelines from natural language descriptions of the desired output.", command: "personas run mongodb:build-pipeline --collection users --query 'monthly active users by region'" },
      { title: "Index Usage Audit", description: "Analyze index usage statistics and recommend dropping unused indexes to save storage.", command: "personas run mongodb:index-audit --db app --min-ops 100" },
    ],
  },
  {
    name: "redis", label: "Redis", color: "#DC382D", category: "database",
    summary: "In-memory data store for caching, queues, and real-time pub/sub.",
    monogram: "Rd", authType: "Connection String",
    useCases: [
      { title: "Cache Hit Rate Report", description: "Monitor cache hit/miss ratios across key patterns and identify optimization opportunities.", command: "personas run redis:cache-report --instance production --period 24h" },
      { title: "Queue Depth Monitor", description: "Track queue depths across all BullMQ queues and alert when backlogs exceed thresholds.", command: "personas run redis:queue-monitor --pattern 'bull:*' --threshold 1000" },
      { title: "Memory Usage Analyzer", description: "Scan key namespaces for memory consumption and identify large keys for optimization.", command: "personas run redis:memory-scan --instance production --top 20" },
    ],
  },
  {
    name: "supabase", label: "Supabase", color: "#3ECF8E", category: "database",
    summary: "Open-source Firebase alternative with Postgres, auth, and realtime.",
    monogram: "Sb", authType: "API Key",
    useCases: [
      { title: "Auth Usage Report", description: "Generate reports on user sign-up trends, active sessions, and auth method distribution.", command: "personas run supabase:auth-report --project my-app --period 30d" },
      { title: "RLS Policy Audit", description: "Scan all tables for missing or overly permissive Row Level Security policies.", command: "personas run supabase:rls-audit --project my-app" },
      { title: "Storage Cleanup", description: "Identify orphaned files in storage buckets not referenced by any database record.", command: "personas run supabase:storage-cleanup --project my-app --bucket uploads --dry-run" },
    ],
  },
  {
    name: "neon", label: "Neon", color: "#00E699", category: "database",
    summary: "Serverless Postgres with branching, autoscaling, and bottomless storage.",
    monogram: "Ne", authType: "Connection String",
    useCases: [
      { title: "Branch Environment Sync", description: "Create a Neon branch for each preview deployment and seed it with sanitized production data.", command: "personas run neon:branch-sync --project my-app --source main --target preview" },
      { title: "Compute Usage Report", description: "Track serverless compute hours across branches and alert on unexpected usage spikes.", command: "personas run neon:usage-report --project my-app --period 7d" },
      { title: "Migration Dry Run", description: "Run pending migrations on a temporary branch to verify they succeed before applying to production.", command: "personas run neon:migration-test --project my-app --migrations ./db/migrations" },
    ],
  },
  {
    name: "planetscale", label: "PlanetScale", color: "#71717a", category: "database",
    summary: "Serverless MySQL platform with branching and non-blocking schema changes.",
    monogram: "PS", authType: "API Key",
    useCases: [
      { title: "Deploy Request Automation", description: "Automatically create deploy requests when migration PRs are merged and notify the DBA team.", command: "personas run planetscale:deploy-request --db main --branch feature-auth" },
      { title: "Schema Change Reviewer", description: "Analyze pending deploy requests for potentially dangerous schema changes and flag risks.", command: "personas run planetscale:review-schema --db main --request 42" },
      { title: "Connection Pool Monitor", description: "Track connection pool utilization and recommend scaling adjustments based on traffic patterns.", command: "personas run planetscale:pool-monitor --db main --period 24h" },
    ],
  },
  {
    name: "duckdb", label: "DuckDB", color: "#FFC107", category: "database",
    summary: "Embedded analytical database for OLAP, Parquet, CSV, and JSON.",
    monogram: "Dk", authType: "File Path",
    useCases: [
      { title: "CSV Analytics Pipeline", description: "Load CSV exports into DuckDB and run analytical queries for weekly business reports.", command: "personas run duckdb:csv-analyze --input ./exports/sales.csv --query 'revenue by region'" },
      { title: "Parquet Data Explorer", description: "Scan Parquet files in cloud storage and generate summary statistics across all columns.", command: "personas run duckdb:parquet-stats --path s3://data-lake/events/ --sample 100000" },
      { title: "Cross-Source Join", description: "Join data from multiple file formats (CSV, JSON, Parquet) and export the result to a single dataset.", command: "personas run duckdb:join-sources --sources sales.csv,products.json --output combined.parquet" },
    ],
  },
  {
    name: "convex", label: "Convex", color: "#F97316", category: "database",
    summary: "Real-time backend-as-a-service with database, functions, and scheduling.",
    monogram: "Cx", authType: "API Key",
    useCases: [
      { title: "Function Performance Monitor", description: "Track execution times of Convex functions and alert when latency exceeds SLA thresholds.", command: "personas run convex:perf-monitor --project my-app --threshold 500ms" },
      { title: "Scheduled Job Audit", description: "List all scheduled jobs, their frequencies, and last execution status for review.", command: "personas run convex:job-audit --project my-app" },
      { title: "Real-Time Data Sync", description: "Set up reactive sync between Convex tables and an external analytics warehouse.", command: "personas run convex:sync --project my-app --table events --destination warehouse" },
    ],
  },
  {
    name: "notion", label: "Notion", color: "#9B9A97", category: "database",
    summary: "Workspace for knowledge bases, wikis, and project management.",
    monogram: "Nt", authType: "API Key",
    useCases: [
      { title: "Meeting Notes Sync", description: "Auto-create Notion pages from calendar events and populate them with agenda templates.", command: "personas run notion:meeting-sync --database meetings --calendar team" },
      { title: "Sprint Planning Board", description: "Generate sprint task pages from Linear issues and organize them in a Notion kanban board.", command: "personas run notion:sprint-board --database sprints --source linear --cycle current" },
      { title: "Knowledge Base Search", description: "Search across all Notion workspaces and return relevant documentation snippets for a query.", command: "personas run notion:search --workspace engineering --query 'deployment process'" },
    ],
  },
  {
    name: "upstash", label: "Upstash", color: "#00E9A3", category: "database",
    summary: "Serverless Redis and Kafka for low-latency data at the edge.",
    monogram: "Up", authType: "API Key",
    useCases: [
      { title: "Rate Limit Dashboard", description: "Visualize rate limiting metrics across API endpoints and identify abusive traffic patterns.", command: "personas run upstash:rate-limit-report --db edge-cache --period 24h" },
      { title: "Kafka Topic Monitor", description: "Track consumer lag across Kafka topics and alert when processing falls behind.", command: "personas run upstash:kafka-monitor --cluster prod --lag-threshold 10000" },
      { title: "Edge Cache Warm-Up", description: "Pre-populate edge cache with frequently accessed data before traffic spikes.", command: "personas run upstash:cache-warmup --db edge-cache --keys popular-routes" },
    ],
  },

  // ── Infrastructure ─────────────────────────────────────────────────
  {
    name: "vercel", label: "Vercel", color: "#ffffff", category: "devops",
    summary: "Frontend deployment platform with serverless functions and edge network.",
    monogram: "Vc", authType: "PAT",
    useCases: [
      { title: "Preview Deploy Notifier", description: "Post preview deployment URLs to the PR thread and Slack channel when builds complete.", command: "personas run vercel:preview-notify --project my-app --channel #deploys" },
      { title: "Performance Budget Check", description: "Run Lighthouse audits on preview deployments and block merging if scores drop below thresholds.", command: "personas run vercel:perf-check --project my-app --min-score 90" },
      { title: "Environment Sync", description: "Synchronize environment variables across preview, staging, and production environments.", command: "personas run vercel:env-sync --project my-app --from production --to staging" },
    ],
  },
  {
    name: "netlify", label: "Netlify", color: "#00C7B7", category: "devops",
    summary: "Web deployment platform with serverless functions and form handling.",
    monogram: "Nf", authType: "PAT",
    useCases: [
      { title: "Build Failure Alert", description: "Monitor deploy builds and send detailed failure logs to the team channel when builds fail.", command: "personas run netlify:build-alert --site my-site --channel #deploys" },
      { title: "Form Submission Export", description: "Export form submissions from Netlify Forms to a spreadsheet on a daily schedule.", command: "personas run netlify:export-forms --site my-site --form contact --format csv" },
      { title: "Bandwidth Usage Monitor", description: "Track bandwidth consumption across all sites and alert before hitting plan limits.", command: "personas run netlify:bandwidth-check --team my-team --threshold 80%" },
    ],
  },
  {
    name: "cloudflare", label: "Cloudflare", color: "#F38020", category: "devops",
    summary: "CDN, DNS, Workers, and security services.",
    monogram: "CF", authType: "API Key",
    useCases: [
      { title: "DNS Record Audit", description: "Scan all DNS zones for misconfigured or orphaned records and generate a cleanup report.", command: "personas run cloudflare:dns-audit --zone example.com" },
      { title: "Worker Performance Report", description: "Aggregate execution metrics for all Workers and identify high-latency or high-error routes.", command: "personas run cloudflare:worker-stats --zone example.com --period 7d" },
      { title: "Security Event Monitor", description: "Monitor WAF and bot management events and escalate blocked threat patterns to the security team.", command: "personas run cloudflare:security-monitor --zone example.com --severity high" },
    ],
  },

  // ── Productivity ───────────────────────────────────────────────────
  {
    name: "clickup", label: "ClickUp", color: "#7B68EE", category: "productivity",
    summary: "Project management with tasks, docs, goals, and time tracking.",
    monogram: "CU", authType: "PAT",
    useCases: [
      { title: "Overdue Task Report", description: "Find all overdue tasks across workspaces and notify assignees with updated deadlines.", command: "personas run clickup:overdue-report --workspace team --notify assignees" },
      { title: "Time Tracking Summary", description: "Generate weekly time tracking reports per team member and compare against estimated hours.", command: "personas run clickup:time-report --workspace team --period weekly" },
      { title: "Goal Progress Sync", description: "Update goal progress percentages based on completed tasks linked to each objective.", command: "personas run clickup:goal-sync --workspace team --goals Q1-OKRs" },
    ],
  },
  {
    name: "monday", label: "Monday.com", color: "#FF3D57", category: "productivity",
    summary: "Work management platform for projects, workflows, and CRM.",
    monogram: "Mo", authType: "API Key",
    useCases: [
      { title: "Board Status Digest", description: "Send a morning digest summarizing item statuses, blockers, and upcoming deadlines across boards.", command: "personas run monday:status-digest --board sprint-board --channel #standups" },
      { title: "Client Project Tracker", description: "Auto-update client-facing project boards when internal engineering milestones are completed.", command: "personas run monday:client-sync --source engineering --target client-portal" },
      { title: "Resource Allocation", description: "Analyze workload distribution across team members and flag over-allocated individuals.", command: "personas run monday:workload-check --board sprint-board --max-items 15" },
    ],
  },
  {
    name: "airtable", label: "Airtable", color: "#18BFFF", category: "productivity",
    summary: "Spreadsheet-database for project tracking and data management.",
    monogram: "At", authType: "PAT",
    useCases: [
      { title: "Content Calendar Sync", description: "Sync content calendar entries from Airtable to scheduling tools and notify writers of deadlines.", command: "personas run airtable:content-sync --base content-hub --table calendar --notify writers" },
      { title: "Inventory Tracker", description: "Update inventory levels from supplier feeds and flag items below minimum stock thresholds.", command: "personas run airtable:inventory-update --base operations --table inventory --min-stock 10" },
      { title: "Applicant Pipeline", description: "Move applicant records through hiring stages and send automated status update emails.", command: "personas run airtable:hiring-pipeline --base recruiting --table candidates" },
    ],
  },
  {
    name: "calendly", label: "Calendly", color: "#006BFF", category: "productivity",
    summary: "Scheduling for meetings and appointment automation.",
    monogram: "Ca", authType: "PAT",
    useCases: [
      { title: "Meeting Prep Briefing", description: "Generate a prep document with attendee info and context before each scheduled meeting.", command: "personas run calendly:meeting-prep --event-type sales-call --lookahead 24h" },
      { title: "No-Show Follow Up", description: "Detect no-shows and automatically send a rescheduling link with a personalized message.", command: "personas run calendly:no-show-followup --event-type consultation" },
      { title: "Availability Report", description: "Analyze booking patterns and suggest optimal meeting hours based on historical data.", command: "personas run calendly:availability-report --period 30d --timezone US/Pacific" },
    ],
  },
  {
    name: "dropbox", label: "Dropbox", color: "#0061FF", category: "productivity",
    summary: "Cloud storage for file sync, sharing, and collaboration.",
    monogram: "Dx", authType: "PAT",
    useCases: [
      { title: "File Organization Agent", description: "Auto-organize uploaded files into structured folders based on file type and content analysis.", command: "personas run dropbox:auto-organize --folder /uploads --rules by-type" },
      { title: "Shared Link Audit", description: "Scan all shared links for overly permissive access and revoke expired or unused links.", command: "personas run dropbox:link-audit --team my-team --revoke-expired" },
      { title: "Backup Verification", description: "Verify that critical folders are synced and generate a report of any missing or corrupted files.", command: "personas run dropbox:backup-verify --folders /critical --checksum sha256" },
    ],
  },

  // ── Analytics ──────────────────────────────────────────────────────
  {
    name: "posthog", label: "PostHog", color: "#F9BD2B", category: "analytics",
    summary: "Product analytics, feature flags, session replay, and A/B testing.",
    monogram: "PH", authType: "API Key",
    useCases: [
      { title: "Feature Flag Cleanup", description: "Identify stale feature flags that have been at 100% rollout for 30+ days and recommend removal.", command: "personas run posthog:flag-cleanup --project my-app --stale-days 30" },
      { title: "Funnel Drop-Off Analysis", description: "Analyze conversion funnels and highlight steps with the highest user drop-off rates.", command: "personas run posthog:funnel-analysis --project my-app --funnel signup" },
      { title: "A/B Test Summary", description: "Generate statistical summaries of running experiments and recommend winners based on significance.", command: "personas run posthog:ab-summary --project my-app --experiment onboarding-v2" },
    ],
  },
  {
    name: "mixpanel", label: "Mixpanel", color: "#7856FF", category: "analytics",
    summary: "Product analytics with GDPR-compliant data access.",
    monogram: "Mx", authType: "API Key",
    useCases: [
      { title: "Retention Cohort Report", description: "Generate weekly retention cohort tables and identify trends in user engagement over time.", command: "personas run mixpanel:retention --project my-app --cohort weekly --period 12w" },
      { title: "Event Taxonomy Audit", description: "Scan tracked events for naming inconsistencies and suggest a standardized taxonomy.", command: "personas run mixpanel:taxonomy-audit --project my-app" },
      { title: "User Journey Mapping", description: "Trace common user paths through the product and visualize the most frequent navigation flows.", command: "personas run mixpanel:user-journeys --project my-app --top 10" },
    ],
  },
  {
    name: "twilio_segment", label: "Segment", color: "#52BD94", category: "analytics",
    summary: "Customer data platform for event tracking and routing.",
    monogram: "Se", authType: "API Key", icon: "segment",
    useCases: [
      { title: "Source Health Check", description: "Monitor all connected sources for data freshness and alert when events stop flowing.", command: "personas run segment:health-check --workspace my-workspace --threshold 1h" },
      { title: "Schema Violation Report", description: "Detect events that violate the tracking plan schema and generate a violations summary.", command: "personas run segment:schema-report --workspace my-workspace --plan main" },
      { title: "Destination Sync Audit", description: "Verify all destinations are receiving events correctly and report on delivery failures.", command: "personas run segment:destination-audit --workspace my-workspace" },
    ],
  },

  // ── Monitoring ─────────────────────────────────────────────────────
  {
    name: "sentry", label: "Sentry", color: "#8B5CF6", category: "monitoring",
    summary: "Application monitoring for errors, performance, and session replay.",
    monogram: "Sy", authType: "PAT",
    useCases: [
      { title: "Error Spike Alert", description: "Detect sudden increases in error rates and automatically create Jira tickets with stack traces.", command: "personas run sentry:error-spike --project my-app --threshold 200% --create-ticket" },
      { title: "Release Health Report", description: "Compare crash-free session rates between releases and flag regressions.", command: "personas run sentry:release-health --project my-app --compare latest~previous" },
      { title: "Unhandled Exception Digest", description: "Send a daily digest of new unhandled exceptions grouped by issue to the engineering channel.", command: "personas run sentry:exception-digest --project my-app --channel #bugs" },
    ],
  },
  {
    name: "betterstack", label: "Better Stack", color: "#E5484D", category: "monitoring",
    summary: "Uptime monitoring, incident management, and status pages.",
    monogram: "BS", authType: "API Key",
    useCases: [
      { title: "Uptime SLA Report", description: "Generate monthly SLA compliance reports for all monitored endpoints and services.", command: "personas run betterstack:sla-report --team my-team --period monthly" },
      { title: "Incident Post-Mortem", description: "Compile incident timelines, screenshots, and resolution steps into a structured post-mortem document.", command: "personas run betterstack:post-mortem --incident 1234" },
      { title: "Status Page Auto-Update", description: "Automatically update public status page components when monitors detect outages.", command: "personas run betterstack:status-sync --monitors production --page public" },
    ],
  },

  // ── CRM ────────────────────────────────────────────────────────────
  {
    name: "hubspot", label: "HubSpot", color: "#FF7A59", category: "crm",
    summary: "CRM for contacts, deals, marketing automation, and sales pipelines.",
    monogram: "HS", authType: "PAT",
    useCases: [
      { title: "Lead Scoring Update", description: "Recalculate lead scores based on recent engagement data and update contact properties.", command: "personas run hubspot:lead-scoring --list all-leads --model engagement-v2" },
      { title: "Deal Pipeline Report", description: "Generate a weekly pipeline summary with deal stage distribution and forecasted revenue.", command: "personas run hubspot:pipeline-report --pipeline sales --period weekly" },
      { title: "Contact Deduplication", description: "Scan contacts for duplicates using fuzzy matching and merge records with confirmation.", command: "personas run hubspot:dedup --threshold 0.85 --dry-run" },
    ],
  },

  // ── Design ─────────────────────────────────────────────────────────
  {
    name: "figma", label: "Figma", color: "#F24E1E", category: "creativity",
    summary: "Collaborative design tool for UI/UX, prototyping, and design systems.",
    monogram: "Fg", authType: "PAT",
    useCases: [
      { title: "Design Token Export", description: "Extract design tokens (colors, spacing, typography) from Figma and sync to code variables.", command: "personas run figma:export-tokens --file design-system --format css-variables" },
      { title: "Component Inventory", description: "Scan all Figma files for component usage and identify detached or outdated instances.", command: "personas run figma:component-audit --project design-system" },
      { title: "Screenshot Diff", description: "Compare current designs against previous versions and highlight visual changes for review.", command: "personas run figma:screenshot-diff --file app-screens --branch main --compare previous" },
    ],
  },

  // ── Social ─────────────────────────────────────────────────────────
  {
    name: "buffer", label: "Buffer", color: "#168EEA", category: "social",
    summary: "Social media management for scheduling and publishing.",
    monogram: "Bu", authType: "PAT",
    useCases: [
      { title: "Content Queue Manager", description: "Auto-populate the publishing queue with content from an approved content database.", command: "personas run buffer:queue-fill --profile main --source content-db --count 7" },
      { title: "Engagement Report", description: "Generate weekly engagement analytics across all connected social profiles.", command: "personas run buffer:engagement-report --profiles all --period weekly" },
      { title: "Best Time Optimizer", description: "Analyze historical post performance and reschedule queued posts to optimal engagement times.", command: "personas run buffer:optimize-times --profile main --lookback 90d" },
    ],
  },
];
