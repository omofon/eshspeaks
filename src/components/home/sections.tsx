import type { Article, Section } from "@/lib/data/types";
import { SectionHeader } from "./primitives";
import { CompactStoryCard, StoryCard } from "./cards";

/** Layout A — lead + two supports. Used for the heavyweight sections. */
export function SectionLeadGrid({ section, articles }: { section: Section; articles: Article[] }) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <section className="mt-14">
      <SectionHeader
        title={section.name}
        href={`/${section.slug}`}
        tint={section.tint}
        blurb={section.blurb}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <StoryCard article={lead} ratio="3/2" tint={section.tint} />
        <div className="space-y-5 lg:border-l lg:border-rule lg:pl-10">
          {rest.slice(0, 4).map((article) => (
            <CompactStoryCard key={article.slug} article={article} tint={section.tint} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Layout B — even three/four-up row. Keeps the page from repeating itself. */
export function SectionStoryGrid({
  section,
  articles,
  columns = 3,
}: {
  section: Section;
  articles: Article[];
  columns?: 3 | 4;
}) {
  if (!articles.length) return null;

  return (
    <section className="mt-14">
      <SectionHeader title={section.name} href={`/${section.slug}`} tint={section.tint} />
      <div
        className={`grid gap-8 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {articles.slice(0, columns).map((article) => (
          <StoryCard
            key={article.slug}
            article={article}
            showDek={columns === 3}
            tint={section.tint}
          />
        ))}
      </div>
    </section>
  );
}

/** Layout C — opinion/analysis. Text-forward, maroon register, no imagery. */
export function OpinionBlock({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section className="mt-14 border-y border-navy/15 bg-navy-tint/60 px-5 py-10 sm:px-8">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
        <h2 className="kicker truncate text-maroon">The seat · Opinion &amp; analysis</h2>
        <span className="meta shrink-0">Argument</span>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <article key={article.slug} className="group">
            <a href={`/${article.section}/${article.subsegment}/${article.slug}`} className="block">
              <h3 className="font-serif text-[21px] leading-7 text-navy transition-colors group-hover:text-maroon">
                {article.title}
              </h3>
            </a>
            <p className="mt-2 line-clamp-3 text-[15px] leading-7 text-text-secondary">
              {article.dek}
            </p>
            <p className="meta mt-3">{article.byline}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
