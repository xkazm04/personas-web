"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Github, GitBranch, Workflow, Monitor, Globe } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

const targets = [
  {
    icon: Monitor, name: "Local Desktop", color: "#06b6d4", badge: "Free forever",
    desc: "Run agents on your machine with zero latency. System tray, desktop notifications, auto-updater.",
    features: ["System tray with context menu", "Pause/resume from tray", "Auto-updater via GitHub Releases", "Window state persistence"],
  },
  {
    icon: Cloud, name: "Cloud Orchestrator", color: "#a855f7", badge: "Pro / Team",
    desc: "Deploy to 24/7 cloud workers. Event bus bridging, execution polling, human reviews queue.",
    features: ["Webhook-based job dispatch", "Cloud trigger management", "Execution stats & metrics", "Webhook relay monitoring"],
  },
  {
    icon: Github, name: "GitHub Actions", color: "#34d399", badge: "Built-in",
    desc: "Export personas as GitHub Action workflows. Repository dispatch events with run tracking.",
    features: ["Auto-generate workflow YAML", "Repository dispatch triggers", "Run history & retry", "Status tracking"],
  },
  {
    icon: GitBranch, name: "GitLab CI/CD", color: "#f43f5e", badge: "Built-in",
    desc: "Export as GitLab CI pipeline YAML. Auto-commit to repo, trigger pipelines, manage projects.",
    features: ["Pipeline YAML generation", "Auto-commit to repo", "Project listing & triggers", "Token management"],
  },
  {
    icon: Workflow, name: "n8n Workflows", color: "#fbbf24", badge: "Built-in",
    desc: "Bidirectional n8n integration. Import workflows as personas, or trigger n8n from agents.",
    features: ["Import workflow JSON", "Trigger n8n from agents", "Session management", "Node-to-tool mapping"],
  },
  {
    icon: Globe, name: "Peer Network", color: "#60a5fa", badge: "Experimental",
    desc: "Connect Personas instances over local network. Discover peers, establish trust, share configs.",
    features: ["Auto-discovery on LAN", "Trust & permission model", "Peer health monitoring", "Team connections"],
  },
];

export default function DeployTargets() {
  const [activeTarget, setActiveTarget] = useState<number | null>(null);

  return (
    <SectionWrapper id="deploy">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Deploy{" "}
            <GradientText className="drop-shadow-lg">everywhere</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Same agent, six deployment targets. Run locally for free, scale to cloud,
          <span className="text-white/80 font-medium"> export as CI/CD pipelines</span>, or connect peer-to-peer.
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl">
        {targets.map((t, i) => {
          const isActive = activeTarget === i;
          return (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              onMouseEnter={() => setActiveTarget(i)}
              onMouseLeave={() => setActiveTarget(null)}
              whileHover={{ scale: 1.03, y: -6 }}
              className={`group relative rounded-2xl border overflow-hidden p-6 backdrop-blur-sm transition-all duration-400 cursor-default ${
                isActive
                  ? "border-white/20 bg-white/6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
                  : "border-white/6 bg-white/2"
              }`}
            >
              {/* Top glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% -20%, ${t.color}10, transparent 60%)` }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300"
                    style={{ backgroundColor: `${t.color}${isActive ? "22" : "12"}` }}
                  >
                    <t.icon
                      className="h-5 w-5 transition-all duration-300"
                      style={{
                        color: t.color,
                        filter: isActive ? `drop-shadow(0 0 6px ${t.color}60)` : undefined,
                        transform: isActive ? "scale(1.1)" : undefined,
                      }}
                    />
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                    isActive ? "border-white/15 bg-white/8 text-white/50" : "border-white/8 bg-white/3 text-white/30"
                  }`}>
                    {t.badge}
                  </span>
                </div>

                <div className="text-base font-semibold text-white/90">{t.name}</div>
                <div className="mt-2 text-xs text-muted-dark leading-relaxed">{t.desc}</div>

                {/* Features list with expand */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-1.5 border-t border-white/4 pt-3">
                        {t.features.map((f, j) => (
                          <motion.div
                            key={f}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.05 }}
                            className="flex items-center gap-2 text-[11px] text-white/50"
                          >
                            <div className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            {f}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
