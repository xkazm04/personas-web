"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, Cookie, Mail } from "lucide-react";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";

const TABS = [
  { id: "privacy", label: "Privacy Policy", icon: Shield, hash: "#privacy" },
  { id: "terms", label: "Terms of Service", icon: FileText, hash: "#terms" },
  { id: "cookies", label: "Cookie Policy", icon: Cookie, hash: "#cookies" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function getInitialTab(): TabId {
  if (typeof window === "undefined") return "privacy";
  const hash = window.location.hash.replace("#", "");
  if (TABS.some((t) => t.id === hash)) return hash as TabId;
  return "privacy";
}

/* ── Privacy Policy ──────────────────────────────────────────────── */
function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Our Commitment to Privacy</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Personas is built on a simple principle: your data belongs to you. Our desktop app is local-first with zero telemetry by default. We do not collect, transmit, or analyze your usage data unless you explicitly opt in to cloud features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">What the Desktop App Stores</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Everything the Personas desktop app creates &mdash; your agents, pipelines, execution history, and configuration &mdash; lives on your local machine. None of this data is transmitted to our servers or any third party.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">How Credentials Are Protected</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          API keys and secrets you add to Personas are encrypted at rest using AES-256-GCM and stored in your operating system&apos;s keyring. They never leave your device &mdash; not even when you use cloud features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">What We Collect for Cloud Features</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          If you sign in with Google OAuth to use cloud features, we store your email address and basic profile information through Supabase (our authentication provider). Paid cloud tiers may store agent execution metadata on our servers to enable scheduling and remote execution.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Website Analytics</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          This website collects basic, anonymous page-view analytics to help us understand which pages are useful. We do not track individual users, build advertising profiles, or sell data to third parties.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-dark">
          <li><strong className="text-foreground/80">Supabase</strong> &mdash; authentication and cloud data storage</li>
          <li><strong className="text-foreground/80">Sentry</strong> &mdash; error tracking on this website only (not in the desktop app)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          You can request access to, correction of, or deletion of any personal data we hold at any time. You can also export all of your local data directly from the desktop app. To exercise these rights, contact us at{" "}
          <a href="mailto:legal@personas.ai" className="text-brand-cyan hover:underline">legal@personas.ai</a>.
        </p>
      </section>
    </div>
  );
}

/* ── Terms of Service ────────────────────────────────────────────── */
function TermsOfService() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Acceptance of Terms</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          By downloading, installing, or using Personas, you agree to these terms. If you do not agree, please do not use the software. We may update these terms from time to time &mdash; continued use after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Description of Service</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Personas is a desktop application for building and orchestrating AI agent pipelines. The core app is free and runs entirely on your machine. Optional paid cloud tiers provide remote execution, scheduling, and team collaboration features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">User Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-dark">
          <li>You must hold your own valid subscriptions to any AI providers you connect (e.g., Anthropic, OpenAI) and comply with their terms of service.</li>
          <li>You are responsible for the content your agents produce and the actions they take.</li>
          <li>You agree not to use Personas for any unlawful purpose or in violation of any applicable laws.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Your agents, pipelines, prompts, and data are yours. Personas does not claim any ownership or license over content you create with the software. The Personas application, brand, and website content remain our intellectual property.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Personas is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from the use of the software, including but not limited to data loss, service interruptions, or actions taken by AI agents you configure. Your use of third-party AI services is governed by their respective terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Termination</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          You may stop using Personas at any time. For cloud features, we may suspend or terminate your account if you violate these terms. Upon termination, your local data remains on your device; cloud data will be deleted within 30 days upon request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          We may revise these terms at any time by posting the updated version on this page. Material changes will be communicated via the app or email. The &ldquo;last updated&rdquo; date at the top indicates the latest revision.
        </p>
      </section>
    </div>
  );
}

/* ── Cookie Policy ───────────────────────────────────────────────── */
function CookiePolicy() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Our Approach to Cookies</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          We use the bare minimum. This website sets only essential cookies required for the site to function. We do not use advertising cookies, tracking pixels, or fingerprinting of any kind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Essential Cookies We Use</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-dark">
          <li><strong className="text-foreground/80">Authentication session</strong> &mdash; keeps you signed in when using cloud features (set by Supabase)</li>
          <li><strong className="text-foreground/80">Theme preference</strong> &mdash; remembers your chosen color theme across visits</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">What We Do Not Use</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-dark">
          <li>No advertising or remarketing cookies</li>
          <li>No cross-site tracking</li>
          <li>No social media tracking pixels</li>
          <li>No analytics cookies that identify individual users</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Third-Party Cookies</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          Supabase, our authentication provider, may set cookies necessary for the OAuth sign-in flow. These are strictly functional and are not used for tracking.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
        <p className="text-sm leading-relaxed text-muted-dark">
          You can clear or block cookies through your browser settings at any time. Note that disabling essential cookies may prevent cloud sign-in from working. For questions, reach out to{" "}
          <a href="mailto:legal@personas.ai" className="text-brand-cyan hover:underline">legal@personas.ai</a>.
        </p>
      </section>
    </div>
  );
}

/* ── Tab content map ─────────────────────────────────────────────── */
const TAB_CONTENT: Record<TabId, React.FC> = {
  privacy: PrivacyPolicy,
  terms: TermsOfService,
  cookies: CookiePolicy,
};

/* ── Main Component ──────────────────────────────────────────────── */
export default function LegalContent() {
  const [activeTab, setActiveTab] = useState<TabId>("privacy");

  /* Sync tab from URL hash on mount */
  useEffect(() => {
    setActiveTab(getInitialTab());
    const onHash = () => setActiveTab(getInitialTab());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function switchTab(id: TabId) {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const Content = TAB_CONTENT[activeTab];

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-32">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={TRANSITION_NORMAL}
        className="text-center"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Privacy & Terms
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-dark">
          Your data stays on your device. We believe privacy is a right, not a feature.
        </p>
      </motion.div>

      {/* Tab navigation */}
      <div className="mt-10 flex justify-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                  : "border-white/[0.08] bg-white/[0.02] text-muted-dark hover:border-white/[0.15] hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TRANSITION_NORMAL}
          >
            <Content />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact footer */}
      <div className="mt-8 text-center">
        <a
          href="mailto:legal@personas.ai"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-muted-dark transition-colors hover:border-white/[0.15] hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
          legal@personas.ai
        </a>
      </div>
    </main>
  );
}
