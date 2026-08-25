import Link from "next/link";
import { searchArticles } from "@/lib/data/articles";
import { sections } from "@/lib/data/sections";
import { ListCard } from "@/components/editorial";

export const metadata = {
  title: "Search",
  description: "Search stories across ESHSPEAKS sections and subsegments.",
};

export default function SearchPage() {
  const query = "";
  const results = searchArticles(query);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section>
        <header className="border-b border-border pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
            Search
          </p>
          <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
            Search the newsroom
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            Use this page as the entry point for the upcoming backend-powered search experience.
          </p>
        </header>
        <div className="mt-8 grid gap-6">
          {results.slice(0, 8).map((article) => (
            <ListCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl text-brand-navy">Browse sections</h2>
          <ul className="mt-4 space-y-2">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={`/${section.slug}`}
                  className="text-sm font-medium text-brand-orange hover:underline"
                >
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
