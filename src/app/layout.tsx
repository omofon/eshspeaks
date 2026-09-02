import type { Metadata } from "next";
import { Newsreader, Inter, IBM_Plex_Mono, Bodoni_Moda } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsModal } from "@/components/CookieSettingsModal";
import { CookieConsentProvider } from "@/lib/cookieConsent";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { PreviewProvider } from "@/lib/dev/previewTier";
import { QueryProvider } from "@/lib/query/QueryProvider";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ESHSPEAKS",
    template: "%s | ESHSPEAKS",
  },
  description:
    "A modern Nigerian editorial newsroom for politics, business, culture and public life.",
  metadataBase: new URL("https://www.eshspeaks.com"),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${newsreader.variable} ${inter.variable} ${ibmPlexMono.variable} ${bodoni.variable}`}
      >
        <QueryProvider>
          <PreviewProvider>
            <AuthProvider>
              <CookieConsentProvider>
                {children}
                <CookieBanner />
                <CookieSettingsModal />
              </CookieConsentProvider>
            </AuthProvider>
          </PreviewProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
