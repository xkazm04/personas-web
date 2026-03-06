"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/validation";
import { Check, Mail } from "lucide-react";

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

  const handleSave = () => {
    if (!isValidEmail(email)) return;
    setSaved(true);
    fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureId, voterId, email }),
    }).catch(() => setSaved(false));
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
    <div className="flex items-center gap-2">
      <Mail className="h-3 w-3 text-muted-dark/40 shrink-0" />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
        placeholder="Email to get notified"
        className="min-w-0 flex-1 bg-transparent text-[11px] text-muted-dark placeholder:text-muted-dark/30 outline-none"
      />
      <button
        onClick={handleSave}
        disabled={!isValidEmail(email)}
        className="text-[11px] font-medium text-brand-cyan/70 hover:text-brand-cyan disabled:text-muted-dark/20 transition-colors"
      >
        Notify me
      </button>
    </div>
  );
}
