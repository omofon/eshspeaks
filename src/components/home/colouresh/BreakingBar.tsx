import Link from "next/link";
import type { Article } from "@/lib/data/types";
import { articleHref } from "@/components/home/primitives";

export function BreakingBar({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  const items = [...articles, ...articles];

  return (
    <div className="overflow-hidden border-b-2 border-ink bg-red">
      <div className="container-eshspeaks flex items-center gap-4 py-3">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white">
          <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-yellow" />
          BREAKING
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-11 whitespace-nowrap [animation-duration:22s]">
            {items.map((article, i) => (
              <Link
                key={`${article.slug}-${i}`}
                href={articleHref(article)}
                className="text-sm font-bold text-white hover:underline"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
