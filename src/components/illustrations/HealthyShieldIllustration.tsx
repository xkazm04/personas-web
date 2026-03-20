export default function HealthyShieldIllustration() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100"
      height="100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-breathe-glow"
    >
      <defs>
        <linearGradient id="healthy-shield-fill" x1="50" y1="18" x2="50" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.20" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Orbit ring 3 (outermost) */}
      <circle cx="50" cy="50" r="46" stroke="#06b6d4" strokeOpacity="0.08" strokeWidth="0.5" fill="none" />
      {/* Orbit dot 3 */}
      <circle r="2" fill="#06b6d4" opacity="0.4">
        <animateMotion dur="8s" repeatCount="indefinite" path="M96,50 A46,46 0 1,1 95.99,50" />
      </circle>

      {/* Orbit ring 2 */}
      <circle cx="50" cy="50" r="38" stroke="#06b6d4" strokeOpacity="0.10" strokeWidth="0.5" fill="none" />
      {/* Orbit dot 2 */}
      <circle r="1.5" fill="#34d399" opacity="0.5">
        <animateMotion dur="6s" repeatCount="indefinite" path="M88,50 A38,38 0 1,1 87.99,50" />
      </circle>

      {/* Orbit ring 1 (innermost) */}
      <circle cx="50" cy="50" r="30" stroke="#06b6d4" strokeOpacity="0.12" strokeWidth="0.5" fill="none" />
      {/* Orbit dot 1 */}
      <circle r="1.5" fill="#34d399" opacity="0.6">
        <animateMotion dur="4s" repeatCount="indefinite" path="M80,50 A30,30 0 1,1 79.99,50" />
      </circle>

      {/* Shield body */}
      <path
        d="M50 18 L72 28 V52 C72 66 61 74 50 78 C39 74 28 66 28 52 V28 Z"
        fill="url(#healthy-shield-fill)"
        stroke="#34d399"
        strokeOpacity="0.3"
        strokeWidth="0.8"
      />

      {/* Checkmark inside shield */}
      <path
        d="M40 50 L47 57 L60 42"
        fill="none"
        stroke="#34d399"
        strokeOpacity="0.8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
