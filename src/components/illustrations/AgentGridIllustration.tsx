export default function AgentGridIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="faq-grid-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.05" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="12" fill="url(#faq-grid-bg)" />
      {/* Grid of agent nodes */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const cx = 60 + col * 50;
          const cy = 40 + row * 36;
          const isActive = (row + col) % 3 !== 0;
          const color = col < 2 ? "#06b6d4" : col < 4 ? "#a855f7" : "#34d399";
          return (
            <g key={`${row}-${col}`}>
              <circle cx={cx} cy={cy} r="10" fill={isActive ? `${color}` : "rgba(255,255,255,0.02)"} fillOpacity={isActive ? 0.08 : 1} stroke={color} strokeOpacity={isActive ? 0.3 : 0.08} strokeWidth="1" />
              {isActive && <circle cx={cx} cy={cy} r="3" fill={color} opacity="0.4" />}
            </g>
          );
        })
      )}
      {/* ∞ symbol */}
      <text x="160" y="175" fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="500">UNLIMITED LOCAL AGENTS</text>
    </svg>
  );
}
