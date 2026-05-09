"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/validation";
import { Check, Mail, AlertCircle } from "lucide-react";

type Status = "idle" | "saving" | "error";

export default function NotifyInput({
  featureId,
  voterId,
  existingEmail,
}: {
  featureId: string;
  voterId: string;
  existingEmail: string | null;
}) {
  const [email, setEmail] = useState(existingEmail ?? "");
  const [saved, setSaved] = useState(!!existingEmail);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const trimmed = email.trim();
  const valid = isValidEmail(trimmed);
  const showHint = trimmed.length >= 3 && !valid;
  const missingAt = showHint && !trimmed.includes("@");

  const handleSave = async () => {
    if (!valid || status === "saving") return;
    setStatus("saving");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId, voterId, email: trimmed }),
      });

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          res.status === 429
            ? "Too many requests — please try again in a minute."
            : "Couldn't save right now. Please try again.",
        );
        return;
      }

      const data: { action?: string } = await res.json().catch(() => ({}));
      if (data.action === "email_saved" || data.action === "added") {
        setSaved(true);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setErrorMsg("Couldn't save right now. Please try again.");
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again.");
    }
  };

  if (saved) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-brand-emerald/70 font-mono">
        <Check className="h-3 w-3" />
        <span>We&apos;ll email you when this ships</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Mail className="h-3 w-3 text-muted-dark/40 shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMsg(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
          }}
          placeholder="Email to get notified"
          aria-invalid={showHint}
          className={`min-w-0 flex-1 bg-transparent py-1.5 text-[11px] text-muted-dark placeholder:text-muted-dark/30 outline-none border-b transition-colors duration-200 ${
            valid
              ? "border-brand-emerald/40 motion-safe:animate-[border-pulse_900ms_ease-out_1]"
              : showHint
                ? "border-brand-amber/30 focus:border-brand-amber/50"
                : "border-transparent focus:border-brand-cyan/20"
          }`}
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!valid || status === "saving"}
          className="text-[11px] font-medium text-brand-cyan/70 hover:text-brand-cyan disabled:text-muted-dark/20 transition-colors duration-200"
        >
          {status === "saving" ? "Saving…" : "Notify me"}
        </button>
      </div>

      {showHint && (
        <div className="flex items-center gap-1.5 pl-5 text-[10px] text-brand-amber/80 font-mono">
          <AlertCircle className="h-2.5 w-2.5" />
          <span>
            {missingAt
              ? "Looks like you're missing the @"
              : "Double-check the address — that doesn't look quite right."}
          </span>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="flex items-center gap-1.5 pl-5 text-[10px] text-brand-amber/80 font-mono">
          <AlertCircle className="h-2.5 w-2.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
