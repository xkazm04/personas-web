import { notFound } from "next/navigation";
import { PreviewSectionMount } from "../PreviewMount";
import Roadmap from "@/components/sections/roadmap";

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
  // The roadmap derives its counts from server-only catalog modules, so it is
  // rendered here (server) and passed down, never imported by the client registry.
  return <PreviewSectionMount section={section} serverSlot={section === "roadmap" ? <Roadmap /> : undefined} />;
}
