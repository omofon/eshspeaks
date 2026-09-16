import type { Article } from "./types";

/**
 * There is no dedicated markets/finance section on the backend yet (only
 * "business-economy" is real) — so Money Moves and The Bag both read that
 * one real section and split it client-side by keyword instead of
 * inventing a fake backend-mirroring section slug (see sections.ts's
 * "matches the live backend exactly" invariant). Each page falls back to
 * the full section list if its half of the split comes up short, so
 * neither page is ever emptier than the section's real content supports.
 */
const MARKET_KEYWORDS = [
  "naira",
  "ngx",
  "forex",
  "inflation",
  "cbn",
  "bank",
  "stock",
  "remittance",
  "fpi",
  "portfolio",
  "bond",
  "interest",
];

export function isMarketsFlavored(article: Article): boolean {
  const haystack = `${article.title} ${article.dek}`.toLowerCase();
  return MARKET_KEYWORDS.some((kw) => haystack.includes(kw));
}
