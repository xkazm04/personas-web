type HoneycombMarkProps = {
  className?: string;
  size?: number;
};

export default function HoneycombMark({ className, size = 14 }: HoneycombMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        className="honeycomb-mark-outer"
        points="7,1.5 11.76,4.25 11.76,9.75 7,12.5 2.24,9.75 2.24,4.25"
        stroke="var(--brand-cyan)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        points="7,3.7 9.86,5.35 9.86,8.65 7,10.3 4.14,8.65 4.14,5.35"
        fill="color-mix(in srgb, var(--brand-cyan) 35%, transparent)"
      />
    </svg>
  );
}
