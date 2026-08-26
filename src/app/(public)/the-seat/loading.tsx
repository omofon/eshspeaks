import { ArticleCardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} showDek />
          ))}
        </div>
      </section>
      <aside className="h-64 animate-pulse rounded-lg border border-border bg-muted/40" />
    </div>
  );
}
