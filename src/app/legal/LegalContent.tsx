"use client";

import { useState, useEffect, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, Cookie, Mail, type LucideIcon } from "lucide-react";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";
import PrivacyPolicy from "./policies/PrivacyPolicy";
import TermsOfService from "./policies/TermsOfService";
import CookiePolicy from "./policies/CookiePolicy";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "cookies", label: "Cookie Policy", icon: Cookie },
];

type TabId = "privacy" | "terms" | "cookies";

const TAB_CONTENT: Record<TabId, ComponentType> = {
  privacy: PrivacyPolicy,
  terms: TermsOfService,
  cookies: CookiePolicy,
};

function getInitialTab(): TabId {
  if (typeof window === "undefined") return "privacy";
  const hash = window.location.hash.replace("#", "");
  if (TABS.some((t) => t.id === hash)) return hash as TabId;
  return "privacy";
}

export default function LegalContent() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  useEffect(() => {
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
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-base font-medium transition-colors ${
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
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-base font-medium text-muted-dark transition-colors hover:border-white/[0.15] hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
          legal@personas.ai
        </a>
      </div>
    </main>
  );
}
