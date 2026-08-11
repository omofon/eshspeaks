import Link from "next/link";
import { allArticles } from "@/lib/data/articles";
import { ListCard } from "@/components/editorial";

export const metadata = {
  title: "The Seat",
  description: "Opinion and voice-driven journalism from ESHSPEAKS.",
};

export default function TheSeatPage() {
  const opinion = allArticles
    .filter((article) => article.section === "politics" || article.section === "business-economy")
    .slice(0, 6);

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
          {opinion.map((article) => (
            <ListCard key={article.slug} article={article} />
          ))}
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
