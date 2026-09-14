import type { Metadata } from "next";
import { Fredoka, Inter, IBM_Plex_Mono } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsModal } from "@/components/CookieSettingsModal";
import { CookieConsentProvider } from "@/lib/cookieConsent";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { PreviewProvider } from "@/lib/dev/previewTier";
import { QueryProvider } from "@/lib/query/QueryProvider";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fredoka-google",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Colouresh",
    template: "%s | Colouresh",
  },
  description: "Nigerian stories, told in colour.",
  // TODO(colouresh-domain): repoint at the production Colouresh domain
  // once it's provisioned — keeping the current one live in the
  // meantime so canonical/OG URLs stay valid rather than pointing
  // somewhere that doesn't exist yet.
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
      <body className={`${fredoka.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
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
