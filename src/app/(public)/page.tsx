import Link from "next/link";
import {
  allArticles,
  editorsPicks,
  generalNews,
  leadStory,
  mostRead,
  spotlight,
  theSeat,
  topNews,
} from "@/lib/data/articles";
import { getSection, sections } from "@/lib/data/sections";
import {
  ArticleMedia,
  FeaturedCard,
  HorizontalCard,
  ListCard,
  OpinionCard,
  SectionBadge,
  articleHref,
} from "@/components/editorial";
import { TheSeatCard } from "@/components/home/TheSeatCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { AdSlot } from "@/components/AdSlot";

export const metadata = {
  title: "EshSpeaks - Nigerian journalism, interviews and opinion",
  description:
    "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life, edited for people who need the whole picture.",
  openGraph: {
    title: "EshSpeaks - Nigerian journalism, interviews and opinion",
    description:
      "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

function SectionRule({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-t-2 border-brand-navy pt-3">
      <h2 className="truncate text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
        {title}
      </h2>
      {href ? (
        <Link
          href={href as `/${string}`}
          className="shrink-0 text-[12px] font-semibold text-brand-orange hover:underline"
        >
          View all {title} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

/** Compact media card used in the spotlight strip and section hubs. */
function MediaCard({ article }: { article: (typeof allArticles)[number] }) {
  const section = getSection(article.section);
  return (
    <article className="group flex flex-col gap-3">
      <Link href={articleHref(article)} className="block">
        <ArticleMedia article={article} ratio="aspect-[4/3]" />
      </Link>
      {section ? (
        <div className="flex flex-wrap items-center gap-2">
          <SectionBadge section={section} />
        </div>
      ) : null}
      <Link href={articleHref(article)} className="block">
        <h3 className="font-serif text-lg font-bold leading-[1.15] text-brand-navy transition-colors group-hover:text-brand-orange">
          {article.title}
        </h3>
      </Link>
      <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
        {article.byline} · {article.readMinutes} min read
      </p>
    </article>
  );
}

export default function HomePage() {
  const hubs = sections.filter((s) =>
    ["politics", "business-economy", "energy-power", "tech-innovation"].includes(s.slug),
  );

  return (
    <div className="container-eshspeaks py-8">
      {/* ------------------------------------------------ Above the fold */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
        {/* The Seat */}
        <div className="order-2 lg:order-1 lg:border-r lg:border-border lg:pr-10">
          <TheSeatCard article={theSeat} />
        </div>

        {/* Lead + top news */}
        <div className="order-1 lg:order-2">
          <FeaturedCard article={leadStory} ratio="aspect-video" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {topNews.map((article) => (
              <ListCard key={article.slug} article={article} ratio="aspect-[4/3]" compact />
            ))}
          </div>
        </div>

        {/* Editor's pick & opinion */}
        <aside className="order-3 lg:border-l lg:border-border lg:pl-10">
          <SectionRule title="Editor's pick" />
          <div className="space-y-5">
            {editorsPicks.map((article) => (
              <OpinionCard key={article.slug} article={article} />
            ))}
          </div>
        </aside>
      </div>

      <div className="my-12">
        <AdSlot variant="leaderboard" />
      </div>

      {/* ------------------------------------------------ Spotlight strip */}
      <section>
        <SectionRule title="Top stories & spotlight" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {spotlight.map((article) => (
            <MediaCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ General news + most read */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
        <section>
          <SectionRule title="General news" />
          <div>
            {generalNews.map((article) => (
              <HorizontalCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section>
            <SectionRule title="Most read" />
            <ol className="space-y-4">
              {mostRead.map((article, index) => (
                <li
                  key={article.slug}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border pb-4 last:border-0"
                >
                  <span className="font-mono text-sm font-semibold text-brand-orange">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={articleHref(article)}
                      className="font-serif text-[15px] font-semibold leading-6 text-brand-navy hover:text-brand-orange"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                      {article.likes} reactions · {article.commentCount} comments
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <NewsletterSignup variant="compact" />
          <AdSlot variant="sidebar" />
        </aside>
      </div>

      {/* ------------------------------------------------ Section hubs */}
      {hubs.map((section) => {
        const items = allArticles.filter((a) => a.section === section.slug).slice(0, 3);
        if (!items.length) return null;
        return (
          <section key={section.slug} className="mt-14">
            <SectionRule title={section.name} href={`/${section.slug}`} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <MediaCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
