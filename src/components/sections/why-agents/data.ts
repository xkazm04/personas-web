import type { Scenario, RoleCopyMap } from "./types";

export const CYCLE_MS = 6000;

export const scenarios: Scenario[] = [
  {
    id: "unexpected-input",
    label: "Unexpected Input",
    trigger: "Ambiguous email arrives: \"Cancel my order... actually, change the address instead.\"",
    workflow: {
      steps: [
        { text: "Parse intent → \"cancel\"", status: "ok" },
        { text: "Route to cancellation flow", status: "ok" },
        { text: "Detect conflicting intent", status: "warn" },
        { text: "No branch for \"change mind\"", status: "error" },
        { text: "Flow halted — manual review", status: "error" },
      ],
      result: "Stuck in queue. Customer waits hours.",
    },
    agent: {
      thoughts: [
        "Customer initially says cancel but corrects to address change",
        "Final intent is clear: update shipping address",
        "I should confirm the change and ignore the cancellation",
      ],
      actions: [
        "Read full email context",
        "Identify corrected intent",
        "Call address update API",
        "Send confirmation email",
      ],
      result: "Resolved in 4 seconds. Customer delighted.",
    },
  },
  {
    id: "edge-case",
    label: "Edge Case",
    trigger: "Customer requests refund for an item bought with a gift card + credit card split payment.",
    workflow: {
      steps: [
        { text: "Look up order payment method", status: "ok" },
        { text: "Route to refund handler", status: "ok" },
        { text: "Detect split payment", status: "warn" },
        { text: "No split-refund connector", status: "error" },
        { text: "Exception thrown — ticket created", status: "error" },
      ],
      result: "Escalated to finance. 3-day resolution.",
    },
    agent: {
      thoughts: [
        "This order used two payment methods — gift card and credit card",
        "I need to calculate proportional refund amounts",
        "Gift card portion goes back to gift card balance, credit to card",
      ],
      actions: [
        "Calculate $40 gift card / $60 credit split",
        "Refund $40 to gift card balance",
        "Refund $60 to credit card",
        "Notify customer with breakdown",
      ],
      result: "Both refunds processed instantly.",
    },
  },
  {
    id: "multi-step",
    label: "Multi-step Reasoning",
    trigger: "\"Set up a staging environment identical to production but with debug logging.\"",
    workflow: {
      steps: [
        { text: "Match template: \"create environment\"", status: "ok" },
        { text: "Clone production config", status: "ok" },
        { text: "Apply debug logging flag", status: "warn" },
        { text: "12 dependent services need reconfiguration", status: "error" },
        { text: "Branch explosion — 47 conditionals", status: "error" },
      ],
      result: "Partial deploy. 6 services misconfigured.",
    },
    agent: {
      thoughts: [
        "Staging needs to mirror prod — I'll enumerate all services first",
        "Debug logging requires config changes across 12 services",
        "I should modify each service config systematically and verify",
      ],
      actions: [
        "Inventory all 12 production services",
        "Clone configs with debug overrides",
        "Deploy sequentially with health checks",
        "Verify all services healthy",
      ],
      result: "Full staging environment in 90 seconds.",
    },
  },
  {
    id: "error-recovery",
    label: "Error Recovery",
    trigger: "API call to payment provider returns 503 during a batch of 200 transactions.",
    workflow: {
      steps: [
        { text: "Begin batch processing", status: "ok" },
        { text: "Process transactions 1–147", status: "ok" },
        { text: "Transaction 148: 503 error", status: "error" },
        { text: "Retry logic: 3 attempts failed", status: "error" },
        { text: "Entire batch marked failed", status: "error" },
      ],
      result: "147 successful transactions rolled back.",
    },
    agent: {
      thoughts: [
        "503 means temporary outage — I should wait and retry smartly",
        "Transactions 1–147 succeeded, no need to redo those",
        "I'll exponential-backoff on 148+ and resume from where I stopped",
      ],
      actions: [
        "Save checkpoint at transaction 147",
        "Wait 5s, retry transaction 148",
        "Provider back online — continue batch",
        "Complete remaining 53 transactions",
      ],
      result: "All 200 transactions processed. Zero data loss.",
    },
  },
  {
    id: "context-dependent",
    label: "Context-dependent Decision",
    trigger: "VIP customer asks for a discount, but they already have a special rate from 2023.",
    workflow: {
      steps: [
        { text: "Customer type: VIP ✓", status: "ok" },
        { text: "Check discount eligibility", status: "ok" },
        { text: "Existing discount detected", status: "warn" },
        { text: "Conflict: can't stack discounts", status: "error" },
        { text: "No rule for VIP + legacy rate", status: "error" },
      ],
      result: "Request denied. Customer escalates to manager.",
    },
    agent: {
      thoughts: [
        "This VIP already has a legacy 2023 rate — unusual case",
        "Their current rate is actually better than the standard VIP discount",
        "I should explain this clearly so they feel valued, not rejected",
      ],
      actions: [
        "Compare legacy rate vs new VIP discount",
        "Legacy rate is 22% off vs standard 15%",
        "Compose personalized response",
        "Offer loyalty bonus instead",
      ],
      result: "Customer keeps better rate + gets loyalty perk.",
    },
  },
];

export const roleCopy: RoleCopyMap = {
  developer: {
    tagline: "What if your workflows could think?",
    subtitle:
      "Traditional workflow engines execute deterministic A→B→C pipelines. Personas agents reason, adapt, and coordinate — right from your terminal.",
    highlights: [
      "Replace branch-heavy YAML with a single prompt",
      "Agent loops handle retries and edge cases natively",
      "Ship in hours, not sprint cycles",
    ],
  },
  "product-manager": {
    tagline: "What if your automation never needed a ticket?",
    subtitle:
      "Workflow builders force you to anticipate every edge case upfront. Personas agents adapt on the fly — no flowchart maintenance required.",
    highlights: [
      "Visual outcome dashboards, not debug logs",
      "Zero-code configuration for common patterns",
      "Agents self-heal — fewer escalations to engineering",
    ],
  },
  enterprise: {
    tagline: "What if your operations scaled without headcount?",
    subtitle:
      "Rigid RPA breaks when processes change. Personas agents observe, reason, and act within your security perimeter — with full audit trails.",
    highlights: [
      "SOC 2 audit trails on every decision",
      "Horizontal scaling with zero branch explosion",
      "99.9% uptime SLA with automatic failover",
    ],
  },
};

export const defaultCopy = roleCopy["developer"];
