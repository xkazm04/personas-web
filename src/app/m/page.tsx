import type { Metadata } from "next";
import HiveLanding from "@/components/mobile-landing/hive/HiveLanding";
import { mobileLandingCopy } from "@/i18n/pending/mobileLanding";

/*
 * /m - the phone landing ("Hive Reels", docs/concepts/mobile-revival/PLAN.md phase 1).
 *
 * Not indexed until launch, and canonical to `/` so the two pages never compete in search. No
 * redirect sends phones here yet (decision M1): it is reached directly. Metadata reads the English
 * catalogue, like every route in src/app (no layout resolves a server-side locale today).
 */
export const metadata: Metadata = {
  title: mobileLandingCopy.metaTitle,
  description: mobileLandingCopy.metaDescription,
  robots: { index: false },
  alternates: { canonical: "/" },
};

export default function MobileLandingPage() {
  return <HiveLanding />;
}
