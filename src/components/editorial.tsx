import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import type { Article } from "@/lib/data/types";
import { getSection } from "@/lib/data/sections";

/** Prefers the API-provided display name; falls back to the mock catalog for mock-fixture
 *  articles (whose slugs still match it), then the raw slug as a last resort. */
function sectionDisplayName(article: Article): string {
  return article.sectionName ?? getSection(article.section)?.name ?? article.section;
}

/**
 * Cast as Route: the segments are real data (section/subsegment/slug from
 * the API or mock fixtures), not statically known literals, so typedRoutes
 * can't verify this path at compile time.
 */
export function articleHref(article: Article): Route {
  return `/${article.section}/${article.subsegment}/${article.slug}` as Route;
}

export function SectionBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-brand-orange-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
      {name}
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex rounded-md border border-brand-maroon/20 bg-brand-maroon-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-maroon">
      Premium
    </span>
  );
}

export function OpinionBadge() {
  return (
    <span className="inline-flex rounded-md border border-brand-navy/15 bg-background-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-navy">
      Opinion
    </span>
  );
}

function Meta({ article, short = false }: { article: Article; short?: boolean }) {
  const bylineLine = article.location ? `${article.byline} · ${article.location}` : article.byline;
  return (
    <p className="text-sm text-text-secondary">
      {short ? null : `${bylineLine} · `}
      {article.readMinutes} min read
    </p>
  );
}

/** Shared media frame. Ratio is caller-controlled so hierarchy stays intentional. */
export function ArticleMedia({
  article,
  ratio = "aspect-[16/9]",
  priority = false,
  showPremium = true,
}: {
  article: Article;
  ratio?: string;
  priority?: boolean;
  showPremium?: boolean;
}) {
  if (!article.image) return null;
  return (
    <div className={`relative ${ratio} w-full overflow-hidden rounded-sm bg-muted`}>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        fill
        sizes="100vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {showPremium && article.premium ? (
        <span className="absolute right-2 top-2">
          <PremiumBadge />
        </span>
      ) : null}
    </div>
  );
}

export function FeaturedCard({
  article,
  ratio = "aspect-[16/9]",
}: {
  article: Article;
  ratio?: string;
}) {
  return (
    <article className="group flex flex-col gap-4 border-b border-border pb-8">
      <Link href={articleHref(article)} className="block">
        <ArticleMedia article={article} ratio={ratio} priority />
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <SectionBadge name={sectionDisplayName(article)} />
      </div>
      <Link href={articleHref(article)} className="block">
        <h2 className="font-serif text-3xl font-bold leading-[1.04] text-brand-navy transition-colors group-hover:text-brand-orange sm:text-4xl lg:text-5xl">
          {article.title}
        </h2>
      </Link>
      <p className="line-clamp-3 max-w-2xl text-base leading-7 text-text-secondary">
        {article.dek}
      </p>
      <Meta article={article} />
    </article>
  );
}

export function ListCard({
  article,
  compact = false,
  withImage = true,
  ratio = "aspect-[4/3]",
}: {
  article: Article;
  compact?: boolean;
  withImage?: boolean;
  ratio?: string;
}) {
  return (
    <article className="group flex flex-col gap-3 border-b border-border pb-5">
      {withImage ? (
        <Link href={articleHref(article)} className="block">
          <ArticleMedia article={article} ratio={ratio} />
        </Link>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <SectionBadge name={sectionDisplayName(article)} />
        {!withImage && article.premium ? <PremiumBadge /> : null}
      </div>
      <Link href={articleHref(article)} className="block">
        <h3
          className={`font-serif font-bold leading-[1.1] text-brand-navy transition-colors group-hover:text-brand-orange ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          {article.title}
        </h3>
      </Link>
      {!compact ? (
        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{article.dek}</p>
      ) : null}
      <Meta article={article} short={compact} />
    </article>
  );
}

/** Compact horizontal card: thumbnail beside the headline. */
export function HorizontalCard({ article }: { article: Article }) {
  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_96px] items-start gap-4 border-b border-border py-4 sm:grid-cols-[minmax(0,1fr)_140px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <SectionBadge name={sectionDisplayName(article)} />
          {article.premium ? <PremiumBadge /> : null}
        </div>
        <Link href={articleHref(article)} className="mt-2 block">
          <h3 className="font-serif text-lg font-bold leading-[1.15] text-brand-navy transition-colors group-hover:text-brand-orange sm:text-xl">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{article.dek}</p>
        <div className="mt-2">
          <Meta article={article} />
        </div>
      </div>
      <Link href={articleHref(article)} className="block shrink-0">
        <ArticleMedia article={article} ratio="aspect-square" showPremium={false} />
      </Link>
    </article>
  );
}

/** Opinion rail entry: author avatar plus an italic excerpt. */
export function OpinionCard({ article }: { article: Article }) {
  const initials = article.byline
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group border-b border-border pb-4 last:border-0">
      <OpinionBadge />
      <Link href={articleHref(article)} className="mt-3 block">
        <h3 className="font-serif text-lg font-bold leading-[1.15] text-brand-navy transition-colors group-hover:text-brand-orange">
          {article.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2 font-serif text-sm italic leading-6 text-text-secondary">
        “{article.pullQuote ?? article.dek}”
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-navy text-[10px] font-semibold tracking-wide text-white">
          {initials}
        </span>
        <span className="min-w-0 truncate text-xs uppercase tracking-[0.18em] text-text-secondary">
          {article.byline}
        </span>
      </div>
    </article>
  );
}

export function CuratedCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col gap-3 rounded-lg border border-border bg-background-soft p-5">
      <Link href={articleHref(article)} className="block">
        <ArticleMedia article={article} ratio="aspect-[16/9]" />
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <SectionBadge name={sectionDisplayName(article)} />
      </div>
      <Link href={articleHref(article)} className="block">
        <h3 className="font-serif text-xl font-bold leading-[1.1] text-brand-navy transition-colors group-hover:text-brand-orange">
          {article.title}
        </h3>
      </Link>
      <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{article.dek}</p>
      {article.curatedFrom ? (
        <a
          href={article.curatedUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-brand-orange hover:underline"
        >
          {article.curatedFrom}
        </a>
      ) : null}
    </article>
  );
}

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return compact ? <ListCard article={article} compact /> : <FeaturedCard article={article} />;
}
