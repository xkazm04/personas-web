"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, GitBranch, Sparkles, ArrowRight, ArrowDown,
  AlertTriangle, Brain, RefreshCw, Mail, ShieldAlert,
  Zap, MessageSquare,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import ImageBackground from "@/components/ImageBackground";
import { fadeUp, slideInLeft, slideInRight } from "@/lib/animations";
import type { ViewerRole } from "@/components/RoleSelector";

/* ── Scenario data ── */

type Scenario = {
  id: string;
  label: string;
  trigger: string;
  workflow: {
    steps: { text: string; status: "ok" | "warn" | "error" }[];
    result: string;
  };
  agent: {
    thoughts: string[];
    actions: string[];
    result: string;
  };
};

const scenarios: Scenario[] = [
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

const CYCLE_MS = 6000;

/* ── Workflow side (left panel) ── */

function WorkflowPanel({ scenario }: { scenario: Scenario }) {
  const statusColor = {
    ok: "text-brand-emerald/70",
    warn: "text-yellow-400/70",
    error: "text-brand-rose/70",
  };
  const statusBg = {
    ok: "bg-brand-emerald/10 ring-brand-emerald/10",
    warn: "bg-yellow-400/10 ring-yellow-400/10",
    error: "bg-brand-rose/10 ring-brand-rose/10",
  };
  const statusIcon = {
    ok: Check,
    warn: AlertTriangle,
    error: X,
  };

  return (
    <div className="space-y-3">
      {scenario.workflow.steps.map((step, i) => {
        const Icon = statusIcon[step.status];
        return (
          <motion.div
            key={`${scenario.id}-w-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ${statusBg[step.status]}`}>
              <Icon className={`h-3 w-3 ${statusColor[step.status]}`} />
            </div>
            <span className={`text-base leading-relaxed ${step.status === "error" ? "text-brand-rose/70 line-through decoration-brand-rose/30" : "text-muted"}`}>
              {step.text}
            </span>
          </motion.div>
        );
      })}

      {/* Result */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: scenario.workflow.steps.length * 0.15 + 0.1, duration: 0.3 }}
        className="mt-4 rounded-xl border border-brand-rose/10 bg-brand-rose/5 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-3 w-3 text-brand-rose/60" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-rose/70">Result</span>
        </div>
        <p className="text-base text-brand-rose/80 leading-relaxed">{scenario.workflow.result}</p>
      </motion.div>
    </div>
  );
}

/* ── Agent side (right panel) ── */

function AgentPanel({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-3">
      {/* Thought bubbles */}
      {scenario.agent.thoughts.map((thought, i) => (
        <motion.div
          key={`${scenario.id}-t-${i}`}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: i * 0.2, duration: 0.35 }}
          className="flex items-start gap-2.5"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-purple/10 ring-1 ring-brand-purple/10">
            <Brain className="h-3 w-3 text-brand-purple/70" />
          </div>
          <span className="text-base text-muted leading-relaxed italic">
            &ldquo;{thought}&rdquo;
          </span>
        </motion.div>
      ))}

      {/* Action steps */}
      {scenario.agent.actions.map((action, i) => (
        <motion.div
          key={`${scenario.id}-a-${i}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ delay: scenario.agent.thoughts.length * 0.2 + i * 0.12, duration: 0.3 }}
          className="flex items-start gap-2.5"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-cyan/10 ring-1 ring-brand-cyan/10">
            <Zap className="h-3 w-3 text-brand-cyan/70" />
          </div>
          <span className="text-base text-muted leading-relaxed">{action}</span>
        </motion.div>
      ))}

      {/* Result */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          delay: scenario.agent.thoughts.length * 0.2 + scenario.agent.actions.length * 0.12 + 0.1,
          duration: 0.3,
        }}
        className="mt-4 rounded-xl border border-brand-emerald/10 bg-brand-emerald/5 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Check className="h-3 w-3 text-brand-emerald/60" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-emerald/70">Result</span>
        </div>
        <p className="text-base text-brand-emerald/80 leading-relaxed">{scenario.agent.result}</p>
      </motion.div>
    </div>
  );
}

/* ── Shared comparison card shell ── */

type ComparisonCardProps = {
  variant: import("framer-motion").Variants;
  texture: string;
  className: string;
  color: { orb: string; line: string; grid: string; corner: string; iconBg: string; iconRing: string; iconText: string; subtitle: string };
  cornerPosition: "top-left" | "bottom-right";
  extraOrbs?: React.ReactNode;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const ComparisonCard = memo(function ComparisonCard({ variant, texture, className, color, cornerPosition, extraOrbs, icon: Icon, title, subtitle, children }: ComparisonCardProps) {
  return (
    <motion.div
      variants={variant}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className={`${texture} group rounded-2xl p-4 md:p-6 relative overflow-hidden transition-[border-color,opacity] duration-500 will-change-transform ${className}`}
    >
      {/* Blur orb */}
      <div className={`pointer-events-none absolute h-40 w-40 rounded-full blur-3xl ${color.orb}`} />
      {extraOrbs}
      {/* Bottom accent line */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${color.line}`} />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(${color.grid} 1px, transparent 1px), linear-gradient(90deg, ${color.grid} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Corner accent */}
      {cornerPosition === "top-left" ? (
        <div className="pointer-events-none absolute top-0 left-0 w-10 h-10">
          <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r to-transparent ${color.corner}`} />
          <div className={`absolute top-0 left-0 h-full w-px bg-linear-to-b to-transparent ${color.corner}`} />
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10">
          <div className={`absolute bottom-0 right-0 w-full h-px bg-linear-to-l to-transparent ${color.corner}`} />
          <div className={`absolute bottom-0 right-0 h-full w-px bg-linear-to-t to-transparent ${color.corner}`} />
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.iconBg} ring-1 ${color.iconRing}`}
        >
          <Icon className={`h-5 w-5 ${color.iconText}`} />
        </motion.div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${color.subtitle}`}>{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.div>
  );
});

/* ── Memoized scenario content panels ── */

const WorkflowContent = memo(function WorkflowContent({ activeIndex, minHeight }: { activeIndex: number; minHeight: number }) {
  const scenario = scenarios[activeIndex];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario.id + "-wf"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ minHeight: minHeight || undefined }}
      >
        <WorkflowPanel scenario={scenario} />
      </motion.div>
    </AnimatePresence>
  );
});

const AgentContent = memo(function AgentContent({ activeIndex, minHeight }: { activeIndex: number; minHeight: number }) {
  const scenario = scenarios[activeIndex];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario.id + "-ag"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ minHeight: minHeight || undefined }}
      >
        <AgentPanel scenario={scenario} />
      </motion.div>
    </AnimatePresence>
  );
});

/* ── Main component ── */

/* ── Role-specific copy variants ── */

type RoleCopy = {
  tagline: string;
  subtitle: string;
  highlights: readonly string[];
};

const roleCopy: Record<ViewerRole, RoleCopy> = {
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

const defaultCopy = roleCopy["developer"];

// Min-heights are measured from the DOM at mount time via the hidden measurement
// container below. This avoids brittle magic-number constants that break when
// font size, line height, or spacing tokens change.

export default function WhyAgents({ role }: { role?: ViewerRole }) {
  const copy = role ? roleCopy[role] : defaultCopy;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [measuredWfHeight, setMeasuredWfHeight] = useState(0);
  const [measuredAgHeight, setMeasuredAgHeight] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure all scenarios off-screen on mount to get accurate max heights
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const wfPanels = el.querySelectorAll<HTMLElement>("[data-measure-wf]");
    const agPanels = el.querySelectorAll<HTMLElement>("[data-measure-ag]");
    let maxWf = 0;
    let maxAg = 0;
    wfPanels.forEach((p) => { maxWf = Math.max(maxWf, p.scrollHeight); });
    agPanels.forEach((p) => { maxAg = Math.max(maxAg, p.scrollHeight); });
    queueMicrotask(() => {
      if (maxWf > 0) setMeasuredWfHeight(maxWf);
      if (maxAg > 0) setMeasuredAgHeight(maxAg);
    });
  }, []);

  const wfMinH = measuredWfHeight;
  const agMinH = measuredAgHeight;

  const workflowChildren = useMemo(
    () => <WorkflowContent activeIndex={activeIndex} minHeight={wfMinH} />,
    [activeIndex, wfMinH],
  );
  const agentChildren = useMemo(
    () => <AgentContent activeIndex={activeIndex} minHeight={agMinH} />,
    [activeIndex, agMinH],
  );

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % scenarios.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(advance, CYCLE_MS);
    return () => clearInterval(timer);
  }, [paused, advance]);

  const scenario = scenarios[activeIndex];

  return (
    <SectionWrapper id="why-agents" className="relative overflow-hidden" aria-roledescription="carousel" aria-label="Why agents not workflows — scenario comparison">
      <ImageBackground
        src="/imgs/illustration_photo.jpg"
        alt="Personas agent roster"
        overlayClass="bg-black/70"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgIBBAMBAAAAAAAAAAAAAQIAAwQFERIhBjFBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAYEQADAQEAAAAAAAAAAAAAAAABAgMAEf/aAAwDAQACEQMRAD8AyTDw8nPyFx8WprLG6KoJLH4BLPp3h+T6ULaW/wBJZX1sVh7XjuIiVeli5Ef/2Q=="
      />

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={copy.tagline}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-xl italic text-muted-dark mb-8 font-light tracking-wide"
          >
            {copy.tagline}
          </motion.p>
        </AnimatePresence>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Why agents, <span className="font-black text-brand-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">not</span> <GradientText className="drop-shadow-lg">workflows</GradientText>
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={copy.subtitle}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light"
          >
            {copy.subtitle}
          </motion.p>
        </AnimatePresence>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={role ?? "developer"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {copy.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-mono tracking-wider text-muted backdrop-blur-sm transition-colors hover:bg-white/8 hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scenario selector */}
      <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-2">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setActiveIndex(i); setPaused(true); }}
            aria-pressed={i === activeIndex}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-mono tracking-wider transition-all duration-300 ${
              i === activeIndex
                ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "border-white/[0.06] bg-white/[0.02] text-muted-dark hover:border-white/[0.12] hover:text-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </motion.div>

      {/* Scenario trigger */}
      <div aria-live="polite" aria-atomic="true" className="mt-6 mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id + "-trigger"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Mail className="h-3 w-3 text-muted-dark" aria-hidden="true" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Incoming scenario</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{scenario.trigger}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side-by-side duel panels */}
      <div
        className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8 relative"
        role="group"
        aria-label={`Scenario ${activeIndex + 1} of ${scenarios.length}: ${scenario.label}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* VS divider — desktop only */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-background shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 rounded-full border border-brand-cyan/10 animate-glow-border" />
            <ArrowRight className="h-4 w-4 text-brand-cyan" />
          </div>
        </div>

        {/* Connector line — desktop only */}
        <div className="hidden md:block absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 bg-linear-to-b from-transparent via-white/4 to-transparent" />

        {/* Workflow (left) */}
        <ComparisonCard
          variant={slideInLeft}
          texture="stripes"
          className="border border-white/8 bg-linear-to-br from-white/6 to-white/2 backdrop-blur-lg hover:border-white/12"
          color={{
            orb: "-right-20 -top-20 bg-brand-rose/4",
            line: "via-brand-rose/8",
            grid: "rgba(244,63,94,0.08)",
            corner: "from-brand-rose/10",
            iconBg: "bg-brand-rose/10",
            iconRing: "ring-brand-rose/6",
            iconText: "text-brand-rose",
            subtitle: "text-brand-rose/70",
          }}
          cornerPosition="top-left"
          icon={GitBranch}
          title="Traditional Workflow"
          subtitle="Deterministic pipeline"
        >
          {workflowChildren}
        </ComparisonCard>

        {/* Mobile divider */}
        <div className="mt-2 mb-2 flex items-center gap-3 md:hidden">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/6 to-transparent" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-background/80">
            <ArrowDown className="h-3.5 w-3.5 text-brand-cyan" />
          </div>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/6 to-transparent" />
        </div>

        {/* Agent (right) */}
        <ComparisonCard
          variant={slideInRight}
          texture="dots"
          className="border border-brand-cyan/15 bg-linear-to-br from-brand-cyan/8 to-white/2 backdrop-blur-lg shadow-[0_0_80px_rgba(6,182,212,0.04)] hover:border-brand-cyan/20 hover:shadow-[0_0_100px_rgba(6,182,212,0.06)]"
          color={{
            orb: "-left-20 -bottom-20 bg-brand-cyan/4",
            line: "via-brand-cyan/10",
            grid: "rgba(6,182,212,0.08)",
            corner: "from-brand-cyan/10",
            iconBg: "bg-brand-cyan/10",
            iconRing: "ring-brand-cyan/8 shadow-[0_0_15px_rgba(6,182,212,0.08)]",
            iconText: "text-brand-cyan",
            subtitle: "text-brand-cyan/70",
          }}
          cornerPosition="bottom-right"
          extraOrbs={<div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-purple/3 blur-3xl" />}
          icon={Sparkles}
          title="Personas Agent"
          subtitle="Reasoning engine"
        >
          {agentChildren}
        </ComparisonCard>
      </div>

      {/* Progress bar */}
      <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
        <div className="flex gap-1.5">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setActiveIndex(i); setPaused(true); }}
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.06] overflow-hidden"
            >
              {i === activeIndex && !paused && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  key={`progress-${scenario.id}-${activeIndex}`}
                />
              )}
              {i === activeIndex && paused && (
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
              )}
              {i < activeIndex && (
                <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-dark">
          <span>Scenario {activeIndex + 1} of {scenarios.length}</span>
          <button
            onClick={() => setPaused((v) => !v)}
            className="cursor-pointer flex items-center gap-1.5 transition-colors hover:text-muted-dark"
          >
            {paused ? (
              <>
                <RefreshCw className="h-3 w-3" />
                Resume auto-play
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3" />
                Auto-cycling
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Hidden measurement container — renders all scenarios to capture max heights */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-50 w-full overflow-hidden opacity-0"
        style={{ visibility: "hidden" }}
      >
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div>
            {scenarios.map((s) => (
              <div key={s.id + "-mw"} data-measure-wf>
                <WorkflowPanel scenario={s} />
              </div>
            ))}
          </div>
          <div>
            {scenarios.map((s) => (
              <div key={s.id + "-ma"} data-measure-ag>
                <AgentPanel scenario={s} />
              </div>
            ))}
          </div>
        </div>
      </div>

    </SectionWrapper>
  );
}
