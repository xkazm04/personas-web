import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PageViewTracker from "@/components/PageViewTracker";
import AuthProvider from "@/components/AuthProvider";
import { QualityProvider } from "@/contexts/QualityContext";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  TWITTER_HANDLE,
} from "@/lib/seo";
import ThemeInit from "@/components/ThemeInit";
import CookieConsent from "@/components/CookieConsent";
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
  themeColor: "#06b6d4",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Agents That Work For You`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI agents",
    "AI automation",
    "multi-agent pipelines",
    "agent orchestration",
    "AI workflow builder",
    "local AI agents",
    "cloud AI agents",
    "natural language automation",
    "Claude AI",
    "OpenAI agents",
    "self-healing AI",
    "credential vault",
    "event bus",
    "no-code AI",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI Agents That Work For You`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — AI Agents That Work For You`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Random theme applied client-side on mount via ThemeInit */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-cyan/90 focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-black focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeInit />
        <AuthProvider>
          <QualityProvider>
            <PageViewTracker />
            {children}
          </QualityProvider>
        </AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
