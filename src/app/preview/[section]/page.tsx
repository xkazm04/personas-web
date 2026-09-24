import { notFound } from "next/navigation";
import { PreviewSectionMount } from "../PreviewMount";

/**
 * Dev-only single-section preview. Mounts the component registered for
 * params.section in isolation, with a thin breadcrumb back to the
 * preview index. Returns 404 in production; the lookup and render live in
 * the client `PreviewSectionMount` (see registry.ts for why).
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
  return <PreviewSectionMount section={section} />;
}
