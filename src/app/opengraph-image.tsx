import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Personas — AI Agents That Work For You";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#06b6d4",
            }}
          >
            P
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(to right, #ffffff, #a0a0a0)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
          }}
        >
          Personas
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          AI Agents That Work For You
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 16,
          }}
        >
          {["Natural Language", "Local + Cloud", "Zero Code"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.2)",
                background: "rgba(6,182,212,0.05)",
                color: "#06b6d4",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Domain */}
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
    ),
    { ...size },
  );
}
