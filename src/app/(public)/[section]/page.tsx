import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchSection, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ListCard } from "@/components/editorial";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  try {
    const sectionData = await fetchSection(section);
    return {
      title: sectionData.name,
      description: `Latest ${sectionData.name.toLowerCase()} reporting from EshSpeaks.`,
    };
  } catch {
    return { title: "Section" };
  }
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { section } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let sectionData;
  try {
    sectionData = await fetchSection(section);
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const { items, meta } = await fetchArticlesBySection(section, { page, limit: 20 });

  return (
    <>
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Section
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">{sectionData.name}</h1>
        {sectionData.subsegments.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {sectionData.subsegments.map((sub) => (
              <Link
                key={sub.slug}
                href={`/${sectionData.slug}/${sub.slug}`}
                className="rounded-full border border-border px-3 py-1 text-sm text-text-secondary hover:border-brand-orange hover:text-brand-orange"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-base leading-7 text-text-secondary">
          {meta.total} {meta.total === 1 ? "story" : "stories"} filed under{" "}
          {sectionData.name.toLowerCase()}.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
              No stories published in this section yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((article) => (
                <ListCard
                  key={article.slug}
                  article={toUiArticle(article, { sectionSlug: sectionData.slug })}
                />
              ))}
            </div>
          )}

          {meta.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
              <PageLink
                section={sectionData.slug}
                page={page - 1}
                disabled={!meta.hasPrevious}
                label="Newer"
              />
              <span className="text-text-secondary">
                Page {meta.page} of {meta.totalPages}
              </span>
              <PageLink
                section={sectionData.slug}
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
  page,
  disabled,
  label,
}: {
  section: string;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="cursor-not-allowed text-text-secondary/40">{label}</span>;
  }
  return (
    <Link
      href={`/${section}?page=${page}`}
      className="font-semibold text-brand-orange hover:underline"
    >
      {label}
    </Link>
  );
}
