"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";

type FAQItem = {
  question: string;
  answer: string;
  illustration: ReactNode;
};

/* ── Inline SVG illustrations ─────────────────────────────────────────── */

function TerminalIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-term-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.08" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-term-bg)" />
      {/* Terminal window */}
      <rect x="40" y="30" width="240" height="120" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
      {/* Title bar */}
      <rect x="40" y="30" width="240" height="24" rx="8" fill="rgba(6,182,212,0.06)" />
      <circle cx="56" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      <circle cx="68" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      <circle cx="80" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      {/* Command lines */}
      <text x="56" y="74" fill="#06b6d4" opacity="0.7" fontSize="11" fontFamily="monospace">$ claude --version</text>
      <text x="56" y="92" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="monospace">claude v3.2.1</text>
      <text x="56" y="116" fill="#06b6d4" opacity="0.7" fontSize="11" fontFamily="monospace">$ personas start</text>
      <text x="56" y="134" fill="#34d399" opacity="0.6" fontSize="11" fontFamily="monospace">✓ 3 agents running</text>
    </svg>
  );
}

function ShieldIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-shield-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.06" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="faq-shield-fill" x1="160" y1="30" x2="160" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.15" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-shield-bg)" />
      {/* Shield shape */}
      <path d="M160 28 L210 50 V100 C210 130 185 148 160 155 C135 148 110 130 110 100 V50 Z" fill="url(#faq-shield-fill)" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />
      {/* Lock icon inside shield */}
      <rect x="148" y="82" width="24" height="18" rx="3" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M153 82 V76 C153 72.134 156.134 69 160 69 C163.866 69 167 72.134 167 76 V82" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="160" cy="91" r="2" fill="#34d399" opacity="0.6" />
      {/* Zero telemetry labels */}
      <text x="60" y="80" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">NO ANALYTICS</text>
      <text x="60" y="96" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">NO TRACKING</text>
      <text x="222" y="80" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">LOCAL ONLY</text>
      <text x="222" y="96" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">YOUR DATA</text>
    </svg>
  );
}

function PricingIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-price-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" stopOpacity="0.06" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-price-bg)" />
      {/* Tier cards */}
      {/* Free */}
      <rect x="30" y="45" width="75" height="95" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
      <text x="67" y="68" fill="#34d399" opacity="0.7" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Free</text>
      <text x="67" y="85" fill="rgba(255,255,255,0.3)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$0</text>
      <rect x="42" y="98" width="51" height="3" rx="1.5" fill="rgba(52,211,153,0.15)" />
      <rect x="42" y="108" width="38" height="3" rx="1.5" fill="rgba(52,211,153,0.1)" />
      <rect x="42" y="118" width="45" height="3" rx="1.5" fill="rgba(52,211,153,0.1)" />
      {/* Starter */}
      <rect x="122" y="45" width="75" height="95" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
      <text x="159" y="68" fill="#06b6d4" opacity="0.7" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Starter</text>
      <text x="159" y="85" fill="rgba(255,255,255,0.3)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$19</text>
      <rect x="134" y="98" width="51" height="3" rx="1.5" fill="rgba(6,182,212,0.15)" />
      <rect x="134" y="108" width="38" height="3" rx="1.5" fill="rgba(6,182,212,0.1)" />
      <rect x="134" y="118" width="45" height="3" rx="1.5" fill="rgba(6,182,212,0.1)" />
      {/* Pro */}
      <rect x="214" y="38" width="75" height="102" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" />
      <text x="251" y="61" fill="#a855f7" opacity="0.8" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Pro</text>
      <text x="251" y="78" fill="rgba(255,255,255,0.4)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$49</text>
      <rect x="226" y="91" width="51" height="3" rx="1.5" fill="rgba(168,85,247,0.2)" />
      <rect x="226" y="101" width="38" height="3" rx="1.5" fill="rgba(168,85,247,0.15)" />
      <rect x="226" y="111" width="45" height="3" rx="1.5" fill="rgba(168,85,247,0.15)" />
      <rect x="226" y="121" width="30" height="3" rx="1.5" fill="rgba(168,85,247,0.1)" />
    </svg>
  );
}

function CloudInfraIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-byoi-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.06" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-byoi-bg)" />
      {/* Cloud shape */}
      <path d="M180 55 C180 42 192 32 206 32 C216 32 224 38 228 46 C230 45 233 44 236 44 C246 44 254 52 254 62 C254 72 246 80 236 80 H150 C140 80 132 72 132 62 C132 54 137 47 145 45 C147 48 153 42 160 42 C168 42 175 47 180 55 Z" fill="rgba(6,182,212,0.08)" stroke="#06b6d4" strokeOpacity="0.3" strokeWidth="1" />
      {/* Connection lines to infrastructure nodes */}
      <line x1="160" y1="80" x2="100" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="190" y1="80" x2="160" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="220" y1="80" x2="220" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      {/* Infrastructure nodes */}
      <rect x="82" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="100" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">Fly.io</text>
      <rect x="142" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="160" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">AWS</text>
      <rect x="202" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="220" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">GCP</text>
      {/* "Your account" label */}
      <text x="160" y="170" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" textAnchor="middle">YOUR INFRASTRUCTURE</text>
    </svg>
  );
}

function LocalCloudIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-lc-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.05" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-lc-bg)" />
      {/* Divider */}
      <line x1="160" y1="30" x2="160" y2="155" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      {/* Local side */}
      <text x="80" y="42" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">LOCAL</text>
      {/* Monitor icon */}
      <rect x="55" y="55" width="50" height="35" rx="4" fill="none" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />
      <rect x="60" y="59" width="40" height="24" rx="2" fill="rgba(52,211,153,0.06)" />
      <rect x="73" y="90" width="14" height="4" rx="1" fill="rgba(52,211,153,0.15)" />
      <rect x="67" y="94" width="26" height="2" rx="1" fill="rgba(52,211,153,0.1)" />
      {/* Local features */}
      <text x="80" y="115" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Private</text>
      <text x="80" y="128" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Free</text>
      <text x="80" y="141" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Instant</text>
      {/* Cloud side */}
      <text x="240" y="42" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">CLOUD</text>
      {/* Cloud shape */}
      <path d="M255 68 C255 60 262 53 271 53 C277 53 282 57 284 62 C285 61 287 60 289 60 C295 60 300 65 300 71 C300 77 295 82 289 82 H225 C219 82 214 77 214 71 C214 66 217 62 222 61 C223 63 227 58 232 58 C238 58 244 62 255 68 Z" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1" />
      {/* Cloud features */}
      <text x="240" y="100" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ 24/7</text>
      <text x="240" y="113" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Teams</text>
      <text x="240" y="126" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Scaling</text>
      {/* Toggle indicator */}
      <rect x="138" y="155" width="44" height="16" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx="152" cy="163" r="5" fill="#34d399" opacity="0.4" />
    </svg>
  );
}

function AgentGridIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-grid-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.05" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-grid-bg)" />
      {/* Grid of agent nodes */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const cx = 60 + col * 50;
          const cy = 40 + row * 36;
          const isActive = (row + col) % 3 !== 0;
          const color = col < 2 ? "#06b6d4" : col < 4 ? "#a855f7" : "#34d399";
          return (
            <g key={`${row}-${col}`}>
              <circle cx={cx} cy={cy} r="10" fill={isActive ? `${color}` : "rgba(255,255,255,0.02)"} fillOpacity={isActive ? 0.08 : 1} stroke={color} strokeOpacity={isActive ? 0.3 : 0.08} strokeWidth="1" />
              {isActive && <circle cx={cx} cy={cy} r="3" fill={color} opacity="0.4" />}
            </g>
          );
        })
      )}
      {/* ∞ symbol */}
      <text x="160" y="175" fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="500">UNLIMITED LOCAL AGENTS</text>
    </svg>
  );
}

/* ── FAQ data ─────────────────────────────────────────────────────────── */

const faqs: FAQItem[] = [
  {
    question: "What is Claude CLI and why do I need it?",
    answer:
      "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally — it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.",
    illustration: <TerminalIllustration />,
  },
  {
    question: "Does Personas collect any telemetry or usage data?",
    answer:
      "No. Personas runs entirely on your machine with zero telemetry. We don't collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution.",
    illustration: <ShieldIllustration />,
  },
  {
    question: "How does the pricing model work?",
    answer:
      "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription — we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine.",
    illustration: <PricingIllustration />,
  },
  {
    question: "What is Bring Your Own Infrastructure (BYOI)?",
    answer:
      "BYOI lets you connect your own cloud provider credentials (e.g., Fly.io API tokens) instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps — you only pay your cloud provider directly.",
    illustration: <CloudInfraIllustration />,
  },
  {
    question: "What's the difference between local and cloud execution?",
    answer:
      "Local execution runs agents on your machine using Claude CLI — it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration. You can switch between modes per-agent.",
    illustration: <LocalCloudIllustration />,
  },
  {
    question: "Are there any limits on the number of agents?",
    answer:
      "Locally, there are no limits — create as many agents as you want. Cloud plans have worker limits (1–5 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.",
    illustration: <AgentGridIllustration />,
  },
];

function FAQCard({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={fadeUp}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left cursor-pointer group"
      >
        <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm font-medium leading-relaxed sm:text-base">
              {item.question}
            </h3>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={TRANSITION_FAST}
              className="shrink-0 mt-0.5"
            >
              <ChevronDown className="h-4 w-4 text-muted-dark transition-colors duration-300 group-hover:text-muted" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITION_NORMAL}
            className="overflow-hidden"
          >
            <div className="px-4 pb-1 pt-3">
              <div className="mb-4 overflow-hidden rounded-xl border border-white/6 bg-white/3">
                <div className="aspect-video w-full">
                  {item.illustration}
                </div>
              </div>
              <p className="text-sm text-muted-dark leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const midpoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midpoint);
  const rightColumn = faqs.slice(midpoint);

  return (
    <SectionWrapper id="faq" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[10%] top-[30%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute right-[10%] bottom-[30%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)",
          }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Frequently{" "}
          <GradientText className="drop-shadow-lg">asked</GradientText>
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Everything you need to know about getting started with Personas.
        </p>
      </motion.div>

      {/* Two-column FAQ grid */}
      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-4 md:grid-cols-2"
      >
        <div className="space-y-4">
          {leftColumn.map((item, i) => (
            <FAQCard key={i} item={item} index={i} />
          ))}
        </div>
        <div className="space-y-4">
          {rightColumn.map((item, i) => (
            <FAQCard key={i + midpoint} item={item} index={i + midpoint} />
          ))}
        </div>
      </motion.div>

      {/* Discord CTA */}
      <motion.div variants={fadeUp} className="mt-14 text-center">
        <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 ring-1 ring-brand-purple/20">
            <MessageCircle className="h-5 w-5 text-brand-purple" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">Still have questions?</p>
            <p className="mt-1 text-xs text-muted-dark">
              Join our Discord community for help and discussion.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-sm font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15"
          >
            Join Discord
          </a>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
