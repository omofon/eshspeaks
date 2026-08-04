import type { Article } from "./types";
import { sections } from "./sections";

const bodyA = (topic: string) => [
  `The decision landed late in the afternoon, and by evening it had already been reinterpreted three different ways in Abuja. Officials briefed on ${topic} describe a process that moved faster than the formal calendar suggested, with the final language settled in a small room rather than in committee. Two people involved said the text was still being amended hours before it was read out.`,
  `What makes this consequential is less the announcement itself than the precedent it sets for the next twelve months. Similar interventions in 2023 and 2024 were absorbed by the system without much friction because the fiscal room existed. That room is thinner now, and the institutions expected to carry the cost have said so publicly, which is unusual.`,
  `State-level reaction has been uneven. Three governors have signalled qualified support, while the northwest bloc has asked for a delay pending consultation with their assemblies. Analysts tracking ${topic} expect the disagreement to surface formally when the National Assembly resumes, though the leadership has an obvious incentive to keep the argument off the floor.`,
  `For now the practical effect is procedural: agencies have been asked to submit implementation notes within thirty days. That deadline is the one to watch. Where previous rounds slipped quietly, this one carries a reporting requirement attached to the next disbursement cycle, and that changes the arithmetic for anyone hoping to wait it out.`,
];

const quotes = [
  "The paperwork will say this was consultative. The timeline says otherwise.",
  "Nobody in this building expects the thirty-day window to hold.",
  "You cannot legislate confidence back into a market that has already priced the risk.",
  "The states will comply. The question is what they stop funding to do it.",
];

const bylines: [string, string][] = [
  ["Adaeze Okonkwo", "Abuja"],
  ["Ibrahim Sule", "Kano"],
  ["Folake Adeyemi", "Lagos"],
  ["Emeka Nwachukwu", "Enugu"],
  ["Hauwa Bala", "Maiduguri"],
  ["Tunde Bakare-Ojo", "Ibadan"],
  ["Ngozi Eze", "Port Harcourt"],
  ["Samuel Dogo", "Jos"],
];

const titlesBySection: Record<string, string[]> = {
  politics: [
    "Ruling party delays zoning decision as northern caucus hardens position",
    "Senate leadership quietly redraws committee map ahead of budget season",
    "Opposition merger talks stall over who controls the 2027 ticket",
    "Constituency projects audit puts twenty-two lawmakers on notice",
    "Cabinet reshuffle rumours resurface after third missed policy deadline",
  ],
  "business-economy": [
    "Naira steadies after CBN clears backlog of matured forward contracts",
    "Manufacturers report weakest quarter since 2020 as input costs bite",
    "Tax reform bill would shift collection burden onto consumption",
    "Foreign portfolio inflows return, but only to the short end of the curve",
    "Cement price cap talks collapse without agreement",
  ],
  "security-watch": [
    "Kaduna corridor attacks fall for a third month, but displacement persists",
    "Police reform panel recommends splitting command structure by state",
    "Defence budget shifts toward surveillance procurement over troop numbers",
    "Farmer-herder mediation in Benue produces first written protocol",
    "Maritime patrols cut Gulf of Guinea incidents to a decade low",
  ],
  "state-of-play": [
    "Lagos assembly passes land use amendment after four-hour session",
    "Two governors withhold local government allocations despite court ruling",
    "Kano signs education financing deal tied to enrolment targets",
    "Rivers standoff enters a new phase as commissioners resign",
    "Ondo revenue service reports first surplus in six years",
  ],
  "energy-power": [
    "Grid collapses twice in a week as gas supply contracts go unpaid",
    "NNPC divests two marginal fields to local operators",
    "Band A tariff review delayed pending metering audit",
    "Solar mini-grid rollout reaches two hundred rural communities",
    "Refinery output claims meet scepticism from independent marketers",
  ],
  "law-judiciary": [
    "Supreme Court reserves judgment in local government autonomy suit",
    "Tribunal timelines tighten under new practice directions",
    "EFCC secures conviction in nine-year procurement case",
    "Court orders release of detained protesters on self-recognisance",
    "Bar association challenges new filing fees as access barrier",
  ],
  "foreign-diaspora": [
    "ECOWAS softens exit terms for departing Sahel states",
    "Abuja and Pretoria reopen stalled trade committee",
    "Diaspora remittance channel pilots cut fees to under two per cent",
    "Visa reciprocity review targets four European capitals",
    "Nigeria pushes for permanent seat language in reform draft",
  ],
  "tech-innovation": [
    "Central bank tightens agent banking rules after fraud spike",
    "Startup funding falls again, but late-stage rounds hold up",
    "Data protection commission issues first enforcement notices",
    "National identity linkage extended to insurance products",
    "Local cloud requirement draws pushback from banks",
  ],
};

const curatedSources: [string, string][] = [
  ["Premium Times", "https://www.premiumtimesng.com"],
  ["BusinessDay", "https://businessday.ng"],
  ["The Cable", "https://www.thecable.ng"],
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

const articles: Article[] = [];
let counter = 0;

for (const section of sections) {
  const titles = titlesBySection[section.slug] ?? [];
  section.subsegments.forEach((sub, subIndex) => {
    titles.forEach((title, i) => {
      if ((i + subIndex) % 3 === 2 && i > 2) return;
      counter += 1;
      const [author, location] = bylines[counter % bylines.length]!;
      const premium = counter % 4 === 0;
      const curated = counter % 7 === 0;
      const [srcName, srcUrl] = curatedSources[counter % curatedSources.length]!;
      const day = 28 - ((counter * 3) % 27);
      articles.push({
        slug: `${slugify(title)}-${counter}`,
        title: subIndex === 0 ? title : `${title} — ${sub.name.toLowerCase()} view`,
        dek: "Officials say the process was consultative. Documents seen by EshSpeaks suggest the timeline was set before consultation began.",
        section: section.slug,
        subsegment: sub.slug,
        byline: author,
        location,
        date: `2026-07-${String(day).padStart(2, "0")}`,
        readMinutes: 3 + (counter % 6),
        premium,
        ...(curated ? { curatedFrom: srcName, curatedUrl: srcUrl } : {}),
        likes: 12 + ((counter * 17) % 240),
        commentCount: 2 + ((counter * 5) % 31),
        body: bodyA(section.name.toLowerCase()),
        pullQuote: quotes[counter % quotes.length]!,
      });
    });
  });
}

export const allArticles = articles;

export const getArticle = (slug: string) => allArticles.find((a) => a.slug === slug);

export const bySection = (section: string) => allArticles.filter((a) => a.section === section);

export const bySubsegment = (section: string, subsegment: string) =>
  allArticles.filter((a) => a.section === section && a.subsegment === subsegment);

export const trending = allArticles
  .slice()
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 6);

export const leadStory = allArticles[3]!;

export const relatedTo = (article: Article) =>
  allArticles.filter((a) => a.section === article.section && a.slug !== article.slug).slice(0, 4);

export function searchArticles(query: string, section?: string) {
  const q = query.trim().toLowerCase();
  return allArticles.filter((a) => {
    const matchesSection = !section || section === "all" || a.section === section;
    if (!matchesSection) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.dek.toLowerCase().includes(q) ||
      a.byline.toLowerCase().includes(q)
    );
  });
}
