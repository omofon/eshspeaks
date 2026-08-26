import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors home/cards.tsx StoryCard: image, kicker, headline, byline. */
export function ArticleCardSkeleton({ showDek = false }: { showDek?: boolean }) {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/2] w-full rounded-sm" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      {showDek ? (
        <>
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </>
      ) : null}
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

/** Mirrors home/cards.tsx CompactStoryCard used in the lead grid's rail. */
export function CompactStoryCardSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-20 w-28 shrink-0 rounded-sm" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/** Mirrors home/sections.tsx SectionLeadGrid — lead story + compact rail. */
export function SectionLeadGridSkeleton() {
  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-px flex-1" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <ArticleCardSkeleton showDek />
        <div className="space-y-5 lg:border-l lg:border-rule lg:pl-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CompactStoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Mirrors home/sections.tsx SectionStoryGrid — an even row of cards. */
export function SectionStoryGridSkeleton({ columns = 3 }: { columns?: 3 | 4 }) {
  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-px flex-1" />
      </div>
      <div
        className={`grid gap-8 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ArticleCardSkeleton key={i} showDek={columns === 3} />
        ))}
      </div>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="container-eshspeaks py-6 sm:py-8">
      <SectionLeadGridSkeleton />
      <Skeleton className="mt-14 h-24 w-full" />
      <SectionStoryGridSkeleton columns={3} />
      <SectionStoryGridSkeleton columns={4} />
    </div>
  );
}

/** Section/subsegment listing pages: header strip + a uniform article grid. */
export function SectionPageSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div className="container-eshspeaks py-6 sm:py-8">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-10 w-64" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <ArticleCardSkeleton key={i} showDek />
        ))}
      </div>
    </div>
  );
}

/** Full article page: kicker, headline, byline strip, hero image, body lines. */
export function ArticlePageSkeleton() {
  return (
    <div className="container-eshspeaks max-w-3xl py-8">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-2 h-10 w-4/5" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="mt-8 aspect-[16/9] w-full rounded-sm" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-sm border border-rule">
      <div
        className="grid gap-4 border-b border-rule bg-muted/40 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-b border-rule px-4 py-3 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-sm border border-rule p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
