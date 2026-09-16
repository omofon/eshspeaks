import { notFound } from "next/navigation";
import { fetchSection, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockArticlesBySection } from "@/lib/data/mockFallback";
import { SectionLandingPage, type SectionFilter } from "@/components/sections/SectionLandingPage";
import { isMarketsFlavored } from "@/lib/data/marketKeywords";

/**
 * "The Bag" is the Colouresh brand name for the real backend's
 * "business-economy" section — there is no separate "the-bag" slug on the
 * backend, so this reads the real section directly rather than inventing
 * one (see CLAUDE.md's rebrand note on section names being backend-driven).
 */
export const metadata = {
  title: "The Bag",
  description:
    "Trade, industry, and the businesses actually building Nigeria's economy, told from the ground floor, not the boardroom.",
};

export default async function TheBagPage() {
  let sectionData;
  try {
    sectionData = await fetchSection("business-economy");
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const fetched = await fetchArticlesBySection("business-economy", {
    limit: 20,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const { items } =
    fetched.items.length === 0 && USE_MOCK_FALLBACK
      ? mockArticlesBySection("business-economy", 1, 20)
      : fetched;

  const allArticles = items.map((a) => toUiArticle(a, { sectionSlug: "business-economy" }));
  // Complements Money Moves' markets-keyword filter over the same real
  // section, so the two desks read as distinct rather than duplicating
  // each other's lead story — see marketKeywords.ts.
  const tradeArticles = allArticles.filter((a) => !isMarketsFlavored(a));
  const articles = tradeArticles.length >= 3 ? tradeArticles : allArticles;

  const filters: SectionFilter[] = [
    { label: "All" },
    ...sectionData.subsegments.map((sub) => ({
      label: sub.name,
      // Subsegment drill-down routes only exist under the real backend slug
      // (business-economy), not the /the-bag alias — see the file header.
      href: `/business-economy/${sub.slug}` as `/${string}`,
    })),
  ];

  return (
    <SectionLandingPage
      sectionSlug="business-economy"
      hue="var(--green)"
      hueDeep="var(--green-deep)"
      chipLabel="Business & Economy"
      title="The Bag"
      description="Trade, industry, and the businesses actually building Nigeria's economy, told from the ground floor, not the boardroom."
      filters={filters}
      moreHeading="More from The Bag"
      briefTitle="The Bag, Weekly"
      briefDescription="The business stories that actually move markets, every Monday."
      articles={articles}
    />
  );
}
