import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/data/types";
import { getSection } from "@/lib/data/sections";

/** Canonical article href — one place, so cards never drift apart. */
export const articleHref = (a: Article) =>
  `/${a.section}/${a.subsegment}/${a.slug}` as `/${string}`;

/** Section tint tokens registered in globals.css (--color-tint-*). */
export function sectionTintClass(tint?: string) {
  switch (tint) {
    case "politics":
      return "text-tint-politics";
    case "business":
      return "text-tint-business";
    case "security":
      return "text-tint-security";
    case "stateofplay":
      return "text-tint-stateofplay";
    case "energy":
      return "text-tint-energy";
    case "law":
      return "text-tint-law";
    case "foreign":
      return "text-tint-foreign";
    case "tech":
      return "text-tint-tech";
    default:
      return "text-accent";
  }
}

export function Kicker({ article, tone = "tint" }: { article: Article; tone?: "tint" | "inverse" }) {
  const section = getSection(article.section);
  const color = tone === "inverse" ? "text-accent" : sectionTintClass(section?.tint);
  return (
    <span className={`kicker ${color}`}>
      {section?.name ?? article.section}
      {article.premium ? <span className="ml-2 text-maroon">· Premium</span> : null}
    </span>
  );
}

export function Byline({
  article,
  withRead = true,
  tone = "default",
}: {
  article: Article;
  withRead?: boolean;
  tone?: "default" | "inverse";
}) {
  const date = new Date(article.date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
  return (
    <p className={`meta ${tone === "inverse" ? "text-text-inverse/60" : ""}`}>
      {article.byline} · {date}
      {withRead ? ` · ${article.readMinutes} min` : ""}
    </p>
  );
}

/**
 * Editorial media frame. Aspect ratio is a deliberate choice per hierarchy
 * level, never a single global crop.
 */
export function Media({
  article,
  ratio,
  sizes,
  priority = false,
  className = "",
}: {
  article: Article;
  ratio: "16/9" | "3/2" | "4/3" | "1/1";
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`media-frame relative ${className}`} style={{ aspectRatio: ratio }}>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="object-cover"
      />
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  tint,
  blurb,
}: {
  title: string;
  href?: `/${string}`;
  tint?: string;
  blurb?: string;
}) {
  return (
    <div className="mb-6 border-t-2 border-navy pt-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
        <h2 className={`kicker ${sectionTintClass(tint)} truncate text-[12px]`}>{title}</h2>
        {href ? (
          <Link href={href} className="shrink-0 text-[12px] font-semibold text-accent hover:underline">
            All coverage
          </Link>
        ) : null}
      </div>
      {blurb ? <p className="mt-2 max-w-2xl text-sm text-text-secondary">{blurb}</p> : null}
    </div>
  );
}
