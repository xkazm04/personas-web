export default function LocalCloudIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-lc-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.05" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-lc-bg)" />
      {/* Divider */}
      <line x1="160" y1="30" x2="160" y2="155" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      {/* Local side */}
      <text x="80" y="42" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">LOCAL</text>
      {/* Monitor icon */}
      <rect x="55" y="55" width="50" height="35" rx="4" fill="none" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />
      <rect x="60" y="59" width="40" height="24" rx="2" fill="rgba(52,211,153,0.06)" />
      <rect x="73" y="90" width="14" height="4" rx="1" fill="rgba(52,211,153,0.15)" />
      <rect x="67" y="94" width="26" height="2" rx="1" fill="rgba(52,211,153,0.1)" />
      {/* Local features */}
      <text x="80" y="115" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Private</text>
      <text x="80" y="128" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Free</text>
      <text x="80" y="141" fill="#34d399" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Instant</text>
      {/* Cloud side */}
      <text x="240" y="42" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">CLOUD</text>
      {/* Cloud shape */}
      <path d="M255 68 C255 60 262 53 271 53 C277 53 282 57 284 62 C285 61 287 60 289 60 C295 60 300 65 300 71 C300 77 295 82 289 82 H225 C219 82 214 77 214 71 C214 66 217 62 222 61 C223 63 227 58 232 58 C238 58 244 62 255 68 Z" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1" />
      {/* Cloud features */}
      <text x="240" y="100" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ 24/7</text>
      <text x="240" y="113" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Teams</text>
      <text x="240" y="126" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">✓ Scaling</text>
      {/* Toggle indicator */}
      <rect x="138" y="155" width="44" height="16" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx="152" cy="163" r="5" fill="#34d399" opacity="0.4" />
    </svg>
  );
}
