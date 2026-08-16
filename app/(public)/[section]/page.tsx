import Link from "next/link";
import { allArticles, leadStory, trending } from "@/lib/data/articles";
import { sections, getSection } from "@/lib/data/sections";
import {
  LeadStory,
  StoryCard,
  CompactStoryCard,
  LatestItem,
  TrendingRail,
  SectionLeadGrid,
  SectionStoryGrid,
  OpinionBlock,
  SectionHeader,
} from "@/components/home";
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

const used = new Set<string>();
function take(pool: typeof allArticles, count: number) {
  const picked = pool.filter((a) => !used.has(a.slug)).slice(0, count);
  picked.forEach((a) => used.add(a.slug));
  return picked;
}

export default function HomePage() {
  used.clear();
  used.add(leadStory.slug);

  const rail = take(
    trending.filter((a) => a.slug !== leadStory.slug),
    5,
  );
  const secondLead = take(allArticles.filter((a) => a.section !== leadStory.section), 1)[0];
  const supporting = take(allArticles, 3);
  const beneath = take(allArticles, 4);

  const politics = getSection("politics");
  const business = getSection("business-economy");
  const security = getSection("security-watch");
  const tech = getSection("tech-innovation");

  const forSection = (slug?: string, count = 5) =>
    slug ? allArticles.filter((a) => a.section === slug && !used.has(a.slug)).slice(0, count) : [];

  const politicsSet = forSection(politics?.slug, 5);
  politicsSet.forEach((a) => used.add(a.slug));
  const businessSet = forSection(business?.slug, 3);
  businessSet.forEach((a) => used.add(a.slug));
  const securitySet = forSection(security?.slug, 5);
  securitySet.forEach((a) => used.add(a.slug));
  const techSet = forSection(tech?.slug, 3);
  techSet.forEach((a) => used.add(a.slug));

  const opinion = allArticles.filter((a) => !used.has(a.slug)).slice(0, 3);
  opinion.forEach((a) => used.add(a.slug));

  const latest = allArticles
    .filter((a) => !used.has(a.slug))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div className="container-eshspeaks py-6 sm:py-8">
      <h1 className="sr-only">EshSpeaks — today&rsquo;s front page</h1>

      {/* ---------- Front page: lead + editorial rail ---------- */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          <LeadStory article={leadStory} />

          {secondLead ? (
            <div className="mt-8 border-t border-rule pt-8">
              <StoryCard article={secondLead} ratio="16/9" />
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 border-t border-rule pt-8 sm:grid-cols-3">
            {supporting.map((article) => (
              <StoryCard key={article.slug} article={article} showDek={false} ratio="4/3" />
            ))}
          </div>
        </div>

        {/* Rail continues past the fold rather than sitting as an isolated box */}
        <aside className="min-w-0 space-y-8 lg:border-l lg:border-rule lg:pl-12">
          <TrendingRail
            articles={rail}
            lede="The stories our newsroom is following through the day."
          />

          <section>
            <SectionHeader title="Also worth your time" />
            <div className="space-y-5">
              {beneath.map((article) => (
                <CompactStoryCard key={article.slug} article={article} />
              ))}
            </div>
          </section>

          <AdSlot variant="sidebar" />
        </aside>
      </div>

      {/* ---------- Section blocks, deliberately varied ---------- */}
      {politics ? <SectionLeadGrid section={politics} articles={politicsSet} /> : null}
      {business ? <SectionStoryGrid section={business} articles={businessSet} /> : null}

      <div className="mt-14">
        <AdSlot variant="leaderboard" />
      </div>

      {security ? <SectionLeadGrid section={security} articles={securitySet} /> : null}

      <OpinionBlock articles={opinion} />

      {tech ? <SectionStoryGrid section={tech} articles={techSet} /> : null}

      {/* ---------- Latest + newsletter ---------- */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <section className="min-w-0">
          <SectionHeader title="Latest" />
          <div>
            {latest.map((article) => (
              <LatestItem key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <aside className="min-w-0 space-y-8 lg:border-l lg:border-rule lg:pl-12">
          <NewsletterSignup variant="large" />
          <section>
            <SectionHeader title="Sections" />
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {sections.map((section) => (
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
        </aside>
      </div>
    </div>
  );
}
