import { fetchAllArticles } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockAllArticles } from "@/lib/data/mockFallback";
import { AdSlot } from "@/components/AdSlot";
import { Hero } from "@/components/home/colouresh/Hero";
import { BreakingBar } from "@/components/home/colouresh/BreakingBar";
import { WatchSection, ListenSection } from "@/components/home/colouresh/WatchListen";
import { TodayStories } from "@/components/home/colouresh/TodayStories";
import {
  TrendingSocial,
  PopularGrid,
  EventsOpportunities,
  SeatCTA,
  ShareStoryCTA,
  Partners,
  ExploreDesks,
} from "@/components/home/colouresh/StaticSections";

export const metadata = {
  title: "Colouresh — Nigerian stories, told in colour",
  description:
    "Nigeria's stories, watched, listened to, read and argued about, all in one place: politics, business, security and public life.",
  openGraph: {
    title: "Colouresh — Nigerian stories, told in colour",
    description:
      "Nigeria's stories, watched, listened to, read and argued about, all in one place.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function HomePage() {
  const articlesResult = await fetchAllArticles({
    limit: 30,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const effectiveResult =
    articlesResult.items.length === 0 && USE_MOCK_FALLBACK
      ? mockAllArticles(1, 30)
      : articlesResult;

  const articles = effectiveResult.items.map((a) => toUiArticle(a));

  return (
    <div>
      <h1 className="sr-only">Colouresh — today&rsquo;s front page</h1>

      <Hero />
      <BreakingBar articles={articles.slice(0, 4)} />
      <WatchSection />
      <ListenSection />
      <TodayStories articles={articles.slice(0, 6)} />
      <TrendingSocial />
      <PopularGrid />
      <EventsOpportunities />
      <SeatCTA />
      <ShareStoryCTA />
      <Partners />
      <ExploreDesks />

      <div className="border-t-2 border-line py-6">
        <AdSlot placement="leaderboard" />
      </div>
    </div>
  );
}
