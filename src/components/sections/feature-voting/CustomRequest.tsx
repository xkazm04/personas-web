"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, Check } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackFeatureRequest } from "@/lib/analytics";

export default function CustomRequest() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const text = value.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch {
      // Best-effort — still show confirmation
    }
    trackFeatureRequest(text);
    setSubmitted(true);
    setValue("");
    setSaving(false);
  };

  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.08]">
        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] grid-texture-md" />
        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cyan/8 ring-1 ring-brand-cyan/15">
              <Lightbulb className="h-4 w-4 text-brand-cyan/70" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Something else in mind?</h4>
              <p className="text-[11px] text-muted-dark/60 font-mono tracking-wide">
                Suggest a feature
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (submitted) setSubmitted(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSubmit();
                }}
                placeholder="Describe the feature you'd like to see..."
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-dark/40 outline-none transition-all duration-300 focus:border-brand-cyan/25 focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
              />
              {/* Focus glow accent under the input */}
              <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-cyan/0 to-transparent transition-all duration-300 peer-focus:via-brand-cyan/20" />
            </div>
            <button
              onClick={() => void handleSubmit()}
              disabled={saving || (!value.trim() && !submitted)}
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                submitted
                  ? "border-brand-emerald/30 bg-brand-emerald/15 text-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                  : value.trim()
                    ? "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-dark/30"
              }`}
            >
              {submitted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Submitted confirmation */}
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-brand-emerald/70 font-mono tracking-wide"
            >
              Thanks! Your suggestion has been recorded.
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
