import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import PageViewTracker from "@/components/PageViewTracker";
import { QualityProvider } from "@/contexts/QualityContext";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  TWITTER_HANDLE,
} from "@/lib/seo";
import SkipLink from "@/components/SkipLink";
import ThemeInit from "@/components/ThemeInit";
import CookieConsent from "@/components/CookieConsent";
import PageTransition from "@/components/PageTransition";
import { DevInspector } from "./_dev-inspector/DevInspector";
import "./globals.css";

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
    // data-scroll-behavior tells Next 16 the smooth scrolling (globals.css)
    // is intentional, so it can disable it during route transitions.
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Pre-paint theme + locale init. Runs synchronously before any
            body content is parsed so the user never sees a flash of
            dark-midnight before the persisted/random theme applies, and
            screen readers see the right `lang` / `dir` from the first
            announcement. The script is intentionally tiny and self-
            contained (no module imports) so it can land in <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var T=['dark-midnight','dark-cyan','dark-bronze','dark-frost','dark-purple','dark-pink','dark-red','dark-matrix','light','light-ice','light-news'];var L=['light','light-ice','light-news'];var el=document.documentElement;var raw=null;try{raw=localStorage.getItem('personas-theme');}catch(e){}var id;if(raw){try{var p=JSON.parse(raw);if(p&&p.state&&T.indexOf(p.state.themeId)!==-1)id=p.state.themeId;}catch(e){}}if(!id){id=T[Math.floor(Math.random()*T.length)];try{localStorage.setItem('personas-theme',JSON.stringify({state:{themeId:id},version:0}));}catch(e){}}if(id!=='dark-midnight')el.setAttribute('data-theme',id);if(L.indexOf(id)===-1)el.classList.add('dark');else el.classList.remove('dark');el.setAttribute('lang','en');el.setAttribute('data-lang','en');el.removeAttribute('dir');}catch(e){}})();`,
          }}
        />
        {/* Noto families for the non-Latin locales are fetched on demand by the
            i18n store (ensureLocaleFont in stores/i18nStore.ts), not linked here:
            a stylesheet here blocked first paint on every page for fonts the
            English-only production site never uses. */}
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased text-foreground`}
      >
        <SkipLink />
        <ThemeInit />
        <QualityProvider>
          <PageViewTracker />
          <PageTransition>{children}</PageTransition>
        </QualityProvider>
        <CookieConsent />
        {process.env.NODE_ENV === "development" && <DevInspector />}
      </body>
    </html>
  );
}
