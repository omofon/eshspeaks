import Link from "next/link";
import { allArticles, leadStory, trending } from "@/lib/data/articles";
import { sections } from "@/lib/data/sections";
import { CuratedCard, FeaturedCard, ListCard } from "@/components/editorial";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { AdSlot } from "@/components/AdSlot";

export const metadata = {
  title: "ESHSPEAKS",
  description:
    "A modern Nigerian editorial newsroom covering politics, business, culture and public life.",
};

export default function HomePage() {
  const secondary = allArticles.filter((article) => article.slug !== leadStory.slug).slice(0, 6);
  const curated = allArticles.filter((article) => article.curatedFrom).slice(0, 3);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <FeaturedCard article={leadStory} />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {secondary.map((article) => (
              <ListCard key={article.slug} article={article} />
            ))}
          </div>

          <div className="my-8">
            <AdSlot variant="leaderboard" />
          </div>

          <section className="border-t border-border pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
                  Curated from the wires
                </p>
                <h2 className="mt-2 font-serif text-2xl text-brand-navy sm:text-3xl">
                  The reporting that matters most
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {curated.map((article) => (
                <CuratedCard key={article.slug} article={article} />
              ))}
            </div>
          </section>

          {sections.slice(0, 4).map((section) => {
            const items = allArticles
              .filter((article) => article.section === section.slug)
              .slice(0, 3);
            return (
              <section key={section.slug} className="mt-10 border-t border-border pt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                      {section.name}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-brand-navy sm:text-3xl">
                      {section.name}
                    </h2>
                  </div>
                  <Link
                    href={`/${section.slug}`}
                    className="text-sm font-semibold text-brand-orange hover:underline"
                  >
                    Read more
                  </Link>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {items.map((article) => (
                    <ListCard key={article.slug} article={article} compact />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif text-2xl text-brand-navy">Trending</h2>
            <ol className="mt-4 space-y-3">
              {trending.map((article, index) => (
                <li
                  key={article.slug}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <span className="font-mono text-sm font-semibold text-brand-orange">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/${article.section}/${article.subsegment}/${article.slug}`}
                      className="text-sm leading-6 text-text-primary hover:text-brand-orange"
                    >
                      {article.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <AdSlot variant="sidebar" />
          <NewsletterSignup variant="large" />
        </aside>
      </div>
    </>
  );
}
