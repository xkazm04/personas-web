import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export interface OgFrameProps {
  subtitle: string;
  tags: string[];
  accent?: string;
}

export function OgFrame({
  subtitle,
  tags,
  accent = "#06b6d4",
}: OgFrameProps): ReactElement {
  const accentRgba = (alpha: number) => hexToRgba(accent, alpha);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentRgba(0.15)} 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 80,
          height: 80,
          borderRadius: 20,
          background: accentRgba(0.1),
          border: `1px solid ${accentRgba(0.2)}`,
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: accent }}>P</div>
      </div>

      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          textShadow: `0 0 24px ${accentRgba(0.45)}, 0 2px 12px rgba(0,0,0,0.6)`,
          marginBottom: 16,
        }}
      >
        Personas
      </div>

      <div
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.5)",
          maxWidth: 800,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              border: `1px solid ${accentRgba(0.2)}`,
              background: accentRgba(0.05),
              color: accent,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {tag}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: 16,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 500,
        }}
      >
        personas.ai
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
