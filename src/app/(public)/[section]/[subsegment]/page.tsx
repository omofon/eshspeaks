import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchSection, fetchSubsegment, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySubsegment } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ListCard } from "@/components/editorial";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; subsegment: string }>;
}) {
  const { section, subsegment } = await params;
  try {
    const subsegmentData = await fetchSubsegment(section, subsegment);
    return {
      title: subsegmentData.name,
      description: `Latest ${subsegmentData.name.toLowerCase()} reporting from EshSpeaks.`,
    };
  } catch {
    return { title: "Subsegment" };
  }
}

export default async function SubsegmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string; subsegment: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { section, subsegment } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let sectionData;
  let subsegmentData;
  try {
    [sectionData, subsegmentData] = await Promise.all([
      fetchSection(section),
      fetchSubsegment(section, subsegment),
    ]);
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const { items, meta } = await fetchArticlesBySubsegment(section, subsegment, { page, limit: 20 });

  return (
    <>
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          {sectionData.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          {subsegmentData.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          {meta.total} {meta.total === 1 ? "story" : "stories"} filed under{" "}
          {subsegmentData.name.toLowerCase()}.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
              No stories published here yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((article) => (
                <ListCard
                  key={article.slug}
                  article={toUiArticle(article, {
                    sectionSlug: sectionData.slug,
                    subsegmentSlug: subsegmentData.slug,
                  })}
                />
              ))}
            </div>
          )}

          {meta.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
              <PageLink
                section={sectionData.slug}
                subsegment={subsegmentData.slug}
                page={page - 1}
                disabled={!meta.hasPrevious}
                label="Newer"
              />
              <span className="text-text-secondary">
                Page {meta.page} of {meta.totalPages}
              </span>
              <PageLink
                section={sectionData.slug}
                subsegment={subsegmentData.slug}
                page={page + 1}
                disabled={!meta.hasNext}
                label="Older"
              />
            </nav>
          ) : null}
        </div>
        <aside>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}

function PageLink({
  section,
  subsegment,
  page,
  disabled,
  label,
}: {
  section: string;
  subsegment: string;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="cursor-not-allowed text-text-secondary/40">{label}</span>;
  }
  return (
    <Link
      href={`/${section}/${subsegment}?page=${page}`}
      className="font-semibold text-brand-orange hover:underline"
    >
      {label}
    </Link>
  );
}
