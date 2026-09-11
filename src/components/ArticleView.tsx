"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useArticle } from "@/hooks/useArticle";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { isArticleUnlocked } from "@/lib/api/types";
import type { ApiArticleSummary } from "@/lib/api/types";
import { AdSlot } from "@/components/AdSlot";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleBody } from "@/components/ArticleBody";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentThread } from "@/components/CommentThread";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { PaywallPanel } from "@/components/editorial/PaywallPanel";
import { ListCard, PremiumBadge, SectionBadge } from "@/components/editorial";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          404
        </p>
        <h1 className="mt-3 font-serif text-3xl text-brand-navy">Story not found</h1>
        <p className="mt-3 text-text-secondary">
          This article may have been unpublished, archived, or the link is wrong.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          Back to the front page
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-3xl text-brand-navy">Couldn&rsquo;t load this story</h1>
        <p className="mt-3 text-text-secondary">{state.error.message}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-6 inline-flex rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
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

  return (
    <>
      <ReadingProgress />

      <nav className="text-sm text-text-secondary">
        <Link href={`/${sectionSlug}`} className="font-semibold text-brand-orange hover:underline">
          {sectionName}
        </Link>
        {subsegmentSlug ? (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/${sectionSlug}/${subsegmentSlug}`}
              className="font-semibold text-brand-orange hover:underline"
            >
              {subsegmentName}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-6">
        <AdSlot placement="leaderboard" section={sectionSlug} sector={article.sectorTags?.[0]} />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge name={sectionName} />
            {article.contentTier === "PREMIUM" ? <PremiumBadge /> : null}
          </div>

          <h1 className="mt-5 font-serif text-4xl leading-[1.02] text-brand-navy sm:text-5xl lg:text-6xl">
            {article.headline}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-text-secondary sm:text-xl">
            {article.dek}
          </p>
          <p className="mt-6 border-y border-border py-4 text-sm text-text-secondary">
            By <span className="font-semibold text-foreground">{byline}</span> · {dateLabel}
          </p>

          {article.featuredImageUrl ? (
            <img
              src={article.featuredImageUrl}
              alt={article.featuredImageAlt ?? article.headline}
              className="mt-8 aspect-[16/9] w-full rounded-md object-cover"
            />
          ) : null}

          <div className="mt-8 max-w-3xl text-lg leading-8 text-text-primary">
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
                <p className="mt-8 border-t border-border pt-6 text-sm text-text-secondary">
                  Comments aren&rsquo;t available on preview content.
                </p>
              ) : (
                <CommentThread articleId={article.id} count={article.commentsCount} />
              )}
            </>
          ) : null}
        </article>

        <aside className="space-y-6">
          <ReadNext
            relatedArticles={article.relatedArticles}
            sectionSlug={sectionSlug}
            excludeSlug={article.slug}
          />
          <AdSlot placement="sidebar" section={sectionSlug} />
        </aside>
      </div>
    </>
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
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-2xl text-brand-navy">Read next</h2>
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-serif text-2xl text-brand-navy">Read next</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <ListCard key={item.slug} article={toUiArticle(item, { sectionSlug })} compact />
        ))}
      </div>
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-5 h-12 w-full" />
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
  );
}
