import { fetchAllArticles } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { USE_MOCK_FALLBACK, mockAllArticles } from "@/lib/data/mockFallback";
import { SeatHero } from "@/components/seat/SeatHero";
import { SeatTopics } from "@/components/seat/SeatTopics";
import { SeatThread } from "@/components/seat/SeatThread";
import { SeatCorner } from "@/components/seat/SeatCorner";
import { SeatPicks } from "@/components/seat/SeatPicks";
import { SeatCommunity } from "@/components/seat/SeatCommunity";
import { SeatNewsletter } from "@/components/seat/SeatNewsletter";
import { SeatMembership } from "@/components/seat/SeatMembership";
import { SeatEvents } from "@/components/seat/SeatEvents";
import { SeatClosing } from "@/components/seat/SeatClosing";

export const metadata = {
  title: "The Seat",
  description:
    "A forum for the views, opinions, and perspective that don't fit in a headline. Started by Colouresh, carried forward by whoever's willing to talk.",
};

/**
 * The Seat is specced in CMS-BACKEND-REQUESTS-2 (B1) as a full community
 * forum (topics, posts, corner, editor's picks, spotlights, partnerships,
 * newsletter, membership, live events) but none of those /seat/* endpoints
 * exist yet — "Suggest freezing the forum contract (B1) before the
 * frontend builds the real page" is that doc's own recommendation. So this
 * builds the visual page now, ahead of the backend, same as that plan
 * anticipates: every section below is either real content this app
 * already has, or static/local-only UI until its own endpoint exists.
 *
 * Editor's picks reads the general real article feed (there is no real or
 * mock "features-ideas/the-seat" subsegment with actual content, so
 * reading that empty subsegment the way the old /the-seat page did would
 * always render an empty picks rail).
 */
export default async function TheSeatPage() {
  const result = await fetchAllArticles({ limit: 6, sortBy: "publishedAt", sortOrder: "desc" });
  const effective = result.items.length === 0 && USE_MOCK_FALLBACK ? mockAllArticles(1, 6) : result;
  const articles = effective.items.map((a) => toUiArticle(a));

  return (
    <div>
      <SeatHero />
      <SeatTopics />
      <SeatThread />
      <SeatCorner />
      <SeatPicks articles={articles} />
      <SeatCommunity />
      <SeatNewsletter />
      <SeatMembership />
      <SeatEvents />
      <SeatClosing />
    </div>
  );
}
