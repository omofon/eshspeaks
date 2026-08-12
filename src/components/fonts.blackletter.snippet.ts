// Add this to your existing app/fonts.ts and layout.tsx.
// Only the wordmark uses it, so it stays tiny.

import { UnifrakturCook } from "next/font/google";

export const blackletter = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-blackletter",
});

// In app/layout.tsx, add `blackletter.variable` to the <html> className list:
//
//   <html
//     lang="en"
//     className={`${newsreader.variable} ${inter.variable} ${ibmPlexMono.variable} ${bodoni.variable} ${blackletter.variable}`}
//   >
