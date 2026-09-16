/**
 * The primary nav, hardcoded rather than driven off fetchSections().
 *
 * The live backend's section names/slugs (politics-governance,
 * business-economy, ...) don't match the Colouresh brand names yet, and
 * "Money Moves" and "Events" have no backend section at all — see
 * CLAUDE.md's rebrand note. These routes are placeholders that will 404
 * gracefully (via the [section] dynamic route or the root not-found page)
 * until each one is built out; that's expected during this phased rebuild,
 * not a bug.
 */
export interface NavItem {
  key: string;
  label: string;
  href: `/${string}`;
  seat?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Front Desk", href: "/" },
  { key: "sop", label: "State of Play", href: "/state-of-play" },
  { key: "bag", label: "The Bag", href: "/the-bag" },
  { key: "money", label: "Money Moves", href: "/money-moves" },
  { key: "events", label: "Events", href: "/events" },
  { key: "seat", label: "The Seat", href: "/the-seat", seat: true },
];
