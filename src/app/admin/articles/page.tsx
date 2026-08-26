"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useEditorRole } from "@/hooks/useEditorRole";
import { fetchEditorialArticles } from "@/lib/api/articles";
import { ApiError } from "@/lib/api/client";
import type { ApiArticleSummary } from "@/lib/api/types";
import type { ArticleStatus } from "@/lib/cms/types";

const STATUS_FILTERS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const STATUS_STYLE: Record<ArticleStatus, { bg: string; fg: string }> = {
  draft: { bg: "var(--muted)", fg: "var(--text-secondary)" },
  in_review: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  published: { bg: "var(--success-soft)", fg: "var(--success)" },
  archived: { bg: "var(--muted)", fg: "var(--text-muted)" },
};

function statusLabel(status: ArticleStatus): string {
  return { draft: "Draft", in_review: "In review", published: "Published", archived: "Archived" }[
    status
  ];
}

/**
 * Real CMS dashboard, powered by GET /articles/editorial/mine (this
 * endpoint didn't exist when this route previously just redirected
 * straight to the editor — see git history / the old redirect's comment).
 * A Contributor only ever sees their own work regardless of the `mine`
 * flag (backend-enforced); the toggle only matters for roles that can see
 * more than themselves.
 */
export default function EditorialArticlesPage() {
  const role = useEditorRole();
  const [status, setStatus] = useState<ArticleStatus | "all">("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ApiArticleSummary[]>([]);
  const [meta, setMeta] = useState<{
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchEditorialArticles({
      status: status === "all" ? undefined : status,
      mine: mineOnly || undefined,
      page,
      limit: 20,
    })
      .then(({ items: fetched, meta: fetchedMeta }) => {
        if (cancelled) return;
        setItems(fetched);
        setMeta(fetchedMeta);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Couldn't load your stories.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, status, mineOnly, page]);

  if (!role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your newsroom access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      <header className="hairline sticky top-0 z-10" style={{ background: "var(--background)" }}>
        <div className="container-eshspeaks flex h-16 items-center justify-between">
          <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
            Newsroom articles
          </h1>
          <Link
            href="/admin/articles/editor"
            className="btn-accent inline-flex items-center gap-1.5"
          >
            <Plus size={15} />
            New story
          </Link>
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="flex overflow-hidden rounded-md border"
            style={{ borderColor: "var(--border)" }}
          >
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  status === f.value
                    ? { background: "var(--navy)", color: "var(--text-inverse)" }
                    : { background: "var(--card)", color: "var(--text-secondary)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={(e) => {
                setMineOnly(e.target.checked);
                setPage(1);
              }}
            />
            My stories only
          </label>
        </div>

        <div className="mt-6">
          {loading ? (
            <ListSkeleton />
          ) : error ? (
            <p
              className="rounded-md border px-4 py-3 text-sm"
              style={{ borderColor: "var(--error)", color: "var(--error)" }}
            >
              {error}
            </p>
          ) : items.length === 0 ? (
            <div
              className="rounded-md border border-dashed py-14 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm text-[var(--text-secondary)]">
                No stories match this filter yet.
              </p>
              <Link href="/admin/articles/editor" className="btn-ghost mt-4 inline-flex">
                Start a new story
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {items.map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/articles/editor/${article.slug}`}
                      className="block truncate font-serif text-lg"
                      style={{ color: "var(--navy)" }}
                    >
                      {article.headline || "Untitled story"}
                    </Link>
                    <p className="meta mt-1">
                      {article.section?.name ?? "No section"}
                      {article.author?.displayName ? ` · ${article.author.displayName}` : ""}
                      {" · "}
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
                    style={{
                      background: STATUS_STYLE[article.status].bg,
                      color: STATUS_STYLE[article.status].fg,
                    }}
                  >
                    {statusLabel(article.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <nav
            className="mt-8 flex items-center justify-between border-t pt-4 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              type="button"
              disabled={!meta.hasPrevious}
              onClick={() => setPage((p) => p - 1)}
              className="disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--accent)" }}
            >
              Newer
            </button>
            <span style={{ color: "var(--text-secondary)" }}>
              Page {page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={!meta.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--accent)" }}
            >
              Older
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-center justify-between gap-4 py-4">
          <div className="h-5 w-2/3 animate-pulse rounded" style={{ background: "var(--muted)" }} />
          <div
            className="h-5 w-16 shrink-0 animate-pulse rounded-full"
            style={{ background: "var(--muted)" }}
          />
        </li>
      ))}
    </ul>
  );
}
