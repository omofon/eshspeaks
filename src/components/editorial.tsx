import Link from "next/link";
import type { Article, Section } from "@/lib/data/types";
import { getSection } from "@/lib/data/sections";

export function SectionBadge({ section }: { section: Section }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-brand-orange-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
      {section.name}
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

function Meta({ article }: { article: Article }) {
  return (
    <p className="text-sm text-text-secondary">
      {article.byline} · {article.location} · {article.readMinutes} min read
    </p>
  );
}

export function FeaturedCard({ article }: { article: Article }) {
  const section = getSection(article.section);

  return (
    <article className="border-b border-border pb-8">
      <div className="flex flex-wrap items-center gap-2">
        {section ? <SectionBadge section={section} /> : null}
        {article.premium ? <PremiumBadge /> : null}
      </div>
      <Link
        href={`/${article.section}/${article.subsegment}/${article.slug}`}
        className="group mt-4 block"
      >
        <h2 className="font-serif text-3xl leading-[1.04] text-brand-navy transition-colors group-hover:text-brand-orange sm:text-4xl">
          {article.title}
        </h2>
      </Link>
      <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{article.dek}</p>
      <div className="mt-4">
        <Meta article={article} />
      </div>
    </article>
  );
}

export function ListCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const section = getSection(article.section);

  return (
    <article className="border-b border-border pb-5">
      <div className="flex flex-wrap items-center gap-2">
        {section ? <SectionBadge section={section} /> : null}
        {article.premium ? <PremiumBadge /> : null}
      </div>
      <Link
        href={`/${article.section}/${article.subsegment}/${article.slug}`}
        className="group mt-3 block"
      >
        <h3
          className={`font-serif leading-[1.08] text-brand-navy transition-colors group-hover:text-brand-orange ${compact ? "text-xl" : "text-2xl"}`}
        >
          {article.title}
        </h3>
      </Link>
      {!compact ? (
        <p className="mt-3 text-sm leading-7 text-text-secondary">{article.dek}</p>
      ) : null}
      <div className="mt-3">
        <Meta article={article} />
      </div>
    </article>
  );
}

export function CuratedCard({ article }: { article: Article }) {
  const section = getSection(article.section);

  return (
    <article className="rounded-lg border border-border bg-background-soft p-5">
      <div className="flex flex-wrap items-center gap-2">
        {section ? <SectionBadge section={section} /> : null}
      </div>
      <Link
        href={`/${article.section}/${article.subsegment}/${article.slug}`}
        className="group mt-4 block"
      >
        <h3 className="font-serif text-xl leading-[1.1] text-brand-navy transition-colors group-hover:text-brand-orange">
          {article.title}
        </h3>
      </Link>
      <p className="mt-3 text-sm leading-7 text-text-secondary">{article.dek}</p>
      {article.curatedFrom ? (
        <a
          href={article.curatedUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm font-semibold text-brand-orange hover:underline"
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
