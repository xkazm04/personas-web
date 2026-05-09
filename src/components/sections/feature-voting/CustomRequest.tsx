"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, Check, Loader2, AlertCircle } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackFeatureRequest } from "@/lib/analytics";

const MAX_LENGTH = 1000;
const COUNT_THRESHOLD = 0.6;

const MIN_ROWS = 2;
const MAX_ROWS = 8;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type Status = "idle" | "saving" | "submitted" | "error";

export default function CustomRequest() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: clamp scrollHeight between MIN_ROWS and MAX_ROWS line-heights.
  useIsoLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingY =
      parseFloat(getComputedStyle(el).paddingTop) +
      parseFloat(getComputedStyle(el).paddingBottom);
    const min = lineHeight * MIN_ROWS + paddingY;
    const max = lineHeight * MAX_ROWS + paddingY;
    const next = Math.max(min, Math.min(el.scrollHeight, max));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value]);

  const handleSubmit = async () => {
    const text = value.trim();
    if (!text || status === "saving") return;

    setStatus("saving");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          res.status === 429
            ? "Too many requests — give it a minute and try again."
            : "We couldn't save that. Please try again.",
        );
        return;
      }

      const data: { saved?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (data.saved !== true) {
        setStatus("error");
        setErrorMsg(data.error ?? "We couldn't save that. Please try again.");
        return;
      }

      trackFeatureRequest(text);
      setStatus("submitted");
      setValue("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again.");
    }
  };

  const submitted = status === "submitted";
  const saving = status === "saving";

  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] grid-texture-md" />
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

          <div className="flex items-end gap-2.5">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                rows={MIN_ROWS}
                maxLength={MAX_LENGTH}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (status === "submitted" || status === "error") {
                    setStatus("idle");
                    setErrorMsg(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Describe the feature you'd like to see..."
                className="block w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-dark/40 outline-none transition-all duration-300 focus:border-brand-cyan/25 focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
              />
              <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-cyan/0 to-transparent transition-all duration-300 peer-focus:via-brand-cyan/20" />
            </div>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving || (!value.trim() && !submitted)}
              aria-label="Submit feature request"
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                submitted
                  ? "border-brand-emerald/30 bg-brand-emerald/15 text-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                  : value.trim()
                    ? "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-dark/30"
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

          {/* Footer: hint chip + count */}
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-mono tracking-wide">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-muted-dark/55">
              <kbd className="font-mono text-[10px] text-muted-dark/70">
                {typeof navigator !== "undefined" &&
                /Mac|iPhone|iPad/.test(navigator.platform)
                  ? "⌘"
                  : "Ctrl"}
              </kbd>
              <span>+ Enter to submit</span>
            </span>
            {value.length > MAX_LENGTH * COUNT_THRESHOLD && (
              <span
                className={`tabular-nums transition-colors duration-200 ${
                  value.length >= MAX_LENGTH
                    ? "text-brand-amber"
                    : value.length >= MAX_LENGTH * 0.85
                      ? "text-brand-amber/60"
                      : "text-brand-cyan/50"
                }`}
              >
                {value.length}/{MAX_LENGTH}
              </span>
            )}
          </div>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-brand-emerald/70 font-mono tracking-wide"
            >
              Thanks! Your suggestion has been recorded.
            </motion.p>
          )}

          {status === "error" && errorMsg && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-1.5 text-xs text-brand-amber/80 font-mono tracking-wide"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errorMsg}</span>
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
