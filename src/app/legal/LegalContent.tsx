"use client";

import { useState, useEffect, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, Cookie, Mail, type LucideIcon } from "lucide-react";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";
import PrivacyPolicy from "./policies/PrivacyPolicy";
import TermsOfService from "./policies/TermsOfService";
import CookiePolicy from "./policies/CookiePolicy";
import PolicyChangelog from "./PolicyChangelog";
import {
  hasUnseenUpdate,
  readLastSeen,
  writeLastSeen,
  type PolicyId,
} from "@/data/policy-changelog";

type TabId = PolicyId;

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "cookies", label: "Cookie Policy", icon: Cookie },
];

type PolicyComponentProps = { changelog?: React.ReactNode };

const TAB_CONTENT: Record<TabId, ComponentType<PolicyComponentProps>> = {
  privacy: PrivacyPolicy,
  terms: TermsOfService,
  cookies: CookiePolicy,
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitialTab(): TabId {
  if (typeof window === "undefined") return "privacy";
  const hash = window.location.hash.replace("#", "");
  if (TABS.some((t) => t.id === hash)) return hash as TabId;
  return "privacy";
}

export default function LegalContent() {
  // SSR renders "privacy" so the client's first paint matches; the real hash
  // is synced into state in the mount effect below to avoid hydration mismatch
  // on direct deep-links like /legal#cookies.
  const [activeTab, setActiveTab] = useState<TabId>("privacy");
  // Captured once on mount: which policies were unseen at first view. Drives the
  // changelog "New" pill + auto-expand. Stays stable so the visual cue persists
  // for the duration of the session even after we mark seen in localStorage.
  const [initiallyUnseen, setInitiallyUnseen] = useState<Set<PolicyId>>(() => new Set());
  // Live set of tabs that should still show the "Updated" tab badge. Shrinks
  // to nothing as the user activates each tab.
  const [pendingBadges, setPendingBadges] = useState<Set<PolicyId>>(() => new Set());

  useEffect(() => {
    const initial = getInitialTab();
    const t = setTimeout(() => {
      if (initial !== "privacy") setActiveTab(initial);
      const unseen = new Set<PolicyId>();
      (TABS.map((tab) => tab.id) as PolicyId[]).forEach((pid) => {
        if (hasUnseenUpdate(pid, readLastSeen(pid))) unseen.add(pid);
      });
      setInitiallyUnseen(unseen);
      const pending = new Set(unseen);
      pending.delete(initial);
      setPendingBadges(pending);
      writeLastSeen(initial, todayIso());
    }, 0);
    return () => clearTimeout(t);
    // Mount-only hydration; reads hash post-mount so SSR/client agree.
  }, []);

  useEffect(() => {
    const onHash = () => {
      const newTab = getInitialTab();
      setActiveTab(newTab);
      writeLastSeen(newTab, todayIso());
      setPendingBadges((prev) => {
        if (!prev.has(newTab)) return prev;
        const next = new Set(prev);
        next.delete(newTab);
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function switchTab(id: TabId) {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
    writeLastSeen(id, todayIso());
    setPendingBadges((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
        <p className="mt-3 text-base leading-relaxed text-muted-dark">
          Your data stays on your device. We believe privacy is a right, not a
          feature.
        </p>
      </motion.div>

      {/* Tab navigation */}
      <div className="mt-10 flex justify-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = pendingBadges.has(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`relative inline-flex items-center gap-2 rounded-full border px-5 py-2 text-base font-medium transition-colors ${
                isActive
                  ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                  : "border-glass-hover bg-white/[0.02] text-muted-dark hover:border-glass-strong hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {showBadge && (
                <span
                  className="ml-1 rounded-full bg-brand-cyan/15 px-2 py-0.5 text-xs font-medium text-brand-cyan"
                  aria-label="Updated since your last visit"
                >
                  Updated
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-10 rounded-2xl border border-glass bg-white/[0.02] p-8 backdrop-blur-sm sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TRANSITION_NORMAL}
          >
            <Content
              changelog={
                <PolicyChangelog
                  policyId={activeTab}
                  hasUnseenUpdate={initiallyUnseen.has(activeTab)}
                />
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact footer */}
      <div className="mt-8 text-center">
        <a
          href="mailto:legal@personas.ai"
          className="inline-flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.02] px-6 py-2.5 text-base font-medium text-muted-dark transition-colors hover:border-glass-strong hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
          legal@personas.ai
        </a>
      </div>
    </main>
  );
}
