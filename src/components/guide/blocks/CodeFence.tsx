"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HighlighterGeneric } from "shiki/core";

import { CopyButton } from "./CopyButton";

interface CodeFenceProps {
  text: string;
  lang?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
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

const LINE_NUMBER_CSS = `
.shiki-ln pre code { counter-reset: ln; padding-left: 0; }
.shiki-ln pre code .line { counter-increment: ln; display: block; padding-left: 3.5rem; position: relative; }
.shiki-ln pre code .line::before {
  content: counter(ln);
  position: absolute;
  left: 0;
  top: 0;
  width: 2.5rem;
  padding-right: 1rem;
  text-align: right;
  color: rgba(255, 255, 255, 0.28);
  user-select: none;
  pointer-events: none;
}
`;

function buildHighlightCss(scope: string, lines: number[]): string {
  if (lines.length === 0) return "";
  const selectors = lines.map((n) => `.${scope} pre code .line:nth-of-type(${n})`).join(", ");
  return `${selectors} { background: rgba(245, 158, 11, 0.08); box-shadow: inset 3px 0 rgba(245, 158, 11, 0.6); }`;
}

export function CodeFence({ text, lang, lineNumbers, highlightLines }: CodeFenceProps) {
  const [html, setHtml] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const normalized = normalizeLang(lang);
  const rawScope = useId();
  // useId returns ":r0:" style identifiers — strip non-class-safe chars.
  const scope = useMemo(() => `cf-${rawScope.replace(/[^a-zA-Z0-9_-]/g, "")}`, [rawScope]);
  const highlightCss = useMemo(
    () => buildHighlightCss(scope, highlightLines ?? []),
    [scope, highlightLines],
  );

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

  const plainLines = text.split("\n");
  const wrapperClass = [
    scope,
    lineNumbers ? "shiki-ln" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="group relative mb-4 overflow-x-auto rounded-xl border border-glass bg-white/[0.03]">
      {lineNumbers ? <style>{LINE_NUMBER_CSS}</style> : null}
      {highlightCss ? <style>{highlightCss}</style> : null}
      <div className="flex items-center justify-between px-4 pt-2">
        {lang ? <div className="select-none font-mono text-xs uppercase tracking-wider text-muted-dark/60">{lang}</div> : <div />}
        <CopyButton text={text} />
      </div>
      {html ? (
        // Crossfade the highlighted output over the plain fallback (same chrome,
        // padding and line-height already reserve the space) so the shiki swap
        // no longer hard-cuts the colors on first paint. The plain <pre> stays
        // the SSR/no-JS render — a skeleton here would blank the code server-side.
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`shiki-output ${wrapperClass} [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!pt-2 [&_pre]:font-mono [&_pre]:text-base [&_pre]:leading-relaxed [&_pre]:overflow-x-auto`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className={wrapperClass}>
          <pre className="p-4 pt-2 font-mono text-base leading-relaxed text-muted-dark">
            <code>
              {plainLines.map((line, i) => (
                <span key={i} className="line">{line || " "}</span>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
