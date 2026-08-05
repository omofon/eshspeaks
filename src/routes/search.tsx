import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { ListCard } from "@/components/ArticleCard";
import { searchArticles } from "@/lib/data/articles";
import { sections } from "@/lib/data/sections";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "Search — EshSpeaks" },
      {
        name: "description",
        content: "Search EshSpeaks reporting across politics, business, security and more.",
      },
      { property: "og:title", content: "Search — EshSpeaks" },
      { property: "og:description", content: "Search the EshSpeaks archive." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/search" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const results = useMemo(() => searchArticles(query, section), [query, section]);

  return (
    <SiteShell>
      <h1 className="font-serif text-4xl text-navy">Search</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Filter the archive by keyword, byline or section. Results update as you type.
      </p>

      <div className="mt-6 flex flex-col gap-3 border-y border-rule py-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines and reporters"
            aria-label="Search"
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          aria-label="Filter by section"
          className="rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      {results.length === 0 ? (
        <p className="mt-8 text-base text-muted-foreground">
          No stories match that search. Try a broader term or clear the section filter.
        </p>
      ) : (
        <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
          {results.map((a) => (
            <ListCard key={a.slug} a={a} />
          ))}
        </div>
      )}
    </SiteShell>
  );
}
