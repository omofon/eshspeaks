import type { Article, ArticleImage } from "./types";
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

/**
 * At least twelve headlines per live backend section (confirmed via `GET /sections`,
 * 2026-09-11), so every section page has more than ten mock articles to populate the UI with
 * without waiting on the CMS to have real published content per desk.
 */
const titlesBySection: Record<string, string[]> = {
  "national-assembly": [
    "Senate leadership quietly redraws committee map ahead of budget season",
    "House of Reps passes tax reform bill after marathon night sitting",
    "Constituency projects audit puts twenty-two lawmakers on notice",
    "Upper chamber rejects minimum wage amendment, cites funding gap",
    "Speaker survives no-confidence motion after backroom deal with state caucus",
    "National Assembly resumes with budget defence top of the order paper",
    "Senate committee summons finance minister over unremitted revenue",
    "Reps threaten to invoke summons powers against agency heads who skip hearings",
    "Zoning fight resurfaces as ruling party caucus meets behind closed doors",
    "Assembly clerk's office flags backlog of unsigned bills awaiting transmission",
    "Joint committee report on subsidy removal faces plenary pushback",
    "Lawmakers push emergency motion on flood relief funding",
    "Public hearing on electoral act amendment draws record attendance",
    "Senate confirms three nominees after weeks of stalled screening",
  ],
  "presidency-executive": [
    "Cabinet reshuffle rumours resurface after third missed policy deadline",
    "Presidency denies reports of rift between chief of staff and finance team",
    "Federal Executive Council approves new road funding framework",
    "Aso Rock names acting head of anti-graft agency pending confirmation",
    "Presidency defends foreign trip costs after budget office query",
    "New appointments list sparks debate over zoning balance",
    "Executive order on ports reform takes effect after months of delay",
    "Chief of staff's office moves to centralise agency reporting lines",
    "Presidency signals openness to renewed subsidy palliative talks",
    "FEC meeting runs into overtime over disputed budget line items",
    "State house clarifies protocol after diplomatic seating dispute",
    "Presidency's mid-term scorecard claims progress on four of six pledges",
    "Villa sources say reshuffle decision now expected before year end",
  ],
  "business-economy": [
    "Naira steadies after CBN clears backlog of matured forward contracts",
    "Manufacturers report weakest quarter since 2020 as input costs bite",
    "Tax reform bill would shift collection burden onto consumption",
    "Foreign portfolio inflows return, but only to the short end of the curve",
    "Cement price cap talks collapse without agreement",
    "Inflation eases for second straight month on base effects",
    "Banks report record profits as interest income offsets loan losses",
    "Diaspora remittance platforms cut transfer fees amid competition",
    "Stock exchange all-share index hits fresh high on banking rally",
    "Import duty waiver for machinery draws mixed reaction from manufacturers",
    "Port congestion adds weeks to import clearance times",
    "Small business lending scheme records low uptake in first quarter",
    "Naira black market spread narrows as official window liquidity improves",
  ],
  "security-watch": [
    "Kaduna corridor attacks fall for a third month, but displacement persists",
    "Police reform panel recommends splitting command structure by state",
    "Defence budget shifts toward surveillance procurement over troop numbers",
    "Farmer-herder mediation in Benue produces first written protocol",
    "Maritime patrols cut Gulf of Guinea incidents to a decade low",
    "Northeast displacement camps report improved food supply chain",
    "New joint task force targets pipeline vandalism in the Niger Delta",
    "Kidnapping-for-ransom cases decline in southwest corridor",
    "Police recruitment drive draws record applications after pay review",
    "Border patrol unit gets new surveillance drones for northern axis",
    "Community policing pilot expands to five more local governments",
    "Intelligence sharing agreement signed with two neighbouring states",
  ],
  "state-of-play": [
    "Lagos assembly passes land use amendment after four-hour session",
    "Two governors withhold local government allocations despite court ruling",
    "Kano signs education financing deal tied to enrolment targets",
    "Rivers standoff enters a new phase as commissioners resign",
    "Ondo revenue service reports first surplus in six years",
    "Enugu unveils master plan for state capital road network",
    "Plateau assembly overrides governor's veto on local government bill",
    "Cross River signs MOU with private investors for tourism corridor",
    "Kwara state clears pension arrears after years of protest",
    "Sokoto flood response criticised over delayed relief distribution",
    "Delta assembly probes contractor over abandoned housing project",
    "Osun local government polls postponed for second time",
  ],
  "energy-power": [
    "Grid collapses twice in a week as gas supply contracts go unpaid",
    "NNPC divests two marginal fields to local operators",
    "Band A tariff review delayed pending metering audit",
    "Solar mini-grid rollout reaches two hundred rural communities",
    "Refinery output claims meet scepticism from independent marketers",
    "Gas flaring penalties raised as compliance deadline nears",
    "Discos report improved collection rate after prepaid meter push",
    "Off-grid investors seek clearer rules on mini-grid tariffs",
    "Pipeline vandalism cuts crude output for third week running",
    "New transmission line targeted to ease northern grid bottleneck",
    "Marginal field licence round draws fewer bidders than expected",
    "Subsidy removal savings tracker shows mixed state-level spending",
  ],
  "law-judiciary": [
    "Supreme Court reserves judgment in local government autonomy suit",
    "Tribunal timelines tighten under new practice directions",
    "EFCC secures conviction in nine-year procurement case",
    "Court orders release of detained protesters on self-recognisance",
    "Bar association challenges new filing fees as access barrier",
    "Appeal court upholds disqualification ruling in governorship case",
    "Judicial appointments committee shortlists candidates for vacant seats",
    "Anti-corruption agency freezes accounts linked to procurement probe",
    "Court of appeal sets new precedent on electoral petition timelines",
    "Legal aid council reports rise in pro bono case referrals",
    "Magistrate court backlog prompts call for more sitting judges",
    "Rights group files suit over prolonged pre-trial detention",
  ],
  "tech-innovation": [
    "Central bank tightens agent banking rules after fraud spike",
    "Startup funding falls again, but late-stage rounds hold up",
    "Data protection commission issues first enforcement notices",
    "National identity linkage extended to insurance products",
    "Local cloud requirement draws pushback from banks",
    "Fintech licensing backlog leaves dozens of startups in limbo",
    "Telecom regulator approves new spectrum allocation for 5G expansion",
    "Digital lending apps face fresh scrutiny over interest rate disclosure",
    "Payment switch downtime disrupts transactions for third time this year",
    "Tech hub incubator graduates record cohort of ten startups",
    "E-commerce platforms report surge in holiday season transactions",
    "Open banking framework pilot expands to four more banks",
  ],
  entertainment: [
    "Afrobeats streaming numbers overtake last year's festive season peak",
    "Nollywood box office posts best quarter since cinema reopening",
    "Lagos music festival lineup draws record advance ticket sales",
    "Censors board flags streaming series over content classification dispute",
    "Radio stations report ad revenue rebound as brands return to airtime",
    "Award show organisers announce new category for diaspora artists",
    "Cinema chain expands into three more states after strong earnings",
    "Music royalty collection body reports rise in digital payouts",
    "Comedy festival tour extends to five more cities after sellout dates",
    "Streaming platform signs local content deal with three production houses",
    "Fashion week organisers confirm bigger venue for next edition",
    "Veteran actors guild pushes for standard contract terms across productions",
  ],
  "nw-sextion": [
    "Weather service flags harmattan haze advisory for northern corridor",
    "National library begins digitisation of regional archive collection",
    "Public transport union suspends planned strike after last-minute talks",
    "Road safety corps reports drop in festive season accident rate",
    "Census office releases preliminary household count for review",
    "Postal service pilots same-day delivery in three cities",
    "Meteorological agency upgrades flood early-warning system",
    "National sports commission announces new youth talent programme",
    "Consumer protection agency issues recall notice for faulty appliance batch",
    "Civil service commission opens recruitment portal for entry-level roles",
    "National orientation agency launches community outreach drive",
    "Standards agency tightens import inspection rules for packaged food",
  ],
};

const curatedSources: [string, string][] = [
  ["Premium Times", "https://www.premiumtimesng.com"],
  ["BusinessDay", "https://businessday.ng"],
  ["The Cable", "https://www.thecable.ng"],
];

/**
 * Real, licensed Unsplash photos (downloaded to `public/images/news/<section>/`), one small
 * pool per section rather than one unique photo per article: sourcing a genuinely distinct,
 * on-topic photo for every mock headline isn't practical without an Unsplash API key, so each
 * section cycles through a handful of verified, visually-checked photos instead of guessing.
 * `alt` describes what is actually in the frame, not the headline it happens to sit next to.
 */
const sectionImages: Record<string, ArticleImage[]> = {
  "business-economy": [
    {
      src: "/images/news/business-economy/cover-1.jpg",
      alt: "Financial dashboard on a laptop screen showing market performance charts",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-2.jpg",
      alt: "Trading terminal screens displaying a currency price chart",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-3.jpg",
      alt: "Dark stock chart screen with candlesticks and a moving average line",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-4.jpg",
      alt: "Stacks of banknotes fanned out on a flat surface",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-5.jpg",
      alt: "Tax paperwork and a calculator on a desk with a pen resting on the forms",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-6.jpg",
      alt: "Rows of shelving stacked with boxes inside a warehouse",
      credit: "Unsplash",
    },
    {
      src: "/images/news/business-economy/cover-7.jpg",
      alt: "Close-up of a financial newspaper page showing a printed line chart",
      credit: "Unsplash",
    },
  ],
  "energy-power": [
    {
      src: "/images/news/energy-power/cover-1.jpg",
      alt: "Wind turbines silhouetted against an orange sunset",
      credit: "Unsplash",
    },
    {
      src: "/images/news/energy-power/cover-2.jpg",
      alt: "Aerial view of a solar panel array installed across open land",
      credit: "Unsplash",
    },
    {
      src: "/images/news/energy-power/cover-3.jpg",
      alt: "A wide solar panel field under a partly clouded sky",
      credit: "Unsplash",
    },
    {
      src: "/images/news/energy-power/cover-4.jpg",
      alt: "City skyline at night with long light trails from passing traffic",
      credit: "Unsplash",
    },
  ],
  entertainment: [
    {
      src: "/images/news/entertainment/cover-1.jpg",
      alt: "A concert crowd silhouetted against bright stage lighting",
      credit: "Unsplash",
    },
    {
      src: "/images/news/entertainment/cover-2.jpg",
      alt: "An audience gathered under string lights at an evening event",
      credit: "Unsplash",
    },
    {
      src: "/images/news/entertainment/cover-3.jpg",
      alt: "Friends raising glasses together at an outdoor cafe table",
      credit: "Unsplash",
    },
    {
      src: "/images/news/entertainment/cover-4.jpg",
      alt: "A pack of cyclists racing together on a city street",
      credit: "Unsplash",
    },
  ],
  "law-judiciary": [
    {
      src: "/images/news/law-judiciary/cover-1.jpg",
      alt: "A law library lined with books and classical busts",
      credit: "Unsplash",
    },
    {
      src: "/images/news/law-judiciary/cover-2.jpg",
      alt: "Classical stone courthouse facade with tall columns",
      credit: "Unsplash",
    },
    {
      src: "/images/news/law-judiciary/cover-3.jpg",
      alt: "A person carrying a tall stack of law books against a brick wall",
      credit: "Unsplash",
    },
    {
      src: "/images/news/law-judiciary/cover-4.jpg",
      alt: "A wooden gavel resting on its sound block",
      credit: "Unsplash",
    },
    {
      src: "/images/news/law-judiciary/cover-5.jpg",
      alt: "A gavel beside a coin on a plain surface",
      credit: "Unsplash",
    },
    {
      src: "/images/news/law-judiciary/cover-6.jpg",
      alt: "A magnifying glass held over a laptop keyboard",
      credit: "Unsplash",
    },
  ],
  "national-assembly": [
    {
      src: "/images/news/national-assembly/cover-1.jpg",
      alt: "A packed legislative chamber viewed from above during a session",
      credit: "Unsplash",
    },
    {
      src: "/images/news/national-assembly/cover-2.jpg",
      alt: "A grand domed atrium with a spiral staircase, viewed from below",
      credit: "Unsplash",
    },
    {
      src: "/images/news/national-assembly/cover-3.jpg",
      alt: "A classical government building dome against a clear sky",
      credit: "Unsplash",
    },
    {
      src: "/images/news/national-assembly/cover-4.jpg",
      alt: "An angular glass and steel government building exterior",
      credit: "Unsplash",
    },
  ],
  "nw-sextion": [
    {
      src: "/images/news/nw-sextion/cover-1.jpg",
      alt: "A person seated outdoors reading a folded newspaper",
      credit: "Unsplash",
    },
    {
      src: "/images/news/nw-sextion/cover-2.jpg",
      alt: "A hand writing on a sheet of paper with a pen",
      credit: "Unsplash",
    },
    {
      src: "/images/news/nw-sextion/cover-3.jpg",
      alt: "A notepad and fountain pen resting on a wooden desk",
      credit: "Unsplash",
    },
    {
      src: "/images/news/nw-sextion/cover-4.jpg",
      alt: "A keyboard, notepad and glasses arranged on a plain desk",
      credit: "Unsplash",
    },
  ],
  "presidency-executive": [
    {
      src: "/images/news/presidency-executive/cover-1.jpg",
      alt: "A man in a suit buttoning his jacket on a staircase",
      credit: "Unsplash",
    },
    {
      src: "/images/news/presidency-executive/cover-2.jpg",
      alt: "A dimly lit boardroom with people seated around a long table",
      credit: "Unsplash",
    },
    {
      src: "/images/news/presidency-executive/cover-3.jpg",
      alt: "Executives in a boardroom watching a screen presentation",
      credit: "Unsplash",
    },
    {
      src: "/images/news/presidency-executive/cover-4.jpg",
      alt: "A conference room mid-presentation with attendees at a long table",
      credit: "Unsplash",
    },
    {
      src: "/images/news/presidency-executive/cover-5.jpg",
      alt: "A packed auditorium audience watching a presentation",
      credit: "Unsplash",
    },
    {
      src: "/images/news/presidency-executive/cover-6.jpg",
      alt: "A speaker presenting to a seated group in a brick-walled venue",
      credit: "Unsplash",
    },
  ],
  "security-watch": [
    {
      src: "/images/news/security-watch/cover-1.jpg",
      alt: "Aerial view of a highway interchange cutting through forest",
      credit: "Unsplash",
    },
    {
      src: "/images/news/security-watch/cover-2.jpg",
      alt: "A world globe lit softly on a desk in a dim room",
      credit: "Unsplash",
    },
    {
      src: "/images/news/security-watch/cover-3.jpg",
      alt: "Blue glass skyscrapers viewed sharply from below",
      credit: "Unsplash",
    },
    {
      src: "/images/news/security-watch/cover-4.jpg",
      alt: "A hand signing a printed document on a wooden desk",
      credit: "Unsplash",
    },
  ],
  "state-of-play": [
    {
      src: "/images/news/state-of-play/cover-1.jpg",
      alt: "A minimalist office hallway with white walls and pendant lighting",
      credit: "Unsplash",
    },
    {
      src: "/images/news/state-of-play/cover-2.jpg",
      alt: "A modern glass-walled office corridor with dark framing",
      credit: "Unsplash",
    },
    {
      src: "/images/news/state-of-play/cover-3.jpg",
      alt: "A team working together at laptops beneath a chandelier",
      credit: "Unsplash",
    },
    {
      src: "/images/news/state-of-play/cover-4.jpg",
      alt: "A glass corporate tower viewed upward against a bright sky",
      credit: "Unsplash",
    },
    {
      src: "/images/news/state-of-play/cover-5.jpg",
      alt: "Dramatic upward view of steel and glass skyscrapers",
      credit: "Unsplash",
    },
  ],
  "tech-innovation": [
    {
      src: "/images/news/tech-innovation/cover-1.jpg",
      alt: "Lines of code displayed on a dark computer screen",
      credit: "Unsplash",
    },
    {
      src: "/images/news/tech-innovation/cover-2.jpg",
      alt: "Close-up of an illuminated circuit board",
      credit: "Unsplash",
    },
    {
      src: "/images/news/tech-innovation/cover-3.jpg",
      alt: "Two people walking through a server room lit in blue",
      credit: "Unsplash",
    },
    {
      src: "/images/news/tech-innovation/cover-4.jpg",
      alt: "Several people pointing at a laptop screen during a discussion",
      credit: "Unsplash",
    },
    {
      src: "/images/news/tech-innovation/cover-5.jpg",
      alt: "An overhead view of a desk with several open laptops",
      credit: "Unsplash",
    },
    {
      src: "/images/news/tech-innovation/cover-6.jpg",
      alt: "A hand holding a bank card beside an open laptop",
      credit: "Unsplash",
    },
  ],
};

/** Editorial imagery lives in the data layer, never in JSX. Cycles through the section's photo
 *  pool so a section with more articles than photos still gets visual variety, not one repeated
 *  image back to back. */
function imageFor(sectionSlug: string, counter: number): Article["image"] {
  const pool = sectionImages[sectionSlug];
  if (!pool || pool.length === 0) return null;
  return pool[counter % pool.length]!;
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
  titles.forEach((title, i) => {
    counter += 1;
    const sub = section.subsegments[i % section.subsegments.length];
    const [author, location] = bylines[counter % bylines.length]!;
    const premium = counter % 4 === 0;
    const curated = counter % 7 === 0;
    const [srcName, srcUrl] = curatedSources[counter % curatedSources.length]!;
    const day = 28 - ((counter * 3) % 27);
    articles.push({
      slug: `${slugify(title)}-${counter}`,
      title,
      dek: "Officials say the process was consultative. Documents seen by Colouresh suggest the timeline was set before consultation began.",
      section: section.slug,
      subsegment: sub?.slug ?? "",
      byline: author,
      location,
      date: `2026-07-${String(day).padStart(2, "0")}`,
      readMinutes: 3 + (counter % 6),
      premium,
      image: imageFor(section.slug, counter),
      ...(curated ? { curatedFrom: srcName, curatedUrl: srcUrl } : {}),
      likes: 12 + ((counter * 17) % 240),
      commentCount: 2 + ((counter * 5) % 31),
      body: bodyA(section.name.toLowerCase()),
      pullQuote: quotes[counter % quotes.length]!,
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

/** "The Seat": executive desk of the Chief Administrator. */
export const theSeat: Article = {
  slug: "the-seat-what-the-desk-is-watching-this-week",
  title: "What this desk is watching as the fiscal year turns",
  dek: "The Chief Administrator on the three decisions that will shape Nigerian public life before December, and why the paperwork rarely tells you which one matters.",
  section: "presidency-executive",
  subsegment: "the-presidency",
  byline: "Esh, Chief Administrator",
  location: "Abuja",
  date: "2026-08-18",
  readMinutes: 6,
  premium: true,
  image: {
    src: "/images/news/the-seat/executive-desk.jpg",
    alt: "The Chief Administrator at the editorial desk in the Colouresh newsroom",
    credit: "Colouresh",
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
