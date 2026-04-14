import type { ChatScenario } from "./types";

export const CYCLE_MS = 6000;
export const MSG_INTERVAL_MS = 800;

export const scenarios: ChatScenario[] = [
  {
    id: "ambiguous-email",
    name: "Ambiguous Request",
    userMessage:
      "Cancel my order #4821... actually, never mind, just change the shipping address to 742 Evergreen Terrace.",
    workflow: {
      messages: [
        { sender: "bot", text: "Processing cancellation for order #4821...", tone: "neutral", timestamp: "0:01" },
        { sender: "bot", text: "Order #4821 found. Initiating cancellation workflow.", tone: "neutral", timestamp: "0:03" },
        { sender: "system", text: "WARNING: I detected conflicting instructions. I can't understand what you actually want.", tone: "warning", timestamp: "0:05" },
        { sender: "bot", text: "I can only handle one thing at a time. Please create a new request for the address change.", tone: "error", timestamp: "0:08" },
        { sender: "system", text: "Transferred to our team. Expected wait: 47 minutes.", tone: "error", timestamp: "0:10" },
      ],
      satisfaction: 2,
    },
    agent: {
      messages: [
        { sender: "bot", text: "I see you initially mentioned cancelling, but then corrected yourself. Let me focus on your actual request.", tone: "thinking", timestamp: "0:01" },
        { sender: "bot", text: "Updating shipping address for order #4821 to 742 Evergreen Terrace.", tone: "neutral", timestamp: "0:02" },
        { sender: "bot", text: "Address updated successfully. Your order will ship to the new address tomorrow.", tone: "success", timestamp: "0:04" },
        { sender: "system", text: "RESOLVED. Confirmation email sent.", tone: "success", timestamp: "0:04" },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "split-refund",
    name: "Split Refund",
    userMessage: "I need a refund for order #7733. I paid $40 with a gift card and $60 with my Visa.",
    workflow: {
      messages: [
        { sender: "bot", text: "Looking up order #7733 for refund processing.", tone: "neutral", timestamp: "0:01" },
        { sender: "bot", text: "Order found. Initiating refund to original payment method.", tone: "neutral", timestamp: "0:03" },
        { sender: "system", text: "ERROR: I found two payment methods but I can't split refunds.", tone: "error", timestamp: "0:06" },
        { sender: "bot", text: "I can't handle split refunds. Creating a help request for you.", tone: "error", timestamp: "0:09" },
        { sender: "system", text: "Sent to our finance team. This will take about 3 business days.", tone: "error", timestamp: "0:12" },
      ],
      satisfaction: 2,
    },
    agent: {
      messages: [
        { sender: "bot", text: "I see this order used two payment methods. Let me calculate the correct split refund.", tone: "thinking", timestamp: "0:01" },
        { sender: "bot", text: "Refunding $40.00 to your gift card balance...", tone: "neutral", timestamp: "0:03" },
        { sender: "bot", text: "Refunding $60.00 to your Visa ending in 4242...", tone: "neutral", timestamp: "0:04" },
        { sender: "bot", text: "Both refunds processed! Gift card balance available now, Visa refund in 2-3 days.", tone: "success", timestamp: "0:06" },
        { sender: "system", text: "RESOLVED. Refund confirmation sent to email.", tone: "success", timestamp: "0:06" },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "staging-env",
    name: "Staging Setup",
    userMessage:
      "Set up a staging environment identical to production but with debug logging enabled for all 12 services.",
    workflow: {
      messages: [
        { sender: "bot", text: "Found the 'create environment' template. Copying production setup.", tone: "neutral", timestamp: "0:02" },
        { sender: "bot", text: "Production config cloned. Applying debug logging flag.", tone: "neutral", timestamp: "0:05" },
        { sender: "system", text: "WARNING: 12 connected services each need separate changes.", tone: "warning", timestamp: "0:08" },
        { sender: "system", text: "ERROR: Too many possible combinations (47 paths). I can't figure this out.", tone: "error", timestamp: "0:14" },
        { sender: "bot", text: "Only partially done. 6 of 12 services are broken. Someone needs to fix them manually.", tone: "error", timestamp: "0:18" },
      ],
      satisfaction: 1,
    },
    agent: {
      messages: [
        { sender: "bot", text: "I'll enumerate all 12 production services first, then modify each config systematically.", tone: "thinking", timestamp: "0:02" },
        { sender: "bot", text: "Cloning configs for all 12 services with debug logging overrides applied.", tone: "neutral", timestamp: "0:05" },
        { sender: "bot", text: "Deploying services sequentially with health checks after each...", tone: "neutral", timestamp: "0:08" },
        { sender: "bot", text: "All 12 services deployed and verified healthy. Debug logging active across the board.", tone: "success", timestamp: "0:12" },
        { sender: "system", text: "RESOLVED. Full staging environment ready in 90 seconds.", tone: "success", timestamp: "0:12" },
      ],
      satisfaction: 5,
    },
  },
  {
    id: "batch-error",
    name: "Batch Recovery",
    userMessage:
      "The payment API just returned a 503 error in the middle of processing 200 transactions. Fix this.",
    workflow: {
      messages: [
        { sender: "bot", text: "Checking batch status. 147 of 200 transactions processed successfully.", tone: "neutral", timestamp: "0:02" },
        { sender: "system", text: "ERROR: Transaction #148 failed — the server is down. Trying again (attempt 1 of 3)...", tone: "error", timestamp: "0:05" },
        { sender: "system", text: "ERROR: All 3 retries failed. The server is still down.", tone: "error", timestamp: "0:12" },
        { sender: "bot", text: "All retries failed. Undoing everything — even the 147 transactions that worked.", tone: "error", timestamp: "0:15" },
        { sender: "system", text: "FAILED. All 200 transactions undone. Someone needs to redo everything manually.", tone: "error", timestamp: "0:18" },
      ],
      satisfaction: 1,
    },
    agent: {
      messages: [
        { sender: "bot", text: "The server is temporarily down. I'll save my progress at transaction #147 — no need to redo those.", tone: "thinking", timestamp: "0:02" },
        { sender: "bot", text: "Waiting a few seconds before trying #148 again...", tone: "neutral", timestamp: "0:05" },
        { sender: "bot", text: "Provider is back online. Resuming batch from transaction #148.", tone: "neutral", timestamp: "0:11" },
        { sender: "bot", text: "All 200 transactions processed successfully. Zero data loss.", tone: "success", timestamp: "0:16" },
        { sender: "system", text: "RESOLVED. All 200 transactions done. Progress was saved so nothing was wasted.", tone: "success", timestamp: "0:16" },
      ],
      satisfaction: 5,
    },
  },
];
