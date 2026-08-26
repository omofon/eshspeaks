"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { fetchAllArticles } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ListCard } from "@/components/editorial";
import { ArticleCardSkeleton } from "@/components/skeletons";

function matches(query: string, headline: string, dek: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return headline.toLowerCase().includes(q) || dek.toLowerCase().includes(q);
}

export function SearchResults({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles", "search-index"],
    queryFn: () => fetchAllArticles({ limit: 100 }),
    staleTime: 60_000,
  });

  const results = (data?.items ?? []).filter((a) => matches(query, a.headline, a.dek));

  return (
    <div>
      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
        <SearchIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories…"
          aria-label="Search articles"
          className="w-full border-none bg-transparent text-sm text-brand-navy outline-none placeholder:text-text-muted"
        />
      </div>

      <div className="mt-6 grid gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ArticleCardSkeleton key={i} showDek />)
        ) : isError ? (
          <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            Couldn&rsquo;t load stories to search right now. Try again shortly.
          </p>
        ) : !query.trim() ? (
          <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            Start typing to search recent EshSpeaks stories.
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            No stories match &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          results
            .slice(0, 20)
            .map((article) => (
              <ListCard
                key={article.id}
                article={toUiArticle(article, { sectionSlug: article.section?.slug ?? "" })}
              />
            ))
        )}
      </div>
    </div>
  );
}
