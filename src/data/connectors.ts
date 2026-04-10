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
  { key: "devops", label: "Cloud & Hosting", accent: "amber" },
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
    summary: "Send messages, get notifications, and monitor channels automatically.",
    monogram: "Sl", authType: "Bot token (auto-setup available)",
    useCases: [
      { title: "Summarize Daily Standups", description: "Gather standup updates from your team and post a clean summary to a channel every morning.", command: "personas run \"Summarize today's standup and post to #general\"" },
      { title: "Alert the Team on Incidents", description: "Forward monitoring alerts to a dedicated channel and tag whoever is on call.", command: "personas run \"Send incident alerts to #incidents and tag @oncall\"" },
      { title: "Remind Reviewers About PRs", description: "Nudge reviewers in Slack when a pull request has been waiting longer than 4 hours.", command: "personas run \"Remind reviewers about PRs older than 4 hours in #engineering\"" },
    ],
  },
  {
    name: "discord", label: "Discord", color: "#5865F2", category: "messaging",
    summary: "Manage your community, send alerts, and automate moderation.",
    monogram: "Dc", authType: "Bot token (auto-setup available)",
    useCases: [
      { title: "Welcome New Members", description: "Greet new members with a personalized message and assign them the right roles.", command: "personas run \"Welcome new members and assign roles in personas-community\"" },
      { title: "Summarize Moderation Activity", description: "Get a daily recap of flagged messages and moderation actions across all channels.", command: "personas run \"Post moderation summary to #mod-log\"" },
      { title: "Announce New Releases", description: "Automatically share formatted release notes whenever you deploy.", command: "personas run \"Post release notes to #releases\"" },
    ],
  },
  {
    name: "telegram", label: "Telegram", color: "#26A5E4", category: "messaging",
    summary: "Send alerts, deliver reports, and run bots in Telegram groups.",
    monogram: "Tg", authType: "Bot token (auto-setup available)",
    useCases: [
      { title: "Get Server Health Alerts", description: "Receive instant notifications when your server's CPU or memory gets too high.", command: "personas run \"Alert ops-team on Telegram when CPU exceeds 90%\"" },
      { title: "Deliver Daily Reports", description: "Send a formatted summary of business metrics to stakeholders every day.", command: "personas run \"Send daily metrics report to leadership group\"" },
      { title: "Collect User Feedback", description: "Run a survey bot that gathers responses and saves them to a spreadsheet.", command: "personas run \"Survey beta-testers and save responses\"" },
    ],
  },
  {
    name: "twilio_sms", label: "Twilio", color: "#F22F46", category: "messaging",
    summary: "Send text messages, voice calls, and WhatsApp notifications to customers.",
    monogram: "Tw", authType: "API key", icon: "twilio",
    useCases: [
      { title: "Send Appointment Reminders", description: "Text customers 24 hours before their scheduled appointment.", command: "personas run \"Send SMS reminders for tomorrow's appointments\"" },
      { title: "Deliver Verification Codes", description: "Send one-time codes via SMS so users can verify their identity.", command: "personas run \"Send verification code to +1234567890\"" },
      { title: "Notify on Order Updates", description: "Let customers know by text when their order ships or gets delivered.", command: "personas run \"Text customers when their order status changes\"" },
    ],
  },
  {
    name: "sendgrid", label: "SendGrid", color: "#1A82E2", category: "messaging",
    summary: "Send transactional emails, run campaigns, and track delivery at scale.",
    monogram: "SG", authType: "API key",
    useCases: [
      { title: "Run a Welcome Email Series", description: "Automatically send a sequence of onboarding emails when someone signs up.", command: "personas run \"Start onboarding emails for new signups\"" },
      { title: "Email Monthly Invoices", description: "Generate and send invoices with PDF attachments at the end of each month.", command: "personas run \"Send this month's invoices\"" },
      { title: "Warn About At-Risk Customers", description: "Email account managers when a customer hasn't been active in two weeks.", command: "personas run \"Alert account managers about inactive customers\"" },
    ],
  },
  {
    name: "resend", label: "Resend", color: "#ffffff", category: "messaging",
    summary: "Send beautiful transactional emails with modern templates.",
    monogram: "Re", authType: "API key",
    useCases: [
      { title: "Send Purchase Receipts", description: "Deliver styled receipt emails automatically after every purchase.", command: "personas run \"Send a receipt email for each new purchase\"" },
      { title: "Send Magic Sign-In Links", description: "Let users log in with a single click instead of typing a password.", command: "personas run \"Send magic link to user@example.com\"" },
      { title: "Share a Weekly Changelog", description: "Compile recent product changes and send a styled update to subscribers.", command: "personas run \"Send weekly changelog to subscribers\"" },
    ],
  },

  // ── Development ────────────────────────────────────────────────────
  {
    name: "github", label: "GitHub", color: "#8b5cf6", category: "development",
    summary: "Review pull requests, manage issues, and automate your development workflow.",
    monogram: "GH", authType: "Access token",
    useCases: [
      { title: "Clean Up Stale Issues", description: "Find issues that have been inactive for 30+ days and notify their authors.", command: "personas run \"Label stale issues in personas/app older than 30 days\"" },
      { title: "Review PR Complexity", description: "Comment on large pull requests with size metrics and suggest breaking them up.", command: "personas run \"Analyze PR sizes in personas/app and flag large ones\"" },
      { title: "Generate a Release Changelog", description: "Create a formatted changelog from all pull requests merged since the last release.", command: "personas run \"Generate changelog for personas/app since last release\"" },
    ],
  },
  {
    name: "jira", label: "Jira", color: "#2684FF", category: "development",
    summary: "Create and manage tickets, track sprints, and automate project workflows.",
    monogram: "Ji", authType: "API token",
    useCases: [
      { title: "Report Sprint Velocity", description: "Show how your team's velocity has trended over the last five sprints.", command: "personas run \"Show velocity trends for CORE over the last 5 sprints\"" },
      { title: "Escalate Blocked Issues", description: "Flag issues stuck in 'blocked' for more than 2 days and notify the project lead.", command: "personas run \"Escalate CORE issues blocked longer than 2 days\"" },
      { title: "Auto-Triage Bug Reports", description: "Classify incoming bugs by severity and route them to the right team automatically.", command: "personas run \"Triage new bug reports in CORE project\"" },
    ],
  },
  {
    name: "linear", label: "Linear", color: "#5E6AD2", category: "development",
    summary: "Track issues, plan cycles, and triage work across your engineering team.",
    monogram: "Ln", authType: "Access token",
    useCases: [
      { title: "Show Cycle Progress", description: "Get a burndown summary for the current cycle and share it with the team.", command: "personas run \"Show burndown for the current engineering cycle\"" },
      { title: "Process the Triage Inbox", description: "Automatically label and prioritize new issues based on keywords and past patterns.", command: "personas run \"Triage new issues in the engineering inbox\"" },
      { title: "Find Cross-Team Blockers", description: "Identify issues that are blocking other teams and surface them for action.", command: "personas run \"Find blocked issues affecting engineering and product\"" },
    ],
  },
  {
    name: "circleci", label: "CircleCI", color: "#71717a", category: "development",
    summary: "Monitor builds, catch flaky tests, and speed up your CI/CD pipelines.",
    monogram: "CI", authType: "Access token",
    useCases: [
      { title: "Find Flaky Tests", description: "Spot tests that pass and fail randomly so you can fix them.", command: "personas run \"Find flaky tests in personas/app from the last 50 runs\"" },
      { title: "Speed Up Slow Builds", description: "Identify the slowest steps in your pipeline and suggest ways to parallelize them.", command: "personas run \"Find build steps slower than 5 minutes in personas/app\"" },
      { title: "Auto-Rollback Failed Deploys", description: "Automatically roll back when a production deploy fails its health checks.", command: "personas run \"Roll back personas/app if the main branch deploy fails\"" },
    ],
  },
  {
    name: "confluence", label: "Confluence", color: "#2684FF", category: "development",
    summary: "Publish meeting notes, maintain wikis, and keep documentation up to date.",
    monogram: "Cf", authType: "API token",
    useCases: [
      { title: "Publish Meeting Notes", description: "Turn meeting recordings into structured notes and save them to your team's space.", command: "personas run \"Publish standup notes to the TEAM space\"" },
      { title: "Find Outdated Docs", description: "Flag documentation pages that haven't been updated in 90+ days.", command: "personas run \"Find stale docs in ENGINEERING older than 90 days\"" },
      { title: "Build an Onboarding Guide", description: "Pull together relevant wiki pages into a personalized guide for new hires.", command: "personas run \"Create onboarding guide for new engineers\"" },
    ],
  },

  // ── Databases ──────────────────────────────────────────────────────
  {
    name: "postgres", label: "PostgreSQL", color: "#5A9BD5", category: "database",
    summary: "Read, write, and query your PostgreSQL database directly.",
    monogram: "Pg", authType: "Database address", icon: "postgresql",
    useCases: [
      { title: "Detect Schema Changes", description: "Compare your live database against migration files and spot any untracked changes.", command: "personas run \"Compare production schema against migration files\"" },
      { title: "Find Slow Queries", description: "Surface the 10 slowest queries and suggest indexes that could speed them up.", command: "personas run \"Find the 10 slowest queries and suggest fixes\"" },
      { title: "Export Data to CSV", description: "Run a query, save the results as CSV, and upload to cloud storage on a schedule.", command: "personas run \"Export yesterday's orders to CSV\"" },
    ],
  },
  {
    name: "mongodb", label: "MongoDB", color: "#47A248", category: "database",
    summary: "Store and retrieve data from your MongoDB collections.",
    monogram: "Mg", authType: "Database address",
    useCases: [
      { title: "Monitor Collection Sizes", description: "Track how fast your collections are growing and get alerts before they hit storage limits.", command: "personas run \"Alert when any collection exceeds 10 GB\"" },
      { title: "Build Aggregation Pipelines", description: "Describe what you want in plain English and get an optimized aggregation pipeline.", command: "personas run \"Build a pipeline for monthly active users by region\"" },
      { title: "Audit Index Usage", description: "Find indexes that are never used so you can drop them and free up storage.", command: "personas run \"Find unused indexes in the app database\"" },
    ],
  },
  {
    name: "redis", label: "Redis", color: "#DC382D", category: "database",
    summary: "Manage caching, message queues, and real-time data with Redis.",
    monogram: "Rd", authType: "Database address",
    useCases: [
      { title: "Check Cache Performance", description: "See your cache hit/miss ratios and find opportunities to improve them.", command: "personas run \"Show cache hit rates for production over the last 24 hours\"" },
      { title: "Monitor Queue Backlogs", description: "Track queue depths and get alerted when backlogs start piling up.", command: "personas run \"Alert when any queue exceeds 1000 pending items\"" },
      { title: "Find Memory-Heavy Keys", description: "Discover which keys are using the most memory so you can optimize storage.", command: "personas run \"Find the top 20 largest keys in production Redis\"" },
    ],
  },
  {
    name: "supabase", label: "Supabase", color: "#3ECF8E", category: "database",
    summary: "Manage your Supabase database, authentication, and file storage.",
    monogram: "Sb", authType: "API key",
    useCases: [
      { title: "Review Auth Trends", description: "See how sign-ups, active sessions, and login methods are trending.", command: "personas run \"Show auth usage trends for my-app over 30 days\"" },
      { title: "Audit Security Policies", description: "Check all tables for missing or overly permissive Row Level Security rules.", command: "personas run \"Audit RLS policies for my-app\"" },
      { title: "Clean Up Orphaned Files", description: "Find files in storage that are no longer referenced by any database record.", command: "personas run \"Find orphaned files in the uploads bucket\"" },
    ],
  },
  {
    name: "neon", label: "Neon", color: "#00E699", category: "database",
    summary: "Run serverless Postgres with instant branching and autoscaling.",
    monogram: "Ne", authType: "Database address",
    useCases: [
      { title: "Sync Preview Branches", description: "Spin up a database branch for each preview deployment with sanitized production data.", command: "personas run \"Create a preview branch from main with sample data\"" },
      { title: "Track Compute Usage", description: "Monitor serverless compute hours across branches and catch unexpected spikes.", command: "personas run \"Show compute usage across branches for the last 7 days\"" },
      { title: "Test Migrations Safely", description: "Run pending migrations on a temporary branch to verify they work before touching production.", command: "personas run \"Test pending migrations on a temporary branch\"" },
    ],
  },
  {
    name: "planetscale", label: "PlanetScale", color: "#71717a", category: "database",
    summary: "Run serverless MySQL with safe schema changes and instant branching.",
    monogram: "PS", authType: "API key",
    useCases: [
      { title: "Automate Deploy Requests", description: "Create a deploy request automatically when a migration PR gets merged.", command: "personas run \"Create a deploy request for the feature-auth branch\"" },
      { title: "Review Schema Changes", description: "Check pending deploy requests for risky schema changes before they go live.", command: "personas run \"Review schema changes in deploy request #42\"" },
      { title: "Monitor Connection Pools", description: "Track connection pool usage and suggest when to scale up or down.", command: "personas run \"Show connection pool usage for the last 24 hours\"" },
    ],
  },
  {
    name: "duckdb", label: "DuckDB", color: "#FFC107", category: "database",
    summary: "Analyze CSV, Parquet, and JSON files with fast SQL queries.",
    monogram: "Dk", authType: "File location",
    useCases: [
      { title: "Analyze CSV Reports", description: "Load CSV files and run analytical queries for weekly business reports.", command: "personas run \"Analyze sales.csv and show revenue by region\"" },
      { title: "Explore Parquet Files", description: "Scan Parquet files and generate summary statistics across all columns.", command: "personas run \"Summarize all columns in the events Parquet dataset\"" },
      { title: "Join Multiple Data Sources", description: "Combine data from CSV, JSON, and Parquet files into a single result set.", command: "personas run \"Join sales.csv with products.json and export as Parquet\"" },
    ],
  },
  {
    name: "convex", label: "Convex", color: "#F97316", category: "database",
    summary: "Build real-time apps with Convex's database, functions, and scheduling.",
    monogram: "Cx", authType: "API key",
    useCases: [
      { title: "Monitor Function Performance", description: "Track how fast your Convex functions run and get alerted when they slow down.", command: "personas run \"Alert when any function takes longer than 500ms\"" },
      { title: "Audit Scheduled Jobs", description: "See all your scheduled jobs, how often they run, and whether they're succeeding.", command: "personas run \"List all scheduled jobs and their status\"" },
      { title: "Sync Data to a Warehouse", description: "Set up a live sync from Convex tables to your analytics warehouse.", command: "personas run \"Sync the events table to the analytics warehouse\"" },
    ],
  },
  {
    name: "notion", label: "Notion", color: "#9B9A97", category: "database",
    summary: "Create pages, manage databases, and organize your team's knowledge.",
    monogram: "Nt", authType: "API key",
    useCases: [
      { title: "Auto-Create Meeting Pages", description: "Generate a Notion page with an agenda template for each upcoming meeting.", command: "personas run \"Create meeting pages from tomorrow's calendar\"" },
      { title: "Build a Sprint Board", description: "Turn your Linear issues into a Notion kanban board for sprint planning.", command: "personas run \"Create a sprint board from the current Linear cycle\"" },
      { title: "Search Your Knowledge Base", description: "Find relevant documentation across all your Notion workspaces instantly.", command: "personas run \"Search engineering docs for deployment process\"" },
    ],
  },
  {
    name: "upstash", label: "Upstash", color: "#00E9A3", category: "database",
    summary: "Use serverless Redis and Kafka for fast, edge-ready data.",
    monogram: "Up", authType: "API key",
    useCases: [
      { title: "Review Rate Limiting", description: "See which API endpoints are hitting rate limits and spot abusive traffic.", command: "personas run \"Show rate limit stats for the last 24 hours\"" },
      { title: "Monitor Kafka Lag", description: "Track consumer lag across topics and get alerted when processing falls behind.", command: "personas run \"Alert when Kafka consumer lag exceeds 10,000\"" },
      { title: "Pre-Warm the Cache", description: "Load frequently accessed data into edge caches before a traffic spike.", command: "personas run \"Warm up edge cache with popular routes\"" },
    ],
  },

  // ── Cloud & Hosting ───────────────────────────────────────────────
  {
    name: "vercel", label: "Vercel", color: "#ffffff", category: "devops",
    summary: "Deploy websites, run serverless functions, and manage preview environments.",
    monogram: "Vc", authType: "Access token",
    useCases: [
      { title: "Share Preview Links", description: "Post preview deployment URLs to your PR and Slack when builds finish.", command: "personas run \"Share preview links for my-app in #deploys\"" },
      { title: "Check Performance Scores", description: "Run Lighthouse audits on preview deployments and block merging if scores drop.", command: "personas run \"Check Lighthouse scores for my-app previews (min 90)\"" },
      { title: "Sync Environment Variables", description: "Keep environment variables in sync across preview, staging, and production.", command: "personas run \"Sync env vars from production to staging for my-app\"" },
    ],
  },
  {
    name: "netlify", label: "Netlify", color: "#00C7B7", category: "devops",
    summary: "Deploy sites, handle forms, and run serverless functions with ease.",
    monogram: "Nf", authType: "Access token",
    useCases: [
      { title: "Alert on Build Failures", description: "Get notified with detailed logs when a deploy build fails.", command: "personas run \"Alert #deploys when my-site builds fail\"" },
      { title: "Export Form Submissions", description: "Save form submissions to a spreadsheet automatically every day.", command: "personas run \"Export contact form submissions to CSV daily\"" },
      { title: "Track Bandwidth Usage", description: "Monitor bandwidth across all sites and get warned before hitting plan limits.", command: "personas run \"Alert when bandwidth reaches 80% of plan limit\"" },
    ],
  },
  {
    name: "cloudflare", label: "Cloudflare", color: "#F38020", category: "devops",
    summary: "Manage DNS, run edge workers, and protect your site from attacks.",
    monogram: "CF", authType: "API key",
    useCases: [
      { title: "Audit DNS Records", description: "Find misconfigured or orphaned DNS records and get a cleanup plan.", command: "personas run \"Audit DNS records for example.com\"" },
      { title: "Check Worker Performance", description: "See which Workers are slow or throwing errors and get optimization tips.", command: "personas run \"Show Worker performance stats for example.com over 7 days\"" },
      { title: "Monitor Security Threats", description: "Watch for blocked threats and escalate serious patterns to your security team.", command: "personas run \"Alert on high-severity security events for example.com\"" },
    ],
  },

  // ── Productivity ───────────────────────────────────────────────────
  {
    name: "clickup", label: "ClickUp", color: "#7B68EE", category: "productivity",
    summary: "Manage tasks, track time, set goals, and keep projects on track.",
    monogram: "CU", authType: "Access token",
    useCases: [
      { title: "Find Overdue Tasks", description: "Spot all overdue tasks across workspaces and nudge the people responsible.", command: "personas run \"Find overdue tasks and notify assignees\"" },
      { title: "Summarize Time Tracking", description: "See how each team member's logged hours compare to their estimates this week.", command: "personas run \"Show weekly time tracking summary for the team\"" },
      { title: "Update Goal Progress", description: "Recalculate goal completion based on the tasks that have been finished.", command: "personas run \"Update Q1 OKR progress based on completed tasks\"" },
    ],
  },
  {
    name: "monday", label: "Monday.com", color: "#FF3D57", category: "productivity",
    summary: "Run projects, automate workflows, and keep your whole team aligned.",
    monogram: "Mo", authType: "API key",
    useCases: [
      { title: "Send a Morning Status Digest", description: "Share a summary of item statuses, blockers, and deadlines every morning.", command: "personas run \"Post sprint board status digest to #standups\"" },
      { title: "Sync Client Project Boards", description: "Keep client-facing boards up to date when internal engineering milestones are hit.", command: "personas run \"Sync engineering milestones to client portal board\"" },
      { title: "Check Team Workloads", description: "Spot team members who are overloaded and suggest how to rebalance work.", command: "personas run \"Check workload balance on the sprint board\"" },
    ],
  },
  {
    name: "airtable", label: "Airtable", color: "#18BFFF", category: "productivity",
    summary: "Organize data, track projects, and build workflows in a flexible spreadsheet-database.",
    monogram: "At", authType: "Access token",
    useCases: [
      { title: "Sync Your Content Calendar", description: "Push content calendar entries to scheduling tools and remind writers of deadlines.", command: "personas run \"Sync content calendar and notify writers\"" },
      { title: "Track Inventory Levels", description: "Update stock levels from supplier feeds and flag items that are running low.", command: "personas run \"Update inventory and flag items below 10 in stock\"" },
      { title: "Move Applicants Through Hiring", description: "Advance candidates through hiring stages and send automated status emails.", command: "personas run \"Process hiring pipeline for new candidates\"" },
    ],
  },
  {
    name: "calendly", label: "Calendly", color: "#006BFF", category: "productivity",
    summary: "Automate scheduling, send reminders, and follow up on meetings.",
    monogram: "Ca", authType: "Access token",
    useCases: [
      { title: "Prepare for Meetings", description: "Get a brief with attendee info and context before each meeting.", command: "personas run \"Prep briefing for sales calls in the next 24 hours\"" },
      { title: "Follow Up on No-Shows", description: "Automatically send a rescheduling link when someone misses their appointment.", command: "personas run \"Send rescheduling links for missed consultations\"" },
      { title: "Find Your Best Meeting Times", description: "Analyze booking patterns and suggest the times that work best for you.", command: "personas run \"Suggest optimal meeting times based on last 30 days\"" },
    ],
  },
  {
    name: "dropbox", label: "Dropbox", color: "#0061FF", category: "productivity",
    summary: "Sync files, manage shared links, and keep your cloud storage organized.",
    monogram: "Dx", authType: "Access token",
    useCases: [
      { title: "Auto-Organize Uploads", description: "Sort uploaded files into the right folders based on their type and content.", command: "personas run \"Organize uploads by file type\"" },
      { title: "Audit Shared Links", description: "Find shared links with too-broad access and revoke ones that have expired.", command: "personas run \"Audit shared links and revoke expired ones\"" },
      { title: "Verify Backups", description: "Confirm critical folders are synced and flag any missing or corrupted files.", command: "personas run \"Verify backup integrity for critical folders\"" },
    ],
  },

  // ── Analytics ──────────────────────────────────────────────────────
  {
    name: "posthog", label: "PostHog", color: "#F9BD2B", category: "analytics",
    summary: "Track user behavior, run experiments, and manage feature flags.",
    monogram: "PH", authType: "API key",
    useCases: [
      { title: "Clean Up Old Feature Flags", description: "Find feature flags that have been fully rolled out for 30+ days and should be removed from code.", command: "personas run \"Find stale feature flags rolled out for 30+ days\"" },
      { title: "Analyze Funnel Drop-Offs", description: "See where users are dropping off in your funnels and which steps need attention.", command: "personas run \"Analyze the signup funnel for drop-off points\"" },
      { title: "Summarize A/B Test Results", description: "Get a statistical summary of running experiments with a recommendation on the winner.", command: "personas run \"Summarize the onboarding-v2 experiment results\"" },
    ],
  },
  {
    name: "mixpanel", label: "Mixpanel", color: "#7856FF", category: "analytics",
    summary: "Understand user engagement with retention reports, funnels, and journey maps.",
    monogram: "Mx", authType: "API key",
    useCases: [
      { title: "Generate Retention Reports", description: "See how well you're keeping users over time with weekly cohort tables.", command: "personas run \"Show weekly retention cohorts for the last 12 weeks\"" },
      { title: "Audit Event Naming", description: "Find inconsistencies in your event names and suggest a cleaner taxonomy.", command: "personas run \"Audit event naming consistency\"" },
      { title: "Map User Journeys", description: "Trace the most common paths users take through your product.", command: "personas run \"Show the top 10 most common user journeys\"" },
    ],
  },
  {
    name: "twilio_segment", label: "Segment", color: "#52BD94", category: "analytics",
    summary: "Collect, clean, and route customer data to all your tools.",
    monogram: "Se", authType: "API key", icon: "segment",
    useCases: [
      { title: "Check Source Health", description: "Make sure all your data sources are sending events and get alerted when they stop.", command: "personas run \"Alert when any source stops sending events for 1 hour\"" },
      { title: "Find Schema Violations", description: "Catch events that don't match your tracking plan and see what needs fixing.", command: "personas run \"Show events violating the tracking plan schema\"" },
      { title: "Verify Destination Delivery", description: "Confirm all destinations are receiving events correctly and flag any failures.", command: "personas run \"Check delivery status for all destinations\"" },
    ],
  },

  // ── Monitoring ─────────────────────────────────────────────────────
  {
    name: "sentry", label: "Sentry", color: "#8B5CF6", category: "monitoring",
    summary: "Monitor errors, track performance, and get alerted when things break.",
    monogram: "Sy", authType: "Access token",
    useCases: [
      { title: "Catch Error Spikes", description: "Detect sudden jumps in errors and automatically create a ticket with the stack trace.", command: "personas run \"Alert and create a Jira ticket when error rate spikes 200%\"" },
      { title: "Compare Release Health", description: "See if the latest release is crashing more than the previous one.", command: "personas run \"Compare crash rates between the latest and previous releases\"" },
      { title: "Send a Daily Bug Digest", description: "Get a daily summary of new unhandled exceptions grouped by issue.", command: "personas run \"Send daily exception digest to #bugs\"" },
    ],
  },
  {
    name: "betterstack", label: "Better Stack", color: "#E5484D", category: "monitoring",
    summary: "Monitor uptime, manage incidents, and keep your status page updated.",
    monogram: "BS", authType: "API key",
    useCases: [
      { title: "Generate SLA Reports", description: "Create monthly uptime reports showing SLA compliance for all your services.", command: "personas run \"Generate monthly SLA report\"" },
      { title: "Write Post-Mortems", description: "Compile incident timelines, screenshots, and resolution steps into a structured report.", command: "personas run \"Create post-mortem for incident #1234\"" },
      { title: "Auto-Update Status Page", description: "Automatically update your public status page when monitors detect an outage.", command: "personas run \"Sync monitor status to the public status page\"" },
    ],
  },

  // ── CRM ────────────────────────────────────────────────────────────
  {
    name: "hubspot", label: "HubSpot", color: "#FF7A59", category: "crm",
    summary: "Manage contacts, track deals, and automate your sales pipeline.",
    monogram: "HS", authType: "Access token",
    useCases: [
      { title: "Update Lead Scores", description: "Recalculate lead scores based on recent engagement so your team focuses on the right contacts.", command: "personas run \"Recalculate lead scores based on recent engagement\"" },
      { title: "Report on the Sales Pipeline", description: "Get a weekly summary of deal stages, progress, and forecasted revenue.", command: "personas run \"Show weekly pipeline report with revenue forecast\"" },
      { title: "Find Duplicate Contacts", description: "Scan for duplicate contacts using fuzzy matching and merge them.", command: "personas run \"Find and merge duplicate contacts (dry run)\"" },
    ],
  },

  // ── Design ─────────────────────────────────────────────────────────
  {
    name: "figma", label: "Figma", color: "#F24E1E", category: "creativity",
    summary: "Track design changes, sync handoffs, and manage design reviews.",
    monogram: "Fg", authType: "Access token",
    useCases: [
      { title: "Export Design Tokens", description: "Pull colors, spacing, and typography from Figma and sync them to your codebase.", command: "personas run \"Export design tokens from design-system as CSS variables\"" },
      { title: "Audit Component Usage", description: "Find detached or outdated component instances across all your Figma files.", command: "personas run \"Audit component usage in the design system project\"" },
      { title: "Compare Design Versions", description: "Highlight visual differences between the current and previous design versions.", command: "personas run \"Compare app-screens against the previous version\"" },
    ],
  },

  // ── Social ─────────────────────────────────────────────────────────
  {
    name: "buffer", label: "Buffer", color: "#168EEA", category: "social",
    summary: "Schedule social media posts, track engagement, and find your best posting times.",
    monogram: "Bu", authType: "Access token",
    useCases: [
      { title: "Fill Your Post Queue", description: "Automatically add approved content to your publishing queue for the week.", command: "personas run \"Add 7 posts from the content database to the queue\"" },
      { title: "Get an Engagement Report", description: "See how your posts performed across all connected social profiles this week.", command: "personas run \"Show weekly engagement across all profiles\"" },
      { title: "Optimize Posting Times", description: "Analyze past performance and reschedule queued posts to the best times for engagement.", command: "personas run \"Reschedule queued posts to optimal times based on 90-day data\"" },
    ],
  },
];
