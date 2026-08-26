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
  const unlocked = isArticleUnlocked(article);
  const sectionSlug = article.section?.slug ?? section;
  const sectionName = article.section?.name ?? section;
  const subsegmentSlug = article.subsegment?.slug ?? subsegment;
  const subsegmentName = article.subsegment?.name ?? subsegment;
  const byline =
    article.author?.displayName ??
    (article.author?.username ? `@${article.author.username}` : "EshSpeaks Newsroom");
  const publishedAt = article.publishedAt ?? article.createdAt;
  const dateLabel = new Date(publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const paragraphs = unlocked
    ? article.body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    : (article.preview ?? article.dek)
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
  const canonicalPath = `/${sectionSlug}/${subsegmentSlug}/${article.slug}`;
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${canonicalPath}` : canonicalPath;

  return (
    <>
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

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
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

          <div className="mt-8 max-w-3xl space-y-6 text-lg leading-8 text-text-primary">
            {paragraphs.map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {!unlocked ? <PaywallPanel signedIn={isAuthenticated} /> : null}

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
                <AdSlot variant="in-feed" />
              </div>

              <CommentThread articleId={article.id} count={article.commentsCount} />
            </>
          ) : null}
        </article>

        <aside className="space-y-6">
          <RelatedStories sectionSlug={sectionSlug} excludeSlug={article.slug} />
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}

function RelatedStories({
  sectionSlug,
  excludeSlug,
}: {
  sectionSlug: string;
  excludeSlug: string;
}) {
  const [items, setItems] = useState<ApiArticleSummary[] | null>(null);

  useEffect(() => {
    if (!sectionSlug) return;
    let cancelled = false;
    fetchArticlesBySection(sectionSlug, { limit: 6 })
      .then(({ items: fetched }) => {
        if (!cancelled) setItems(fetched.filter((a) => a.slug !== excludeSlug).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [sectionSlug, excludeSlug]);

  if (items === null) {
    return (
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-2xl text-brand-navy">Related stories</h2>
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
      <h2 className="font-serif text-2xl text-brand-navy">Related stories</h2>
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
