export default function ShieldIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-shield-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.06" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="faq-shield-fill" x1="160" y1="30" x2="160" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.15" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-shield-bg)" />
      {/* Shield shape */}
      <path d="M160 28 L210 50 V100 C210 130 185 148 160 155 C135 148 110 130 110 100 V50 Z" fill="url(#faq-shield-fill)" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />
      {/* Lock icon inside shield */}
      <rect x="148" y="82" width="24" height="18" rx="3" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M153 82 V76 C153 72.134 156.134 69 160 69 C163.866 69 167 72.134 167 76 V82" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="160" cy="91" r="2" fill="#34d399" opacity="0.6" />
      {/* Zero telemetry labels */}
      <text x="60" y="80" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">NO ANALYTICS</text>
      <text x="60" y="96" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">NO TRACKING</text>
      <text x="222" y="80" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">LOCAL ONLY</text>
      <text x="222" y="96" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">YOUR DATA</text>
    </svg>
  );
}
