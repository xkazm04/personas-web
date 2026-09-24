"use client";

import { createElement } from "react";
import Link from "next/link";
import { PREVIEW_REGISTRY, PREVIEW_SLUGS } from "./registry";

/*
 * The client half of the dev-only /preview harness. The registry is derived by
 * enumerating the "use client" lazy-section tables, which only works in the
 * client graph, so the slug list and the section lookup render here and the
 * route files stay thin server components (they own the production 404).
 */

export function PreviewIndexList() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PREVIEW_SLUGS.map((slug) => (
        <li key={slug}>
          <Link
            href={`/preview/${slug}`}
            className="block rounded-lg border border-glass bg-white/[0.02] px-4 py-2 font-mono text-base text-muted-dark hover:border-glass-hover hover:text-foreground transition-colors"
          >
            /preview/{slug}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PreviewSectionMount({ section }: { section: string }) {
  const Section = PREVIEW_REGISTRY.get(section);

  if (!Section) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold mb-2">Unknown section</h1>
        <p className="text-base text-muted-dark mb-4">
          No registry entry for <code className="font-mono">{section}</code>.
        </p>
        <p className="text-base text-muted-dark mb-2">Available:</p>
        <ul className="font-mono text-base text-muted-dark space-y-1">
          {PREVIEW_SLUGS.map((s) => (
            <li key={s}>
              <Link href={`/preview/${s}`} className="hover:text-foreground">
                /preview/{s}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-glass bg-background/80 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-base text-muted-dark">
          <Link href="/preview" className="hover:text-foreground">
            ← preview index
          </Link>
          <span>{section}</span>
        </div>
      </div>
      {/* createElement, not <Section />: the component is looked up from a
          module-level registry, never created during render, but the compiler
          rule cannot tell a lookup from a construction. */}
      {createElement(Section)}
    </>
  );
}
