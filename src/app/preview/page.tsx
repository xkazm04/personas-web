import { notFound } from "next/navigation";
import Link from "next/link";
import { PREVIEW_SLUGS } from "./registry";

/**
 * Dev-only landing for the section preview tool. Lists every preview
 * route registered in registry.ts. Returns 404 in production builds so
 * the surface never ships to end users.
 */
export default function PreviewIndex() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold mb-2">Section preview</h1>
      <p className="text-base text-muted-dark mb-8">
        Dev-only route. Each link mounts a single section in isolation for
        visual review (Storybook-lite). Skeletons and animations run as if
        the section were live.
      </p>
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
    </main>
  );
}
