import { ArticleCardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section>
        <div className="border-b border-border pb-8">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-10 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-8 grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} showDek />
          ))}
        </div>
      </section>
      <aside>
        <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/40" />
      </aside>
    </div>
  );
}
