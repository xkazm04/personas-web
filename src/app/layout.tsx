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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-cyan/90 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg focus:outline-none"
        >
          Skip to main content
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
