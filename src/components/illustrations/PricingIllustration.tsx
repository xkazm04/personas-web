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
      {/* Tier cards */}
      {/* Free */}
      <rect x="30" y="45" width="75" height="95" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
      <text x="67" y="68" fill="#34d399" opacity="0.7" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Free</text>
      <text x="67" y="85" fill="rgba(255,255,255,0.3)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$0</text>
      <rect x="42" y="98" width="51" height="3" rx="1.5" fill="rgba(52,211,153,0.15)" />
      <rect x="42" y="108" width="38" height="3" rx="1.5" fill="rgba(52,211,153,0.1)" />
      <rect x="42" y="118" width="45" height="3" rx="1.5" fill="rgba(52,211,153,0.1)" />
      {/* Starter */}
      <rect x="122" y="45" width="75" height="95" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
      <text x="159" y="68" fill="#06b6d4" opacity="0.7" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Starter</text>
      <text x="159" y="85" fill="rgba(255,255,255,0.3)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$19</text>
      <rect x="134" y="98" width="51" height="3" rx="1.5" fill="rgba(6,182,212,0.15)" />
      <rect x="134" y="108" width="38" height="3" rx="1.5" fill="rgba(6,182,212,0.1)" />
      <rect x="134" y="118" width="45" height="3" rx="1.5" fill="rgba(6,182,212,0.1)" />
      {/* Pro */}
      <rect x="214" y="38" width="75" height="102" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" />
      <text x="251" y="61" fill="#a855f7" opacity="0.8" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Pro</text>
      <text x="251" y="78" fill="rgba(255,255,255,0.4)" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">$49</text>
      <rect x="226" y="91" width="51" height="3" rx="1.5" fill="rgba(168,85,247,0.2)" />
      <rect x="226" y="101" width="38" height="3" rx="1.5" fill="rgba(168,85,247,0.15)" />
      <rect x="226" y="111" width="45" height="3" rx="1.5" fill="rgba(168,85,247,0.15)" />
      <rect x="226" y="121" width="30" height="3" rx="1.5" fill="rgba(168,85,247,0.1)" />
    </svg>
  );
}
