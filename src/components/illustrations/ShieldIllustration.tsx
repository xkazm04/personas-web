import { BRAND_VAR } from "@/lib/brand-theme";
import { Label } from "./kernel/Label";
import { Scene, brandStop } from "./kernel/Scene";

const EMERALD = BRAND_VAR.emerald;
// Strokes/fills keep their original alpha, expressed on the brand colour so the
// lock and shield re-theme with the rest of the page.
const stroke = (opacity: number) => ({ stroke: EMERALD, strokeOpacity: opacity });

export default function ShieldIllustration() {
  return (
    <Scene width={320} height={180}>
      <defs>
        <linearGradient id="faq-shield-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop style={brandStop(EMERALD, 0.06)} />
          <stop offset="1" style={brandStop(BRAND_VAR.cyan, 0.04)} />
        </linearGradient>
        <linearGradient id="faq-shield-fill" x1="160" y1="30" x2="160" y2="155" gradientUnits="userSpaceOnUse">
          <stop style={brandStop(EMERALD, 0.15)} />
          <stop offset="1" style={brandStop(EMERALD, 0.03)} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-shield-bg)" />
      {/* Shield shape */}
      <path d="M160 28 L210 50 V100 C210 130 185 148 160 155 C135 148 110 130 110 100 V50 Z" fill="url(#faq-shield-fill)" style={stroke(0.3)} strokeWidth="1" />
      {/* Lock icon inside shield */}
      <rect x="148" y="82" width="24" height="18" rx="3" fill="none" style={stroke(0.5)} strokeWidth="1.5" />
      <path d="M153 82 V76 C153 72.134 156.134 69 160 69 C163.866 69 167 72.134 167 76 V82" fill="none" style={stroke(0.5)} strokeWidth="1.5" />
      <circle cx="160" cy="91" r="2" style={{ fill: EMERALD }} opacity="0.6" />
      {/* Privacy labels (the desktop sends anonymous, PII-stripped diagnostics,
          so these must not claim "no analytics" - see src/data/security.ts).
          Translated and brand-toned; each side has ~90 units before it would
          reach the shield or the card edge. */}
      <Label k={(t) => t.faqSection.shieldLabels.piiStripped} x={102} y={80} anchor="end" maxWidth={88} />
      <Label k={(t) => t.faqSection.shieldLabels.noReplays} x={102} y={96} anchor="end" maxWidth={88} />
      <Label k={(t) => t.faqSection.shieldLabels.localOnly} x={218} y={80} maxWidth={88} />
      <Label k={(t) => t.faqSection.shieldLabels.yourData} x={218} y={96} maxWidth={88} />
    </Scene>
  );
}
