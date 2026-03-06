import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PageViewTracker from "@/components/PageViewTracker";
import AuthProvider from "@/components/AuthProvider";
import { QualityProvider } from "@/contexts/QualityContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Personas — AI Agents That Work For You",
  description:
    "Build intelligent agents in natural language. Orchestrate them locally or in the cloud. No workflow diagrams. No code.",
  keywords: ["AI agents", "Claude Code", "automation", "orchestration", "event bus"],
  openGraph: {
    title: "Personas — AI Agents That Work For You",
    description:
      "Build intelligent agents in natural language. Orchestrate them locally or in the cloud.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-cyan focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black focus:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>
          <QualityProvider>
            <PageViewTracker />
            {children}
          </QualityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
