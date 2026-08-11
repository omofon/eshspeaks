import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSection } from "@/lib/data/sections";
import type { Article as ArticleType } from "@/lib/data/types";
import { SectionTag } from "./SectionTag";
import { PremiumBadge } from "./PremiumBadge";

function articleHref(a: ArticleType) {
  return { pathname: `/${a.section}/${a.subsegment}/${a.slug}` };
}

function Meta({ a }: { a: ArticleType }) {
  return (
    <p className="font-sans text-xs text-muted-foreground">
      {a.byline} · {a.location} · {a.readMinutes} min read
    </p>
  );
}

export function FeaturedCard({ a }: { a: ArticleType }) {
  const section = getSection(a.section);
  return (
    <article className="border-b border-rule pb-6">
      <div className="mb-3 flex items-center gap-2">
        {section ? <SectionTag section={section} /> : null}
        {a.premium ? <PremiumBadge /> : null}
      </div>
      <Link href={articleHref(a)} className="block group">
        <h2 className="font-serif text-3xl leading-tight text-navy group-hover:text-accent md:text-4xl">
          {a.title}
        </h2>
      </Link>
      <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-foreground">{a.dek}</p>
      <div className="mt-3">
        <Meta a={a} />
      </div>
    </article>
  );
}

export function ListCard({ a, compact = false }: { a: ArticleType; compact?: boolean }) {
  const section = getSection(a.section);
  return (
    <article className="border-b border-border py-4">
      <div className="mb-2 flex items-center gap-2">
        {section ? <SectionTag section={section} /> : null}
        {a.premium ? <PremiumBadge /> : null}
      </div>
      <Link href={articleHref(a)} className="block group">
        <h3
          className={`font-serif leading-snug text-navy group-hover:text-accent ${
            compact ? "text-base" : "text-xl"
          }`}
        >
          {a.title}
        </h3>
      </Link>
      {!compact ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.dek}</p>
      ) : null}
      <div className="mt-2">
        <Meta a={a} />
      </div>
    </article>
  );
}

export function CuratedCard({ a }: { a: ArticleType }) {
  const section = getSection(a.section);
  return (
    <article className="rounded-md border border-border bg-card p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        {section ? <SectionTag section={section} /> : null}
        <span className="text-xs text-muted-foreground">Curated</span>
      </div>
      <Link href={articleHref(a)} className="block group">
        <h3 className="font-serif text-lg leading-snug text-navy group-hover:text-accent">
          {a.title}
        </h3>
      </Link>
      <a
        href={a.curatedUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        {a.curatedFrom ?? "Source"}
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
      </a>
    </article>
  );
}
