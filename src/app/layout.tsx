import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
