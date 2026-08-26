"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { fetchAllArticles } from "@/lib/api/articles";
import { useOutsideClick } from "@/hooks/useOutsideClick";

/**
 * No search endpoint exists on the backend yet (confirmed against the live
 * OpenAPI spec — no /search path). Rather than invent one, this filters the
 * real GET /articles response client-side by headline/dek. It's a real,
 * honest search over real data (empty results are empty results, not
 * fabricated ones) that's structurally ready to swap for a backend
 * `?q=` param the moment one exists — only this function would change.
 */
function matches(query: string, headline: string, dek: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return headline.toLowerCase().includes(q) || dek.toLowerCase().includes(q);
}

export function SearchOverlay({ inverted = true }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const panelRef = useOutsideClick<HTMLDivElement>(() => setOpen(false));

  const { data, isFetching } = useQuery({
    queryKey: ["articles", "search-index"],
    queryFn: () => fetchAllArticles({ limit: 100 }),
    enabled: open,
    staleTime: 60_000,
  });

  const results = (data?.items ?? []).filter((a) => matches(query, a.headline, a.dek)).slice(0, 8);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submitSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex cursor-pointer items-center p-1 transition-colors ${
          inverted
            ? "text-text-inverse/85 hover:text-accent"
            : "text-text-secondary hover:text-accent"
        }`}
      >
        {open ? (
          <X className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <Search className="h-[18px] w-[18px]" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-background shadow-raised">
          <div
            ref={panelRef}
            className="container-eshspeaks flex flex-col gap-3 py-4"
            role="search"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch();
                }}
                placeholder="Search EshSpeaks…"
                aria-label="Search articles"
                className="w-full border-none bg-transparent font-serif text-xl text-brand-navy outline-none placeholder:text-text-muted"
              />
              {isFetching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-muted" />
              ) : null}
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setOpen(false)}
                className="shrink-0 cursor-pointer p-1 text-text-muted hover:text-brand-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {query.trim() ? (
              <div className="max-h-[60vh] overflow-y-auto border-t border-rule pt-3">
                {results.length > 0 ? (
                  <ul className="divide-y divide-rule">
                    {results.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={
                            `/${article.section?.slug ?? ""}/${article.subsegment?.slug ?? ""}/${article.slug}` as `/${string}`
                          }
                          onClick={() => setOpen(false)}
                          className="block cursor-pointer py-3 hover:bg-muted/40"
                        >
                          <p className="font-serif text-base text-brand-navy">{article.headline}</p>
                          <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
                            {article.dek}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : !isFetching ? (
                  <p className="py-6 text-center text-sm text-text-secondary">
                    No stories match &ldquo;{query.trim()}&rdquo; yet.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={submitSearch}
                  className="mt-1 w-full cursor-pointer border-t border-rule py-3 text-left text-sm font-semibold text-brand-orange hover:underline"
                >
                  See all results for &ldquo;{query.trim()}&rdquo;
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SearchOverlay;
