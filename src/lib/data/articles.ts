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

const sceneBySection: Record<string, string> = {
  politics: "Lawmakers and party officials in session at the National Assembly complex in Abuja",
  "business-economy": "Trading floor screens and analysts tracking the naira and equities in Lagos",
  "security-watch": "Security personnel at a checkpoint on a rural highway in northern Nigeria",
  "state-of-play": "A state government secretariat building with officials arriving for a briefing",
  "energy-power": "Transmission pylons and a gas processing facility at dusk in the Niger Delta",
  "law-judiciary": "Lawyers in robes on the steps of a Nigerian courthouse",
  "foreign-diaspora": "Diplomats seated at a bilateral meeting table with national flags",
  "tech-innovation": "Engineers working at laptops in a Lagos technology hub",
};

/** Editorial imagery lives in the data layer, never in JSX. */
function imageFor(sectionSlug: string, baseTitle: string, sectionName: string): Article["image"] {
  return {
    src: `/images/news/${sectionSlug}/${slugify(baseTitle)}.jpg`,
    alt: `${sceneBySection[sectionSlug] ?? sectionName}: ${baseTitle.toLowerCase()}`,
    credit: "HPix",
  };
}

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
        image: imageFor(section.slug, title, section.name),
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

/* ------------------------------------------------------------------ *
 * Homepage editorial selections (Sprint 2)
 * ------------------------------------------------------------------ */

/** "The Seat" — executive desk of the Chief Administrator. */
export const theSeat: Article = {
  slug: "the-seat-what-the-desk-is-watching-this-week",
  title: "What this desk is watching as the fiscal year turns",
  dek: "The Chief Administrator on the three decisions that will shape Nigerian public life before December, and why the paperwork rarely tells you which one matters.",
  section: "politics",
  subsegment: "party-politics",
  byline: "Esh, Chief Administrator",
  location: "Abuja",
  date: "2026-08-18",
  readMinutes: 6,
  premium: true,
  image: {
    src: "/images/news/the-seat/executive-desk.jpg",
    alt: "The Chief Administrator at the editorial desk in the EshSpeaks newsroom",
    credit: "EshSpeaks",
  },
  likes: 412,
  commentCount: 38,
  body: bodyA("the executive agenda"),
  pullQuote: "Institutions do not fail loudly. They fail on schedule.",
};

/** Two stories that sit directly under the lead. */
export const topNews = allArticles.filter((a) => a.slug !== leadStory.slug).slice(0, 2);

/** Opinion / editor's pick rail. */
export const editorsPicks = allArticles
  .filter((a) => a.slug !== leadStory.slug && !topNews.some((t) => t.slug === a.slug))
  .slice(2, 6);

/** Horizontal spotlight strip. */
export const spotlight = allArticles
  .filter((a) => a.premium && a.slug !== leadStory.slug)
  .slice(0, 4);

/** General news feed for the two-column middle block. */
export const generalNews = allArticles.filter((a) => a.slug !== leadStory.slug).slice(8, 14);

/** Most read, five entries with interaction metrics. */
export const mostRead = allArticles
  .slice()
  .sort((a, b) => b.likes + b.commentCount * 3 - (a.likes + a.commentCount * 3))
  .slice(0, 5);
