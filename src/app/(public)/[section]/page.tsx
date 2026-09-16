import { notFound } from "next/navigation";
import { fetchSection, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockArticlesBySection } from "@/lib/data/mockFallback";
import { hueForSlug } from "@/lib/data/sectionHue";
import { SectionLandingPage, type SectionFilter } from "@/components/sections/SectionLandingPage";

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

/**
 * Generic landing page for every real backend section that doesn't have
 * its own Colouresh-branded page (State of Play, The Bag and Money Moves
 * have dedicated routes — see their own page.tsx files). Uses the same
 * SectionLandingPage template as those, just driven entirely by the
 * section's own real name/blurb/subsegments instead of hand-authored copy.
 */
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

  const fetched = await fetchArticlesBySection(section, {
    page,
    limit: 20,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const { items, meta } =
    fetched.items.length === 0 && USE_MOCK_FALLBACK
      ? mockArticlesBySection(sectionData.slug, page, 20)
      : fetched;

  const articles = items.map((a) => toUiArticle(a, { sectionSlug: sectionData.slug }));
  const { hue, hueDeep, chipLabel } = hueForSlug(sectionData.slug);

  const filters: SectionFilter[] = [
    { label: "All" },
    ...sectionData.subsegments.map((sub) => ({
      label: sub.name,
      href: `/${sectionData.slug}/${sub.slug}` as `/${string}`,
    })),
  ];

  return (
    <SectionLandingPage
      sectionSlug={sectionData.slug}
      hue={hue}
      hueDeep={hueDeep}
      chipLabel={chipLabel}
      title={sectionData.name}
      description={`${meta.total} ${meta.total === 1 ? "story" : "stories"} filed under ${sectionData.name.toLowerCase()}.`}
      filters={filters}
      moreHeading={`More from ${sectionData.name}`}
      briefTitle={`${sectionData.name}, Weekly`}
      briefDescription={`The latest from ${sectionData.name.toLowerCase()}, in your inbox.`}
      articles={articles}
      pagination={{
        page: meta.page,
        totalPages: meta.totalPages,
        hasNext: meta.hasNext,
        hasPrevious: meta.hasPrevious,
      }}
    />
  );
}
