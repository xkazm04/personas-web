"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  publisher: string | null;
  installCount: number;
  promptPreview: string;
  promptTruncated: boolean;
  bundleJson: string;
  shareUrl: string;
}

/**
 * The public landing for a shared agent — the receiving end of the viral loop.
 * One-click "Open in Personas" (a `personas://import/<slug>` deep link the
 * desktop registers), plus a `.persona.json` download and copy-link fallback.
 */
export default function SharePersonaView(props: Props) {
  const [copied, setCopied] = useState(false);
  const accent = props.color || "#7c93ff";

  function copyLink() {
    void navigator.clipboard?.writeText(props.shareUrl).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }

  function downloadBundle() {
    const blob = new Blob([props.bundleJson], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${props.slug}.persona.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-8"
          style={{ boxShadow: `0 1px 0 0 ${accent}22, 0 24px 60px -24px ${accent}33` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${accent}22`, color: accent }}
              aria-hidden
            >
              {props.icon || "🤖"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{props.name}</h1>
              <p className="mt-1 text-sm text-foreground">
                {props.publisher ? `Shared by ${props.publisher}` : "Shared via Personas"}
                {props.category ? ` · ${props.category}` : ""}
                {props.installCount > 0 ? ` · ${props.installCount} installs` : ""}
              </p>
            </div>
          </div>

          {props.description ? (
            <p className="mt-5 text-base text-foreground">{props.description}</p>
          ) : null}

          {props.promptPreview ? (
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                System prompt
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-foreground">
                {props.promptPreview}
                {props.promptTruncated ? "\n…" : ""}
              </pre>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`personas://import/${props.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-black transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accent }}
            >
              Open in Personas
            </a>
            <button
              type="button"
              onClick={downloadBundle}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-base font-medium text-foreground hover:bg-white/10"
            >
              Download .persona.json
            </button>
          </div>

          <button
            type="button"
            onClick={copyLink}
            className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5"
          >
            {copied ? "Link copied ✓" : "Copy share link"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-foreground">
          Don’t have Personas yet?{" "}
          <Link href="/" className="font-semibold underline">
            Get it free
          </Link>{" "}
          — then this link opens the agent in one click.
        </p>
      </div>
    </main>
  );
}
