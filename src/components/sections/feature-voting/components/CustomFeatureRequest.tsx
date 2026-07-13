"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ExternalLink,
  Lightbulb,
  Loader2,
  Rocket,
  Send,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackFeatureRequest } from "@/lib/analytics";
import { useTranslation } from "@/i18n/useTranslation";
import { KOFI_USERNAME } from "../data";

const MAX_LENGTH = 1000;

export default function CustomFeatureRequest() {
  const reduced = useReducedMotion() ?? false;
  const { t } = useTranslation();
  const r = t.featureVoting.request;
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const text = value.trim();
    if (!text || saving) return;
    setSaving(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch {
      setSaving(false);
      setError(r.errorNetwork);
      return;
    }

    if (!res.ok) {
      setSaving(false);
      if (res.status === 429) {
        setError(r.errorRateLimit);
      } else if (res.status === 400) {
        setError(r.errorInvalid);
      } else {
        setError(r.errorGeneric);
      }
      return;
    }

    trackFeatureRequest(text);
    setSubmitted(true);
    setValue("");
    setSaving(false);
  };

  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-glass bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-glass-hover">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cyan/8 ring-1 ring-brand-cyan/15">
              <Lightbulb className="h-4 w-4 text-brand-cyan/70" />
            </div>
            <div>
              <h4 className="text-base font-semibold">{r.title}</h4>
              <p className="text-base text-muted-dark font-mono tracking-wide">
                {r.subtitle}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                maxLength={MAX_LENGTH}
                disabled={saving}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (submitted) setSubmitted(false);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSubmit();
                }}
                placeholder={r.placeholder}
                className="w-full rounded-xl border border-glass bg-white/[0.02] px-4 py-2.5 text-base text-foreground placeholder:text-muted-dark outline-none transition-all duration-300 focus:border-brand-cyan/25 focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(6,182,212,0.06)] disabled:opacity-60"
              />
              <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-cyan/0 to-transparent transition-all duration-300 peer-focus:via-brand-cyan/20" />
            </div>
            <button
              onClick={() => void handleSubmit()}
              disabled={saving || (!value.trim() && !submitted)}
              aria-label={r.submitAria}
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
                submitted
                  ? "border-brand-emerald/30 bg-brand-emerald/15 text-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                  : value.trim()
                    ? "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-glass bg-white/[0.02] text-muted-dark"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : submitted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {submitted && !error && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-base text-brand-emerald/70 font-mono tracking-wide"
            >
              {r.success}
            </motion.p>
          )}

          {error && (
            <motion.p
              role="alert"
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-1.5 text-base text-brand-amber/80 font-mono tracking-wide"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </motion.p>
          )}

          {KOFI_USERNAME && (
            <div className="mt-3 flex items-center justify-end">
              <a
                href={`https://ko-fi.com/${KOFI_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-base font-mono text-muted-dark/60 hover:text-brand-cyan/70 transition-colors"
              >
                <Rocket className="h-3 w-3" />
                {r.sponsor}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
