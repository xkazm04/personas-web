import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  accentColor?: string;
  footer?: string;
}

export function ogCard({
  title,
  subtitle,
  badge,
  badgeColor = "#06b6d4",
  accentColor = "#06b6d4",
  footer = "personas.ai",
}: OgCardProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          }}
        />

        {/* Top bar accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
          }}
        />

        {/* Badge */}
        {badge && (
          <div
            style={{
              display: "flex",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                padding: "6px 18px",
                borderRadius: 999,
                border: `1px solid ${badgeColor}40`,
                background: `${badgeColor}12`,
                color: badgeColor,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 42 : 52,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              marginTop: 16,
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            {subtitle.length > 120 ? subtitle.slice(0, 117) + "..." : subtitle}
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: accentColor }}>P</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
              Personas
            </div>
          </div>

          {/* Footer text */}
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
            {footer}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
