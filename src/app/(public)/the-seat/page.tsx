import Link from "next/link";
import { fetchArticlesBySubsegment } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ListCard } from "@/components/editorial";

export const metadata = {
  title: "The Seat",
  description: "Opinion and voice-driven journalism from EshSpeaks.",
};

/**
 * The backend now models The Seat as a real subsegment
 * (features-ideas/the-seat, confirmed live) rather than a frontend-only
 * concept — so this reads real data through that subsegment instead of
 * the mock "politics or business-economy" placeholder curation it used
 * before. The distinct voice-led framing/layout is unchanged; only the
 * data source moved from mock to live.
 */
export default async function TheSeatPage() {
  const { items } = await fetchArticlesBySubsegment("features-ideas", "the-seat", { limit: 12 });
  const stories = items.map((a) =>
    toUiArticle(a, { sectionSlug: "features-ideas", subsegmentSlug: "the-seat" }),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Opinion / voices
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">The Seat</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
          A distinct editorial channel for voices, essays and longer-form commentary that sits
          alongside the daily newsroom feed.
        </p>
        <div className="mt-8 grid gap-6">
          {stories.length > 0 ? (
            stories.map((article) => <ListCard key={article.slug} article={article} />)
          ) : (
            <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
              Nothing filed under The Seat yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-brand-maroon-soft p-8">
        <h2 className="font-serif text-2xl text-brand-navy">Editorial note</h2>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The Seat is designed to feel slightly different from the daily wire: more voice-led, more
          reflective, and more personal.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          Return to homepage
        </Link>
      </aside>
    </div>
  );
}
