"use client";

import { useEffect, useState } from "react";
import type { HighlighterGeneric } from "shiki/core";

import { CopyButton } from "./CopyButton";

interface CodeFenceProps {
  text: string;
  lang?: string;
}

const SUPPORTED_LANGS = new Set([
  "bash",
  "sh",
  "shell",
  "json",
  "ts",
  "typescript",
  "js",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "py",
  "yaml",
  "yml",
]);

type Highlighter = HighlighterGeneric<string, string>;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;
  highlighterPromise = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, bash, json, ts, js, python, yaml, theme] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/langs/bash.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/python.mjs"),
      import("shiki/langs/yaml.mjs"),
      import("shiki/themes/github-dark-default.mjs"),
    ]);
    return createHighlighterCore({
      langs: [bash.default, json.default, ts.default, js.default, python.default, yaml.default],
      themes: [theme.default],
      engine: createJavaScriptRegexEngine(),
    }) as Promise<Highlighter>;
  })();
  return highlighterPromise;
}

function normalizeLang(lang?: string): string | null {
  if (!lang) return null;
  const l = lang.toLowerCase();
  if (!SUPPORTED_LANGS.has(l)) return null;
  if (l === "sh" || l === "shell") return "bash";
  if (l === "ts" || l === "tsx") return "typescript";
  if (l === "js" || l === "jsx") return "javascript";
  if (l === "py") return "python";
  if (l === "yml") return "yaml";
  return l;
}

export function CodeFence({ text, lang }: CodeFenceProps) {
  const [html, setHtml] = useState<string | null>(null);
  const normalized = normalizeLang(lang);

  useEffect(() => {
    if (!normalized) return;
    let cancelled = false;
    getHighlighter()
      .then((hl) => {
        if (cancelled) return;
        try {
          const out = hl.codeToHtml(text, {
            lang: normalized,
            theme: "github-dark-default",
          });
          setHtml(out);
        } catch {
          // Lang not loaded or other shiki error → keep plain rendering
        }
      })
      .catch(() => {
        // Highlighter init failed → keep plain rendering
      });
    return () => {
      cancelled = true;
    };
  }, [text, normalized]);

  return (
    <div className="group relative mb-4 overflow-x-auto rounded-xl border border-glass bg-white/[0.03]">
      <div className="flex items-center justify-between px-4 pt-2">
        {lang ? <div className="select-none font-mono text-base text-muted-dark/60">{lang}</div> : <div />}
        <CopyButton text={text} />
      </div>
      {html ? (
        <div
          className="shiki-output [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!pt-2 [&_pre]:font-mono [&_pre]:text-base [&_pre]:leading-relaxed [&_pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 pt-2 font-mono text-base leading-relaxed text-muted-dark">
          <code>{text}</code>
        </pre>
      )}
    </div>
  );
}
