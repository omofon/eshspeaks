import { notFound } from "next/navigation";
import { fetchSection, SectionsApiError } from "@/lib/api/sections";
import { fetchArticlesBySection } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockArticlesBySection } from "@/lib/data/mockFallback";
import { SectionLandingPage } from "@/components/sections/SectionLandingPage";
import { MarketStrip } from "@/components/sections/MarketStrip";
import { isMarketsFlavored } from "@/lib/data/marketKeywords";

export const metadata = {
  title: "Money Moves",
  description:
    "The naira, the NGX, and the policy decisions that decide what things cost, explained plainly.",
};

export default async function MoneyMovesPage() {
  try {
    await fetchSection("business-economy");
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const fetched = await fetchArticlesBySection("business-economy", {
    limit: 30,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const { items } =
    fetched.items.length === 0 && USE_MOCK_FALLBACK
      ? mockArticlesBySection("business-economy", 1, 30)
      : fetched;

  const allArticles = items.map((a) => toUiArticle(a, { sectionSlug: "business-economy" }));
  const marketArticles = allArticles.filter(isMarketsFlavored);
  const articles = marketArticles.length >= 3 ? marketArticles : allArticles;

  return (
    <SectionLandingPage
      sectionSlug="business-economy"
      hue="var(--yellow)"
      hueDeep="var(--yellow-deep)"
      chipLabel="Markets & Finance"
      title="Money Moves"
      description="The naira, the NGX, and the policy decisions that decide what things cost, explained plainly."
      filters={[{ label: "All" }, { label: "Forex" }, { label: "Banking" }, { label: "Markets" }]}
      moreHeading="More from Money Moves"
      briefTitle="Money Moves, Daily"
      briefDescription="The naira, the NGX, and the numbers that matter, every morning."
      briefBg="var(--yellow-deep)"
      briefText="var(--ink)"
      articles={articles}
      marketStrip={<MarketStrip />}
    />
  );
}
