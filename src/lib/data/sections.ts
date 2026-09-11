import type { Section } from "./types";

/**
 * Slugs and names here match the live backend section list exactly (confirmed
 * via `GET /sections`, 2026-09-11) so routing and card links line up once
 * article reads move off the mock fixtures. `subsegments` are mock-only: the
 * backend currently returns every section with an empty `subsegments` array,
 * so these are invented to populate the UI and are not real ids.
 */
export const sections: Section[] = [
  {
    slug: "national-assembly",
    name: "National assembly",
    blurb: "The Senate, the House of Reps, and the committee fights that decide the budget.",
    tint: "politics",
    subsegments: [
      { slug: "senate", name: "Senate" },
      { slug: "house-of-reps", name: "House of reps" },
      { slug: "committees", name: "Committees" },
    ],
  },
  {
    slug: "presidency-executive",
    name: "Presidency & executive",
    blurb:
      "The presidency, the federal executive council, and the appointments that signal intent.",
    tint: "interviews",
    subsegments: [
      { slug: "the-presidency", name: "The presidency" },
      { slug: "federal-executive-council", name: "Federal executive council" },
      { slug: "appointments", name: "Appointments" },
    ],
  },
  {
    slug: "business-economy",
    name: "Business & economy",
    blurb: "Naira, fiscal policy, banking and the companies moving the market.",
    tint: "business",
    subsegments: [
      { slug: "the-market", name: "The market" },
      { slug: "banking-finance", name: "Banking & finance" },
      { slug: "trade-industry", name: "Trade & industry" },
    ],
  },
  {
    slug: "security-watch",
    name: "Security watch",
    blurb: "Conflict tracking, policing and the defence establishment.",
    tint: "security",
    subsegments: [
      { slug: "conflict-tracker", name: "Conflict tracker" },
      { slug: "policing", name: "Policing" },
      { slug: "defence", name: "Defence" },
    ],
  },
  {
    slug: "state-of-play",
    name: "State of play",
    blurb: "Governors, state assemblies and the politics of the 36 plus one.",
    tint: "stateofplay",
    subsegments: [
      { slug: "governors", name: "Governors" },
      { slug: "state-assemblies", name: "State assemblies" },
      { slug: "local-government", name: "Local government" },
    ],
  },
  {
    slug: "energy-power",
    name: "Energy & power",
    blurb: "Upstream oil, the grid, and the subsidy question that will not close.",
    tint: "energy",
    subsegments: [
      { slug: "oil-gas", name: "Oil & gas" },
      { slug: "electricity", name: "Electricity" },
      { slug: "renewables", name: "Renewables" },
    ],
  },
  {
    slug: "law-judiciary",
    name: "Law & judiciary",
    blurb: "Tribunals, the Supreme Court and the contest over legal interpretation.",
    tint: "law",
    subsegments: [
      { slug: "courts", name: "Courts" },
      { slug: "anti-corruption", name: "Anti-corruption" },
      { slug: "rights", name: "Rights" },
    ],
  },
  {
    slug: "tech-innovation",
    name: "Tech & innovation",
    blurb: "Fintech regulation, startup capital and the digital public infrastructure build.",
    tint: "tech",
    subsegments: [
      { slug: "fintech", name: "Fintech" },
      { slug: "startups", name: "Startups" },
      { slug: "policy-regulation", name: "Policy & regulation" },
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    blurb: "Music, film and the culture business behind Nigeria's biggest exports.",
    tint: "culture",
    subsegments: [
      { slug: "music-events", name: "Music & events" },
      { slug: "film-tv", name: "Film & TV" },
      { slug: "celebrity-culture", name: "Celebrity & culture" },
    ],
  },
  {
    // Carried over verbatim from the live backend list (`GET /sections`), typo and all: an
    // editor created this as a placeholder/test section, not a real editorial desk. Kept as its
    // own catch-all here rather than dropped, so the mock catalog matches what the API actually
    // returns instead of quietly hiding a section that will otherwise show up empty in the UI.
    slug: "nw-sextion",
    name: "Nw sextion",
    blurb: "General newsroom briefs that have not been filed under a dedicated desk yet.",
    tint: "society",
    subsegments: [
      { slug: "general", name: "General" },
      { slug: "briefs", name: "Briefs" },
      { slug: "updates", name: "Updates" },
    ],
  },
];

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

export const getSubsegment = (sectionSlug: string, subSlug: string) =>
  getSection(sectionSlug)?.subsegments.find((s) => s.slug === subSlug);
