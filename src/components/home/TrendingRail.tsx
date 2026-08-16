import Link from "next/link";
import type { Article } from "@/lib/data/types";
import { articleHref } from "./primitives";
import { getSection } from "@/lib/data/sections";

/**
 * Newsroom rail — warm editorial tint, numbered hierarchy.
 * Deliberately not card-shaped so it never reads as an ad unit.
 */
export function TrendingRail({
  title = "What's happening now",
  articles,
  lede,
}: {
  title?: string;
  articles: Article[];
  lede?: string;
}) {
  const [first, ...rest] = articles;

  return (
    <section
      aria-label={title}
      className="border-t-2 border-accent bg-accent-soft/70 px-5 py-6 sm:px-6"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h2 className="kicker truncate">{title}</h2>
        <span className="meta shrink-0">Updated hourly</span>
      </div>
      {lede ? <p className="mt-2 text-sm leading-6 text-text-secondary">{lede}</p> : null}

      {first ? (
        <Link href={articleHref(first)} className="group mt-5 block border-b border-accent/25 pb-5">
          <span className="kicker text-maroon">
            {getSection(first.section)?.name ?? first.section}
          </span>
          <h3 className="headline-sm mt-2 text-navy transition-colors group-hover:text-accent">
            {first.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{first.dek}</p>
        </Link>
      ) : null}

      <ol className="mt-4 space-y-4">
        {rest.map((article, index) => (
          <li key={article.slug} className="border-b border-accent/20 pb-4 last:border-0 last:pb-0">
            <Link href={articleHref(article)} className="group flex gap-3">
              <span className="mt-0.5 font-mono text-[13px] font-semibold text-accent" aria-hidden>
                {String(index + 2).padStart(2, "0")}
              </span>
              <span className="min-w-0 font-serif text-[16px] leading-6 text-navy transition-colors group-hover:text-accent">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
