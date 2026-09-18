import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/data/types";
import { articleHref } from "@/components/home/primitives";
import { AdSlot } from "@/components/AdSlot";
import { SectionHeading } from "./SectionHeading";

function deskColorFor(article: Article): string {
  const name = (article.sectionName ?? article.section).toLowerCase();
  if (name.includes("business") || name.includes("bag") || name.includes("economy"))
    return "var(--green)";
  if (name.includes("financ") || name.includes("money") || name.includes("market"))
    return "var(--yellow)";
  if (name.includes("securit") || name.includes("metro") || name.includes("red zone"))
    return "var(--red)";
  if (name.includes("cultur") || name.includes("opinion") || name.includes("seat"))
    return "var(--purple)";
  return "var(--orange)";
}

function StoryCard({ article }: { article: Article }) {
  const color = deskColorFor(article);
  return (
    <Link
      href={articleHref(article)}
      className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white"
    >
      <div
        className="relative aspect-[16/10]"
        style={{ background: `linear-gradient(150deg,${color},#fff)` }}
      >
        {article.image ? (
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <span className="absolute bottom-2.5 left-3 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[10.5px] font-bold">
          {article.sectionName ?? article.section}
        </span>
        {article.premium ? (
          <span className="absolute right-2.5 top-2.5 rounded-full border-2 border-ink bg-yellow px-2 py-1 text-[10px] font-bold">
            Premium
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="text-[16px] font-bold leading-[1.35] text-ink">{article.title}</h4>
        <p className="text-[12.5px] text-ink-soft">{article.dek}</p>
        <div className="mt-auto flex justify-between border-t border-dashed border-line pt-2 text-[11.5px] font-semibold text-ink-soft">
          <span>{article.byline}</span>
          <span>{article.readMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

export function TodayStories({ articles }: { articles: Article[] }) {
  return (
    <section className="container-colouresh py-14 sm:py-16">
      <div className="mb-12">
        <AdSlot placement="leaderboard" />
      </div>

      <SectionHeading
        dot="var(--orange)"
        chipLabel="Read"
        title="Today's stories"
        note="The reporting behind the headlines, from every desk."
      />

      {articles.length === 0 ? (
        <p className="text-sm text-ink-soft">
          The newsroom is just getting started, stories will appear here as soon as they publish.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Fragment key={article.slug}>
              {i === 2 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <AdSlot placement="in-feed" />
                </div>
              ) : null}
              <StoryCard article={article} />
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
