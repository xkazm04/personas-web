import type { Metadata } from "next";
import ClockLanding from "@/components/mobile-landing/clock/ClockLanding";
import { mobileLanding2Copy } from "@/i18n/pending/mobileLanding2";

export const dynamic = "force-static";

/*
 * /m2 "Around the Clock": a phone landing on test (decision M5 in
 * docs/concepts/mobile-revival/PLAN.md). The owner tries it on a real phone before it competes
 * with /m. No redirect sends phones here (M1), and it stays out of the index until launch.
 */
export const metadata: Metadata = {
  title: mobileLanding2Copy.meta.title,
  description: mobileLanding2Copy.meta.description,
  robots: { index: false },
};

export default function M2Page() {
  return <ClockLanding />;
}
