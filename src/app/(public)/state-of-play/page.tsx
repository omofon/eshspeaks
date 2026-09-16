import { notFound } from "next/navigation";
import { fetchSection, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockArticlesBySection } from "@/lib/data/mockFallback";
import { SectionLandingPage, type SectionFilter } from "@/components/sections/SectionLandingPage";

export const metadata = {
  title: "State of Play",
  description:
    "Party machinery, the National Assembly, and the long road to 2027, tracked state by state.",
};

export default async function StateOfPlayPage() {
  let sectionData;
  try {
    sectionData = await fetchSection("state-of-play");
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const fetched = await fetchArticlesBySection("state-of-play", {
    limit: 20,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const { items } =
    fetched.items.length === 0 && USE_MOCK_FALLBACK
      ? mockArticlesBySection("state-of-play", 1, 20)
      : fetched;

  const articles = items.map((a) => toUiArticle(a, { sectionSlug: "state-of-play" }));

  const filters: SectionFilter[] = [
    { label: "All" },
    ...sectionData.subsegments.map((sub) => ({
      label: sub.name,
      href: `/state-of-play/${sub.slug}` as `/${string}`,
    })),
  ];

  return (
    <SectionLandingPage
      sectionSlug="state-of-play"
      hue="var(--orange)"
      hueDeep="var(--orange-deep)"
      chipLabel="Politics & Governance"
      title="State of Play"
      description="Party machinery, the National Assembly, and the long road to 2027, tracked state by state."
      filters={filters}
      moreHeading="More from State of Play"
      briefTitle="The Morning Brief"
      briefDescription="Politics and markets, in your inbox before 7am WAT."
      articles={articles}
    />
  );
}
