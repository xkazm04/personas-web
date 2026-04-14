import type { Scenario } from "./types";

export const CYCLE_MS = 6000;
export const ANIMATION_DURATION_MS = 4000;

export const scenarios: Scenario[] = [
  {
    id: "ambiguous-email",
    name: "Ambiguous Email",
    trigger: '"Cancel my order... actually, change the address instead."',
    workflow: {
      steps: [
        { label: "Read the message", durationMs: 800, status: "ok" },
        { label: "Start cancellation process", durationMs: 900, status: "ok" },
        { label: "Notice conflicting instructions", durationMs: 700, status: "warn" },
        { label: "No rule for this situation", durationMs: 600, status: "error" },
        { label: "STUCK", durationMs: 0, status: "error" },
      ],
      totalMs: 3000,
      result: "Stuck. No one helps the customer for hours.",
    },
    agent: {
      steps: [
        { label: "Read full context", durationMs: 500, status: "ok" },
        { label: "Understand the real request", durationMs: 600, status: "ok" },
        { label: "Update the address", durationMs: 400, status: "ok" },
        { label: "Send confirmation", durationMs: 300, status: "ok" },
      ],
      totalMs: 1800,
      result: "Resolved in 4 seconds. Customer delighted.",
    },
  },
  {
    id: "split-payment",
    name: "Split Payment Refund",
    trigger: "Customer requests refund for item bought with gift card + credit card.",
    workflow: {
      steps: [
        { label: "Look up payment", durationMs: 700, status: "ok" },
        { label: "Send to refund system", durationMs: 800, status: "ok" },
        { label: "Find two payment methods", durationMs: 600, status: "warn" },
        { label: "Can't handle split refunds", durationMs: 500, status: "error" },
        { label: "System gives up", durationMs: 0, status: "error" },
      ],
      totalMs: 2600,
      result: "Handed off to finance team. Customer waits 3 days.",
    },
    agent: {
      steps: [
        { label: "Calculate $40/$60 split", durationMs: 400, status: "ok" },
        { label: "Refund to gift card", durationMs: 500, status: "ok" },
        { label: "Refund to credit card", durationMs: 500, status: "ok" },
        { label: "Notify customer", durationMs: 300, status: "ok" },
      ],
      totalMs: 1700,
      result: "Both refunds processed instantly.",
    },
  },
  {
    id: "staging-env",
    name: "Staging Setup",
    trigger: '"Set up staging identical to production but with debug logging."',
    workflow: {
      steps: [
        { label: "Find the 'create environment' template", durationMs: 600, status: "ok" },
        { label: "Copy production setup", durationMs: 900, status: "ok" },
        { label: "Turn on debugging", durationMs: 700, status: "warn" },
        { label: "12 services need manual changes", durationMs: 800, status: "error" },
        { label: "Too many paths to handle", durationMs: 0, status: "error" },
      ],
      totalMs: 3000,
      result: "Half-finished. 6 out of 12 services broken.",
    },
    agent: {
      steps: [
        { label: "List all 12 services", durationMs: 500, status: "ok" },
        { label: "Copy each with debugging on", durationMs: 600, status: "ok" },
        { label: "Deploy and verify each one", durationMs: 500, status: "ok" },
        { label: "Confirm everything works", durationMs: 300, status: "ok" },
      ],
      totalMs: 1900,
      result: "Full staging environment in 90 seconds.",
    },
  },
  {
    id: "batch-error",
    name: "Error Recovery",
    trigger: "API call returns 503 during a batch of 200 transactions.",
    workflow: {
      steps: [
        { label: "Start processing", durationMs: 600, status: "ok" },
        { label: "Process transactions 1 through 147", durationMs: 1000, status: "ok" },
        { label: "Transaction 148: server goes down", durationMs: 500, status: "error" },
        { label: "Three retries all fail", durationMs: 700, status: "error" },
        { label: "Everything gets undone", durationMs: 0, status: "error" },
      ],
      totalMs: 2800,
      result: "147 good transactions undone because of 1 failure.",
    },
    agent: {
      steps: [
        { label: "Save progress at 147", durationMs: 400, status: "ok" },
        { label: "Wait and try again", durationMs: 700, status: "ok" },
        { label: "Server recovers", durationMs: 400, status: "ok" },
        { label: "Finish the rest", durationMs: 500, status: "ok" },
      ],
      totalMs: 2000,
      result: "All 200 transactions processed. Zero data loss.",
    },
  },
  {
    id: "vip-discount",
    name: "VIP Legacy Discount",
    trigger: "VIP customer asks for a discount, but already has a special rate from 2023.",
    workflow: {
      steps: [
        { label: "Customer type: VIP", durationMs: 500, status: "ok" },
        { label: "Check discount eligibility", durationMs: 700, status: "ok" },
        { label: "Existing discount detected", durationMs: 600, status: "warn" },
        { label: "System can't combine discounts", durationMs: 500, status: "error" },
        { label: "No rule for this situation", durationMs: 0, status: "error" },
      ],
      totalMs: 2300,
      result: "Request denied. Frustrated customer asks for a manager.",
    },
    agent: {
      steps: [
        { label: "Compare legacy vs new VIP", durationMs: 500, status: "ok" },
        { label: "Legacy = 22% vs 15%", durationMs: 400, status: "ok" },
        { label: "Compose personal response", durationMs: 400, status: "ok" },
        { label: "Offer loyalty bonus", durationMs: 300, status: "ok" },
      ],
      totalMs: 1600,
      result: "Customer keeps better rate + gets loyalty perk.",
    },
  },
];
