import { notFound } from "next/navigation";
import Link from "next/link";
import { PREVIEW_REGISTRY, PREVIEW_SLUGS } from "../registry";

/**
 * Dev-only single-section preview. Mounts the component registered for
 * params.section in isolation, with a thin breadcrumb back to the
 * preview index. Returns 404 in production.
 */
export default async function PreviewSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { section } = await params;
  const Section = PREVIEW_REGISTRY[section];

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
      <Section />
    </>
  );
}
