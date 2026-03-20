export default function TerminalIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-term-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.08" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-term-bg)" />
      {/* Terminal window */}
      <rect x="40" y="30" width="240" height="120" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
      {/* Title bar */}
      <rect x="40" y="30" width="240" height="24" rx="8" fill="rgba(6,182,212,0.06)" />
      <circle cx="56" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      <circle cx="68" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      <circle cx="80" cy="42" r="3" fill="rgba(255,255,255,0.15)" />
      {/* Command lines */}
      <text x="56" y="74" fill="#06b6d4" opacity="0.7" fontSize="11" fontFamily="monospace">$ claude --version</text>
      <text x="56" y="92" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="monospace">claude v3.2.1</text>
      <text x="56" y="116" fill="#06b6d4" opacity="0.7" fontSize="11" fontFamily="monospace">$ personas start</text>
      <text x="56" y="134" fill="#34d399" opacity="0.6" fontSize="11" fontFamily="monospace">✓ 3 agents running</text>
    </svg>
  );
}
