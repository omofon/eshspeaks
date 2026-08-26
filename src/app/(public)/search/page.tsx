import Link from "next/link";
import { fetchSections } from "@/lib/api/sections";
import { SearchResults } from "@/components/SearchResults";

export const metadata = {
  title: "Search",
  description: "Search stories across EshSpeaks sections and subsegments.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const sections = await fetchSections();

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
            Results are matched against real published headlines and deks. There&rsquo;s no
            dedicated search index on the backend yet, so this covers recent stories only.
          </p>
        </header>

        <div className="mt-8">
          <SearchResults initialQuery={q ?? ""} />
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
