// Decorative art for the FAQ "How does the pricing model work?" answer. The
// product has no paid plans or tiers (owner ruling 2026-09-14): the desktop app
// is free and open source, so the art paints one free card and no price ladder.
const OFFER = { name: "Free", price: "$0", note: "Open source" } as const;

export default function PricingIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-price-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" stopOpacity="0.06" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-price-bg)" />
      {/* Single free offer */}
      <rect x="110" y="30" width="100" height="120" rx="8" fill="rgba(52,211,153,0.05)" stroke="rgba(52,211,153,0.35)" strokeWidth="1.5" />
      <text x="160" y="56" fill="#34d399" opacity="0.8" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">{OFFER.name}</text>
      <text x="160" y="80" fill="rgba(255,255,255,0.4)" fontSize="20" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">{OFFER.price}</text>
      <rect x="126" y="94" width="68" height="3" rx="1.5" fill="rgba(52,211,153,0.2)" />
      <rect x="126" y="104" width="52" height="3" rx="1.5" fill="rgba(52,211,153,0.15)" />
      <rect x="126" y="114" width="60" height="3" rx="1.5" fill="rgba(52,211,153,0.15)" />
      <text x="160" y="138" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="sans-serif" textAnchor="middle">{OFFER.note}</text>
    </svg>
  );
}
