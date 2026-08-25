import { API_BASE_URL } from "@/lib/auth/config";

const API_PREFIX = "/api/v1";

/**
 * The `GET /api/v1/sections` response schema is documented as `[{}]` —
 * Swagger has no DTO for it, so this shape is inferred from the create
 * payload (`POST /api/v1/sections` takes `name`, `slug`, `isSponsored`)
 * plus the `sectionId`/`subsegmentId` UUIDs the article-create endpoint
 * expects. Confirm against a real response before relying on any field
 * not in the create body.
 */
export interface ApiSubsegment {
  id: string;
  name: string;
  slug: string;
}

export interface ApiSection {
  id: string;
  name: string;
  slug: string;
  isSponsored: boolean;
  subsegments: ApiSubsegment[];
}

export class SectionsApiError extends Error {}

export async function fetchSections(): Promise<ApiSection[]> {
  if (!API_BASE_URL) throw new SectionsApiError("Backend is not configured.");

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}/sections`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new SectionsApiError("We couldn't reach EshSpeaks. Check your connection and try again.");
  }

  if (!res.ok) throw new SectionsApiError(`Couldn't load sections (${res.status}).`);
  const body = await res.json().catch(() => null);
  if (!Array.isArray(body)) throw new SectionsApiError("Unexpected /sections response shape.");

  return (body as unknown[]).map((raw): ApiSection => {
    const s = raw as Partial<ApiSection> | null;
    const rawSubsegments = s?.subsegments as unknown;
    return {
      id: s?.id ?? "",
      name: s?.name ?? "",
      slug: s?.slug ?? "",
      isSponsored: Boolean((s as { isSponsored?: unknown } | null)?.isSponsored),
      subsegments: Array.isArray(rawSubsegments)
        ? rawSubsegments.map((subRaw): ApiSubsegment => {
            const sub = subRaw as Partial<ApiSubsegment> | null;
            return {
              id: sub?.id ?? "",
              name: sub?.name ?? "",
              slug: sub?.slug ?? "",
            };
          })
        : [],
    };
  });
}
