import { apiRequest, toQueryString, ApiError } from "@/lib/api/client";

export { ApiError as AdsApiError } from "@/lib/api/client";

/**
 * Ad slot resolution (Sprint 4).
 *
 * `GET /ads/slot` is not live yet. Until it ships, `fetchAdSlot` 404s and
 * `<AdSlot>` renders nothing in production (a labelled placeholder in dev,
 * so the layout is visible while the backend is built). Premium readers
 * never call this at all: suppression happens in the component.
 *
 * Proposed contract (see CMS-BACKEND-REQUESTS.md):
 *
 *   GET /ads/slot?placement=&section=&sector=        (public, cache ~60s)
 *     -> 200 {
 *          id: string,
 *          placement: AdPlacement,
 *          sponsor?: string | null,        // "Sponsored by ..." label
 *          creative:
 *            | { type: "image",  imageUrl, clickUrl, alt }
 *            | { type: "iframe", src }      // ad-server frame, rendered sandboxed
 *            | null                         // no fill: render nothing
 *        }
 *
 * `section` is the section slug of the page; `sector` is the first
 * `sectorTags` entry of the article (article pages only). Both are hints
 * for targeting and may be omitted.
 */

export type AdPlacement = "leaderboard" | "in-feed" | "sidebar" | "sponsored-segment";

export type AdCreative =
  | { type: "image"; imageUrl: string; clickUrl: string; alt: string }
  | { type: "iframe"; src: string };

export interface AdSlotResponse {
  id: string;
  placement: AdPlacement;
  sponsor?: string | null;
  creative: AdCreative | null;
}

export async function fetchAdSlot(params: {
  placement: AdPlacement;
  section?: string | undefined;
  sector?: string | undefined;
}): Promise<AdSlotResponse | null> {
  const data = await apiRequest<AdSlotResponse | null>(
    `/ads/slot${toQueryString({
      placement: params.placement,
      section: params.section,
      sector: params.sector,
    })}`,
    { method: "GET" },
  );
  return data ?? null;
}

/** True when the failure is "the endpoint isn't live yet", not a real error. */
export function isAdsUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === "not_found" || error.status === 404);
}
