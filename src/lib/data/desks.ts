/**
 * "Every desk at Colouresh" — the marketing list of beats shown on the
 * homepage and used by /coming-soon. Hardcoded rather than backend-driven
 * for the same reason as the primary nav (see navItems.ts): the live
 * backend's sections don't carry Colouresh names yet, and desks like
 * Red Zone/The Vibe have no backend section at all. `live: true` desks
 * point at the routes being built next in this rebuild; `live: false`
 * desks point at /coming-soon.
 */
export interface Desk {
  key: string;
  label: string;
  tag: string;
  color: string;
  href: string;
  live: boolean;
}

export const ALL_DESKS: Desk[] = [
  {
    key: "sop",
    label: "State of Play",
    tag: "Politics & Governance",
    color: "var(--orange)",
    href: "/state-of-play",
    live: true,
  },
  {
    key: "bag",
    label: "The Bag",
    tag: "Trade, SMEs & corporate moves",
    color: "var(--green)",
    href: "/the-bag",
    live: true,
  },
  {
    key: "money",
    label: "Money Moves",
    tag: "Naira, NGX & the markets",
    color: "var(--yellow)",
    href: "/money-moves",
    live: true,
  },
  {
    key: "redzone",
    label: "Red Zone",
    tag: "Security Watch",
    color: "var(--red)",
    href: "/coming-soon?s=Red%20Zone",
    live: false,
  },
  {
    key: "vibe",
    label: "The Vibe",
    tag: "Entertainment & Lifestyle",
    color: "var(--purple)",
    href: "/coming-soon?s=The%20Vibe",
    live: false,
  },
  {
    key: "whistle",
    label: "The Whistle",
    tag: "Sports",
    color: "var(--green)",
    href: "/coming-soon?s=The%20Whistle",
    live: false,
  },
  {
    key: "wave",
    label: "Next Wave",
    tag: "Technology",
    color: "var(--purple)",
    href: "/coming-soon?s=Next%20Wave",
    live: false,
  },
  {
    key: "brief",
    label: "The Brief",
    tag: "Governance & Public Affairs",
    color: "var(--orange)",
    href: "/coming-soon?s=The%20Brief",
    live: false,
  },
  {
    key: "ground",
    label: "Home Ground",
    tag: "Real Estate & Infrastructure",
    color: "var(--yellow)",
    href: "/coming-soon?s=Home%20Ground",
    live: false,
  },
];
