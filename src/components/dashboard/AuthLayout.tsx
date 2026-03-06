"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Background ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-pulse-slow rounded-full mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse-slower rounded-full mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {children}
    </div>
  );
}
