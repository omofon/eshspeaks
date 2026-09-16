export default function Loading() {
  return (
    <div className="container-eshspeaks py-14 sm:py-20">
      <div className="h-8 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-5 h-14 w-full max-w-lg animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border-2 border-border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}
