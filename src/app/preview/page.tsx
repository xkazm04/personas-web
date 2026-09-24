import { notFound } from "next/navigation";
import { PreviewIndexList } from "./PreviewMount";

/**
 * Dev-only landing for the section preview tool. Lists every preview
 * route registered in registry.ts (derived from the live lazy-section
 * tables). Returns 404 in production builds so the surface never ships to
 * end users.
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
      <PreviewIndexList />
    </main>
  );
}
