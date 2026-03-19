"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Shield, Key, RefreshCw, Eye, Lock, Fingerprint, CheckCircle } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import CinematicBg from "@/components/todo/CinematicBg";
import { fadeUp, staggerContainer } from "@/lib/animations";

const vaultLayers = [
  { icon: Lock, label: "AES-256-GCM at rest", desc: "Every credential encrypted before touching disk", color: "#f43f5e" },
  { icon: Fingerprint, label: "OS Keyring integration", desc: "Windows Credential Manager, macOS Keychain, Linux Secret Service", color: "#a855f7" },
  { icon: Key, label: "RSA-2048 + AES transport", desc: "Hybrid encryption for every IPC call between frontend and backend", color: "#06b6d4" },
  { icon: RefreshCw, label: "Auto-rotation policies", desc: "Schedule credential rotation, auto-refresh OAuth tokens before expiry", color: "#fbbf24" },
  { icon: Eye, label: "Auto-Credential Browser", desc: "Playwright-powered semi-automated OAuth flow — Claude guides you through login", color: "#34d399" },
  { icon: Shield, label: "Audit trail", desc: "Every credential access, modification, and usage logged with full provenance", color: "#60a5fa" },
];

interface VaultEntry {
  key: string;
  provider: string;
  age: string;
  health: "healthy" | "rotating" | "warning";
  encrypted: boolean;
}

const initialEntries: VaultEntry[] = [
  { key: "GITHUB_TOKEN", provider: "GitHub", age: "12d", health: "healthy", encrypted: true },
  { key: "SLACK_BOT_TOKEN", provider: "Slack", age: "3d", health: "healthy", encrypted: true },
  { key: "STRIPE_SECRET", provider: "Stripe", age: "45d", health: "rotating", encrypted: true },
  { key: "POSTGRES_URL", provider: "Neon", age: "90d", health: "warning", encrypted: true },
  { key: "OPENAI_KEY", provider: "OpenAI", age: "7d", health: "healthy", encrypted: true },
];

export default function CredentialVault() {
  const prefersReducedMotion = useReducedMotion();
  const [entries, setEntries] = useState(initialEntries);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Simulate live vault activity
  const tick = useCallback(() => {
    setEntries(prev => {
      const next = [...prev];
      const idx = Math.floor(Math.random() * next.length);
      const entry = { ...next[idx] };
      // Sometimes rotate health
      if (entry.health === "rotating" && Math.random() < 0.3) {
        entry.health = "healthy";
        entry.age = "0d";
      } else if (entry.health === "warning" && Math.random() < 0.2) {
        entry.health = "rotating";
      }
      next[idx] = entry;
      return next;
    });
    const idx = Math.floor(Math.random() * initialEntries.length);
    setFlashIdx(idx);
    setTimeout(() => setFlashIdx(null), 800);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 4000 + Math.random() * 3000;
      timerRef.current = setTimeout(() => { tick(); schedule(); }, delay);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [tick, prefersReducedMotion]);

  const healthDot = (h: string) =>
    h === "healthy" ? "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.6)]" :
    h === "rotating" ? "bg-brand-amber shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse" :
    "bg-brand-rose shadow-[0_0_6px_rgba(244,63,94,0.6)]";

  const healthLabel = (h: string) =>
    h === "healthy" ? "text-brand-emerald/70" :
    h === "rotating" ? "text-brand-amber/70" :
    "text-brand-rose/70";

  return (
    <SectionWrapper id="vault" className="relative overflow-hidden">
      <CinematicBg src="/imgs/features/vault.png" alt="Futuristic vault door with neon encryption patterns" opacity={72} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center relative z-10">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Zero-trust{" "}
            <GradientText className="drop-shadow-lg">credential vault</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Military-grade encryption for every API key, OAuth token, and database password.
          <span className="text-white/80 font-medium"> 40+ built-in connectors</span> with one-click setup.
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2 relative z-10">
        {/* Left: live vault terminal */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]"
        >
          <TerminalChrome title="credential-vault" status="sealed" info={`${entries.filter(e => e.health === "healthy").length}/${entries.length} healthy`} className="px-5 py-3" />
          <div className="p-5 space-y-2">
            <AnimatePresence mode="popLayout">
              {entries.map((cred, i) => (
                <motion.div
                  key={cred.key}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.04)" }}
                  className={`relative flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-500 overflow-hidden ${
                    flashIdx === i
                      ? "border-brand-cyan/30 bg-brand-cyan/5"
                      : "border-white/4 bg-white/2"
                  }`}
                >
                  {/* Encryption shimmer on flash */}
                  {flashIdx === i && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 w-1/3 bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent"
                    />
                  )}
                  <div className="flex items-center gap-3 relative">
                    <motion.div
                      animate={flashIdx === i ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Lock className="h-3 w-3 text-brand-rose/60" />
                    </motion.div>
                    <span className="text-xs font-mono text-white/70">{cred.key}</span>
                    <span className="hidden sm:inline text-[10px] text-muted-dark">{cred.provider}</span>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <span className={`text-[9px] font-mono ${healthLabel(cred.health)}`}>{cred.health}</span>
                    <span className="text-[10px] font-mono text-white/25">{cred.age}</span>
                    <div className={`h-2 w-2 rounded-full ${healthDot(cred.health)}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center justify-between border-t border-white/4 pt-3 mt-4 text-[10px] font-mono text-white/20">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-brand-emerald/50" />
                {entries.length} credentials sealed
              </span>
              <span className="text-brand-emerald/40">PBKDF2-600k · AES-256-GCM</span>
            </div>
          </div>
        </motion.div>

        {/* Right: interactive security layers */}
        <div className="space-y-3">
          {vaultLayers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onMouseEnter={() => setActiveLayer(i)}
              onMouseLeave={() => setActiveLayer(null)}
              whileHover={{ scale: 1.02, x: 4 }}
              className={`group relative flex items-start gap-4 overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all duration-400 cursor-default ${
                activeLayer === i
                  ? "border-white/20 bg-white/6 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
                  : "border-white/6 bg-white/2"
              }`}
            >
              {/* Active glow */}
              {activeLayer === i && (
                <motion.div
                  layoutId="vault-layer-glow"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `radial-gradient(circle at 20% 50%, ${layer.color}08, transparent 70%)` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300"
                style={{ backgroundColor: `${layer.color}${activeLayer === i ? "20" : "12"}` }}
              >
                <layer.icon
                  className="h-5 w-5 transition-transform duration-300"
                  style={{ color: layer.color, transform: activeLayer === i ? "scale(1.1)" : undefined }}
                />
              </div>
              <div className="relative">
                <div className="text-sm font-medium text-white/90">{layer.label}</div>
                <motion.div
                  initial={false}
                  animate={{ height: activeLayer === i ? "auto" : "1.25rem", opacity: activeLayer === i ? 1 : 0.6 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 text-xs text-muted-dark leading-relaxed">{layer.desc}</div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
