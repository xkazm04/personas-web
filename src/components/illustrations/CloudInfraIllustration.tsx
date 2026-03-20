export default function CloudInfraIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-byoi-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.06" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-byoi-bg)" />
      {/* Cloud shape */}
      <path d="M180 55 C180 42 192 32 206 32 C216 32 224 38 228 46 C230 45 233 44 236 44 C246 44 254 52 254 62 C254 72 246 80 236 80 H150 C140 80 132 72 132 62 C132 54 137 47 145 45 C147 48 153 42 160 42 C168 42 175 47 180 55 Z" fill="rgba(6,182,212,0.08)" stroke="#06b6d4" strokeOpacity="0.3" strokeWidth="1" />
      {/* Connection lines to infrastructure nodes */}
      <line x1="160" y1="80" x2="100" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="190" y1="80" x2="160" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="220" y1="80" x2="220" y2="130" stroke="#a855f7" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
      {/* Infrastructure nodes */}
      <rect x="82" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="100" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">Fly.io</text>
      <rect x="142" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="160" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">AWS</text>
      <rect x="202" y="125" width="36" height="28" rx="4" fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1" />
      <text x="220" y="143" fill="#a855f7" opacity="0.5" fontSize="8" fontFamily="monospace" textAnchor="middle">GCP</text>
      {/* "Your account" label */}
      <text x="160" y="170" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" textAnchor="middle">YOUR INFRASTRUCTURE</text>
    </svg>
  );
}
