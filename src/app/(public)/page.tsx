import Link from "next/link";
import { fetchSections } from "@/lib/api/sections";
import { fetchAllArticles } from "@/lib/api/articles";
import { toUiArticle, toUiSection } from "@/lib/api/adapters";
import { SectionLeadGrid, SectionStoryGrid } from "@/components/home";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { AdSlot } from "@/components/AdSlot";

export const metadata = {
  title: "EshSpeaks — Nigerian journalism, interviews and opinion",
  description:
    "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life, edited for people who need the whole picture.",
  openGraph: {
    title: "EshSpeaks — Nigerian journalism, interviews and opinion",
    description:
      "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * GET /api/v1/articles now exists and is the real cross-section feed —
 * one call, real data, ranked however the backend ranks it (no frontend
 * scoring invented). Sections are fetched once too (shared cache — see
 * fetchSections()) purely to (a) know editorial ordering / which section
 * gets the lead slot and (b) render the "Sections" index below; the
 * actual articles come entirely from the single /articles response,
 * grouped by section client-side. This replaced a previous version that
 * called GET /articles/sections/:slug once per section (an N+1 fan-out
 * that fired 1+N uncached backend requests on every single page load and
 * was the direct cause of the 429s this page was throwing) — see
 * PRESENTATION_ORDER below for how section order is now decided.
 */
const PRESENTATION_ORDER = [
  "politics-governance",
  "business-economy",
  "metro-security",
  "news",
  "entertainment-culture",
  "features-ideas",
  "sports",
  "world",
];

function sortSectionsForDisplay<T extends { slug: string }>(sections: T[]): T[] {
  return [...sections].sort((a, b) => {
    const ai = PRESENTATION_ORDER.indexOf(a.slug);
    const bi = PRESENTATION_ORDER.indexOf(b.slug);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default async function HomePage() {
  const [sections, articlesResult] = await Promise.all([
    fetchSections(),
    fetchAllArticles({ limit: 60, sortBy: "publishedAt", sortOrder: "desc" }),
  ]);

  if (sections.length === 0) {
    return (
      <div className="container-eshspeaks py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          EshSpeaks
        </p>
        <h1 className="mt-4 font-serif text-4xl text-brand-navy sm:text-5xl">
          The newsroom is just getting started.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-secondary">
          Sections and stories will appear here as soon as the editorial team publishes them.
        </p>
      </div>
    );
  }

  const uiSections = sortSectionsForDisplay(sections.map(toUiSection));

  const articlesBySection = new Map<string, ReturnType<typeof toUiArticle>[]>();
  for (const article of articlesResult.items) {
    const sectionSlug = article.section?.slug ?? "";
    if (!sectionSlug) continue;
    const list = articlesBySection.get(sectionSlug) ?? [];
    list.push(toUiArticle(article, { sectionSlug }));
    articlesBySection.set(sectionSlug, list);
  }

  const sectionsWithArticles = uiSections
    .map((section) => ({ section, articles: articlesBySection.get(section.slug) ?? [] }))
    .filter((entry) => entry.articles.length > 0);

  if (sectionsWithArticles.length === 0) {
    return (
      <div className="container-eshspeaks py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          EshSpeaks
        </p>
        <h1 className="mt-4 font-serif text-4xl text-brand-navy sm:text-5xl">
          The newsroom is just getting started.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-secondary">
          Sections are set up — stories will appear here as soon as the editorial team publishes
          them.
        </p>
      </div>
    );
  }

  const [{ section: lead, articles: leadArticles }, ...rest] = sectionsWithArticles as [
    { section: (typeof uiSections)[number]; articles: ReturnType<typeof toUiArticle>[] },
    ...{ section: (typeof uiSections)[number]; articles: ReturnType<typeof toUiArticle>[] }[],
  ];
  const restEntries = rest;

  return (
    <div className="container-eshspeaks py-6 sm:py-8">
      <h1 className="sr-only">EshSpeaks — today&rsquo;s front page</h1>

      {lead ? <SectionLeadGrid section={lead} articles={leadArticles} /> : null}

      <div className="mt-14">
        <AdSlot variant="leaderboard" />
      </div>

      {restEntries.map(({ section, articles }, i) => (
        <SectionStoryGrid
          key={section.slug}
          section={section}
          articles={articles}
          columns={i % 2 === 0 ? 3 : 4}
        />
      ))}

      <div className="mt-14 grid gap-10 border-t border-rule pt-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="kicker mb-4">Sections</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {uiSections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={`/${section.slug}` as `/${string}`}
                  className="text-sm text-navy hover:text-accent"
                >
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <NewsletterSignup variant="large" />
      </div>
    </div>
  );
}
