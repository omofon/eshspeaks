/**
 * Maps a section's `tint` token (assigned round-robin in toUiSection, see
 * adapters.ts) onto one of the five fixed Colouresh crayon hues, plus a
 * beat-style chip label for the section landing page header. Real section
 * names (e.g. "National assembly") are specific department names, not a
 * broader beat category, so the chip needs its own copy rather than
 * reusing `section.name` for both the chip and the title.
 */
interface HueInfo {
  hue: string;
  hueDeep: string;
  chipLabel: string;
}

const HUE_BY_TINT: Record<string, HueInfo> = {
  politics: {
    hue: "var(--orange)",
    hueDeep: "var(--orange-deep)",
    chipLabel: "Politics & Governance",
  },
  stateofplay: {
    hue: "var(--orange)",
    hueDeep: "var(--orange-deep)",
    chipLabel: "Politics & Governance",
  },
  business: { hue: "var(--green)", hueDeep: "var(--green-deep)", chipLabel: "Business & Economy" },
  foreign: { hue: "var(--green)", hueDeep: "var(--green-deep)", chipLabel: "Business & Economy" },
  technology: {
    hue: "var(--green)",
    hueDeep: "var(--green-deep)",
    chipLabel: "Technology & Innovation",
  },
  tech: { hue: "var(--green)", hueDeep: "var(--green-deep)", chipLabel: "Technology & Innovation" },
  energy: {
    hue: "var(--green)",
    hueDeep: "var(--green-deep)",
    chipLabel: "Energy & Infrastructure",
  },
  security: { hue: "var(--red)", hueDeep: "var(--red-deep)", chipLabel: "Security & Defence" },
  law: { hue: "var(--red)", hueDeep: "var(--red-deep)", chipLabel: "Law & Judiciary" },
  interviews: { hue: "var(--yellow)", hueDeep: "var(--yellow-deep)", chipLabel: "Society & Ideas" },
  society: { hue: "var(--yellow)", hueDeep: "var(--yellow-deep)", chipLabel: "Society & Ideas" },
  culture: {
    hue: "var(--purple)",
    hueDeep: "var(--purple-deep)",
    chipLabel: "Culture & Lifestyle",
  },
  opinion: {
    hue: "var(--purple)",
    hueDeep: "var(--purple-deep)",
    chipLabel: "Culture & Lifestyle",
  },
};

const DEFAULT_HUE: HueInfo = {
  hue: "var(--orange)",
  hueDeep: "var(--orange-deep)",
  chipLabel: "Section",
};

export function hueForTint(tint: string): HueInfo {
  return HUE_BY_TINT[tint] ?? DEFAULT_HUE;
}

/**
 * The real backend's confirmed section slugs (see sections.ts's own "matches
 * the live backend exactly" comment) mapped directly onto their actual beat
 * tint — not a hash. A hash-of-the-slug fallback would eventually land
 * "National Assembly" under a "Business & Economy" chip by coincidence,
 * which is a real editorial mismatch, not just a cosmetic one.
 */
const TINT_BY_SLUG: Record<string, string> = {
  "national-assembly": "politics",
  "presidency-executive": "politics",
  "state-of-play": "stateofplay",
  "business-economy": "business",
  "security-watch": "security",
  "energy-power": "energy",
  "law-judiciary": "law",
  "tech-innovation": "tech",
  entertainment: "culture",
  "nw-sextion": "society",
};

const TINT_ROTATION = [
  "politics",
  "business",
  "security",
  "stateofplay",
  "energy",
  "law",
  "foreign",
  "tech",
];

/**
 * A single-section fetch (fetchSection) has no list index to round-robin
 * a tint the way toUiSection does for the full catalog. Known real slugs
 * get their real beat tint directly; anything else (a new section the
 * backend adds later) falls back to a stable hash of the slug, so it still
 * gets *some* consistent hue rather than erroring, just not a guaranteed
 * semantic match.
 */
export function hueForSlug(slug: string): HueInfo {
  const known = TINT_BY_SLUG[slug];
  if (known) return hueForTint(known);

  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return hueForTint(TINT_ROTATION[hash % TINT_ROTATION.length]!);
}
