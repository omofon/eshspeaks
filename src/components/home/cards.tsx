import Link from "next/link";
import type { Article } from "@/lib/data/types";
import { articleHref, Byline, Kicker, Media } from "./primitives";

/** A: the story that owns the page. */
export function LeadStory({ article, tint }: { article: Article; tint?: string | undefined }) {
  return (
    <article className="group">
      <Link href={articleHref(article)} className="block">
        <Media
          article={article}
          ratio="3/2"
          priority
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 55vw, 100vw"
        />
        <div className="mt-4">
          <Kicker article={article} tint={tint} />
          <h2 className="headline-lg mt-2 text-navy transition-colors group-hover:text-accent">
            {article.title}
          </h2>
        </div>
      </Link>
      <p className="mt-3 max-w-[46ch] text-[17px] leading-8 text-text-secondary">{article.dek}</p>
      <div className="mt-3">
        <Byline article={article} />
      </div>
      {article.image?.credit ? (
        <p className="meta mt-2 text-[10px]">Photograph · {article.image.credit}</p>
      ) : null}
    </article>
  );
}

/** B: supporting story. Medium image, medium headline, short dek. */
export function StoryCard({
  article,
  showDek = true,
  ratio = "16/9",
  tint,
}: {
  article: Article;
  showDek?: boolean;
  ratio?: "16/9" | "4/3" | "3/2";
  tint?: string | undefined;
}) {
  return (
    <article className="group">
      <Link href={articleHref(article)} className="block">
        <Media
          article={article}
          ratio={ratio}
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 100vw"
        />
        <div className="mt-3">
          <Kicker article={article} tint={tint} />
          <h3 className="headline-sm mt-2 text-navy transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </div>
      </Link>
      {showDek ? (
        <p className="mt-2 line-clamp-3 text-[15px] leading-7 text-text-secondary">{article.dek}</p>
      ) : null}
      <div className="mt-2">
        <Byline article={article} withRead={false} />
      </div>
    </article>
  );
}

/** C: tertiary. Horizontal thumbnail, compact metadata. */
export function CompactStoryCard({
  article,
  divider = true,
  tint,
}: {
  article: Article;
  divider?: boolean;
  tint?: string | undefined;
}) {
  return (
    <article className={divider ? "border-b border-border pb-4 last:border-0 last:pb-0" : ""}>
      <Link
        href={articleHref(article)}
        className="group grid grid-cols-[minmax(0,1fr)_92px] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_104px]"
      >
        <div className="min-w-0">
          <Kicker article={article} tint={tint} />
          <h3 className="mt-1.5 font-serif text-[17px] leading-6 text-navy transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <div className="mt-1.5">
            <Byline article={article} withRead={false} />
          </div>
        </div>
        <Media article={article} ratio="1/1" sizes="104px" className="shrink-0" />
      </Link>
    </article>
  );
}

/** Text-only unit for dense chronological lists. */
export function LatestItem({ article }: { article: Article }) {
  return (
    <article className="grid grid-cols-[54px_minmax(0,1fr)] gap-4 border-b border-border py-4 last:border-0">
      <time className="meta pt-1" dateTime={article.date}>
        {new Date(article.date).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}
      </time>
      <div className="min-w-0">
        <Link href={articleHref(article)} className="group block">
          <h3 className="font-serif text-[17px] leading-6 text-navy transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
        <div className="mt-1.5">
          <Byline article={article} />
        </div>
      </div>
    </article>
  );
}
