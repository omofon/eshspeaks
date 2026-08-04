import type { Section } from "./types";

export const sections: Section[] = [
  {
    slug: "politics",
    name: "Politics",
    blurb: "Party machinery, the National Assembly, and the long road to 2027.",
    tint: "politics",
    subsegments: [
      { slug: "national-assembly", name: "National assembly" },
      { slug: "party-politics", name: "Party politics" },
      { slug: "elections", name: "Elections" },
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
    slug: "foreign-diaspora",
    name: "Foreign & diaspora",
    blurb: "Abuja abroad, ECOWAS, and the Nigerians shaping policy from outside.",
    tint: "foreign",
    subsegments: [
      { slug: "ecowas", name: "ECOWAS" },
      { slug: "bilateral", name: "Bilateral" },
      { slug: "diaspora", name: "Diaspora" },
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
];

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

export const getSubsegment = (sectionSlug: string, subSlug: string) =>
  getSection(sectionSlug)?.subsegments.find((s) => s.slug === subSlug);
