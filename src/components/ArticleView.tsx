"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useArticle } from "@/hooks/useArticle";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { isArticleUnlocked } from "@/lib/api/types";
import type { ApiArticleSummary } from "@/lib/api/types";
import { articleHref } from "@/components/home/primitives";
import { AdSlot } from "@/components/AdSlot";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleBody } from "@/components/ArticleBody";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentThread } from "@/components/CommentThread";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { PaywallPanel } from "@/components/editorial/PaywallPanel";
import { Skeleton } from "@/components/ui/skeleton";

const AVATAR_COLORS = [
  "var(--orange)",
  "var(--purple)",
  "var(--green)",
  "var(--red)",
  "var(--yellow-deep)",
];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}

function initialsFor(name: string) {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function ArticleView({
  section,
  subsegment,
  slug,
}: {
  section: string;
  subsegment: string;
  slug: string;
}) {
  const { isAuthenticated } = useAuth();
  const { state, reload } = useArticle(slug);

  if (state.status === "loading") return <ArticleSkeleton />;

  if (state.status === "not-found") {
    return (
      <div className="py-20 text-center">
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full bg-red" />
          404
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-ink">Story not found</h1>
        <p className="mt-3 text-ink-soft">
          This article may have been unpublished, archived, or the link is wrong.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Back to the front page
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-semibold text-ink">Couldn&rsquo;t load this story</h1>
        <p className="mt-3 text-ink-soft">{state.error.message}</p>
        <button type="button" onClick={reload} className="btn-primary mt-6 inline-flex">
          Try again
        </button>
      </div>
    );
  }

  const article = state.article;
  // Dev-only mock fallback articles (see mockFallback.ts) carry a `mock-` id, which isn't a
  // real backend row — skip the comment thread's live fetch rather than surface a raw backend
  // error ("Database error (P2023)") for an id the API was never going to recognize.
  const isMockArticle = article.id.startsWith("mock-");
  const unlocked = isArticleUnlocked(article);
  const sectionSlug = article.section?.slug ?? section;
  const sectionName = article.section?.name ?? section;
  const subsegmentSlug = article.subsegment?.slug ?? subsegment;
  const subsegmentName = article.subsegment?.name ?? subsegment;
  const byline =
    article.author?.displayName ??
    (article.author?.username
      ? `@${article.author.username}`
      : (article.author?.name ?? "EshSpeaks Newsroom"));
  const publishedAt = article.publishedAt ?? article.createdAt;
  const dateLabel = new Date(publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const readMinutes = Math.max(1, Math.round((article.body?.split(/\s+/).length ?? 0) / 220)) || 3;
  /**
   * When `access === "preview"`, the backend has already truncated `body` to the permitted
   * preview text (confirmed shape: `{contentTier, access: "preview", previewWordCount, body}`)
   * — this renders that truncated body as-is rather than re-deriving a shorter preview
   * client-side. `article.preview` (a distinct, separate field some gating implementations send)
   * is the fallback for a response shaped differently; `dek` is the last resort so a locked
   * article is never rendered with nothing at all.
   */
  const bodyText = unlocked ? article.body : article.body || article.preview || article.dek;
  const canonicalPath = subsegmentSlug
    ? `/${sectionSlug}/${subsegmentSlug}/${article.slug}`
    : `/${sectionSlug}/${article.slug}`;
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${canonicalPath}` : canonicalPath;
  const accent = colorFor(sectionSlug || sectionName);

  return (
    <div>
      <ReadingProgress />

      <nav className="mb-3.5 text-[12.5px] font-semibold text-ink-soft">
        <Link href="/" className="hover:text-orange">
          Front Desk
        </Link>{" "}
        /{" "}
        <Link href={`/${sectionSlug}`} className="hover:text-orange">
          {sectionName}
        </Link>
        {subsegmentSlug ? (
          <>
            {" "}
            /{" "}
            <Link href={`/${sectionSlug}/${subsegmentSlug}`} className="hover:text-orange">
              {subsegmentName}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mb-3.5 flex flex-wrap gap-2">
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />
          {sectionName}
        </span>
        {article.contentTier === "PREMIUM" ? (
          <span className="chip border-yellow-deep bg-yellow">Premium</span>
        ) : null}
      </div>

      <h1 className="mb-4 text-[28px] leading-[1.15] font-semibold text-ink sm:text-[36px] lg:text-[42px]">
        {article.headline}
      </h1>
      <p className="mb-4.5 max-w-[680px] text-[17px] text-ink-soft">{article.dek}</p>

      <div className="mb-6 flex items-center gap-2.5 border-b-2 border-line pb-5 text-[13px] font-semibold text-ink-soft">
        <span
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: accent }}
        >
          {initialsFor(byline)}
        </span>
        By <span className="text-ink">{byline}</span> · {dateLabel} · {readMinutes} min read
      </div>

      <div className="mb-8">
        <AdSlot placement="leaderboard" section={sectionSlug} sector={article.sectorTags?.[0]} />
      </div>

      <div className="grid gap-11 lg:grid-cols-[1fr_300px]">
        <article>
          {article.featuredImageUrl ? (
            <img
              src={article.featuredImageUrl}
              alt={article.featuredImageAlt ?? article.headline}
              className="mb-8 aspect-[16/9] w-full rounded-xl border-2 border-ink object-cover"
            />
          ) : null}

          <div className="max-w-[680px] text-[16.5px] leading-[1.8] text-ink [&_p]:mb-5">
            <ArticleBody body={bodyText} />
          </div>

          {!unlocked ? (
            <PaywallPanel
              signedIn={isAuthenticated}
              previewWordCount={
                article.access === "preview" ? (article.previewWordCount ?? null) : null
              }
            />
          ) : null}

          {unlocked ? (
            <>
              {article.sectorTags && article.sectorTags.length > 0 ? (
                <div className="my-6.5 flex flex-wrap gap-2">
                  {article.sectorTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border-2 border-line px-3.5 py-1.5 text-xs font-semibold text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <EngagementBar
                articleId={article.id}
                initialLiked={Boolean(article.isLikedByCurrentUser)}
                likes={article.likesCount}
                comments={article.commentsCount}
                shareUrl={shareUrl}
                shareTitle={article.headline}
              />

              <ArticleFeedback articleId={article.id} />

              <div className="mt-8">
                <AdSlot
                  placement="in-feed"
                  section={sectionSlug}
                  sector={article.sectorTags?.[0]}
                />
              </div>

              {isMockArticle ? (
                <p className="mt-8 border-t-2 border-line pt-6 text-sm text-ink-soft">
                  Comments aren&rsquo;t available on preview content.
                </p>
              ) : (
                <CommentThread articleId={article.id} count={article.commentsCount} />
              )}
            </>
          ) : null}
        </article>

        <aside className="space-y-5">
          <ReadNext
            relatedArticles={article.relatedArticles}
            sectionSlug={sectionSlug}
            excludeSlug={article.slug}
          />
          <AdSlot placement="sidebar" section={sectionSlug} />
        </aside>
      </div>
    </div>
  );
}

/**
 * Prefers the detail response's own `relatedArticles` (the backend's picks, confirmed live —
 * see the API response example in the article-content spec) over inventing a client-side
 * "same section" query. Only falls back to fetching by section when the response doesn't
 * include `relatedArticles` at all, so older/differently-shaped responses keep working.
 */
function ReadNext({
  relatedArticles,
  sectionSlug,
  excludeSlug,
}: {
  relatedArticles: ApiArticleSummary[] | null | undefined;
  sectionSlug: string;
  excludeSlug: string;
}) {
  const hasRelated = relatedArticles !== undefined && relatedArticles !== null;
  const [fallbackItems, setFallbackItems] = useState<ApiArticleSummary[] | null>(null);

  useEffect(() => {
    if (hasRelated || !sectionSlug) return;
    let cancelled = false;
    fetchArticlesBySection(sectionSlug, { limit: 6 })
      .then(({ items: fetched }) => {
        if (!cancelled) setFallbackItems(fetched.filter((a) => a.slug !== excludeSlug).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setFallbackItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hasRelated, sectionSlug, excludeSlug]);

  const items = hasRelated
    ? relatedArticles.filter((a) => a.slug !== excludeSlug).slice(0, 4)
    : fallbackItems;

  if (items === null) {
    return (
      <section className="rounded-2xl border-2 border-ink bg-white p-5">
        <h4 className="mb-3 text-[13px] font-bold text-ink">Related</h4>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border-2 border-ink bg-white p-5">
      <h4 className="mb-3 text-[13px] font-bold text-ink">Related</h4>
      {items.map((item) => {
        const uiItem = toUiArticle(item, { sectionSlug });
        return (
          <Link
            key={item.slug}
            href={articleHref(uiItem)}
            className="block border-b border-line py-2.5 text-[13px] font-semibold leading-[1.4] text-ink last:border-b-0 hover:text-orange"
          >
            {uiItem.title}
            <span className="mt-1 block text-[11px] font-medium text-ink-soft">
              {uiItem.sectionName ?? sectionSlug} · {uiItem.readMinutes} min read
            </span>
          </Link>
        );
      })}
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <div className="mt-5 grid gap-11 lg:grid-cols-[1fr_300px]">
        <div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="mt-3 h-12 w-2/3" />
          <Skeleton className="mt-6 h-16 w-full" />
          <Skeleton className="mt-8 aspect-[16/9] w-full" />
          <div className="mt-8 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
