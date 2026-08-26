import { apiRequest, ApiError } from "@/lib/api/client";
import type { ApiSection, ApiSubsegment } from "@/lib/api/types";

export { ApiError as SectionsApiError };
export type { ApiSection, ApiSubsegment };

/**
 * FIXED: this previously did `res.json()` and checked `Array.isArray(body)`
 * directly — but the confirmed live envelope wraps every response in
 * `{success, data, message}`, so `GET /sections` actually returns
 * `{"success":true,"data":[],...}`. `Array.isArray(body)` was false for
 * every real call, so this threw "Unexpected /sections response shape" on
 * every single request against the live backend. apiRequest() now
 * unwraps `data` before this ever sees it.
 */
/**
 * Section/subsegment structure changes rarely, so GET /sections is safe to
 * put behind Next's shared fetch cache (unlike article/user-scoped
 * endpoints, nothing here varies per visitor). This is what turns "every
 * consumer refetches on every request" into "one backend call per 5
 * minutes, shared by every page and every reader" — the fix for the 429s
 * this endpoint was causing under concurrent load.
 */
export async function fetchSections(): Promise<ApiSection[]> {
  const data = await apiRequest<unknown>("/sections", {
    method: "GET",
    next: { revalidate: 300 },
  });
  if (!Array.isArray(data)) throw new ApiError("server", "Unexpected /sections response shape.");
  return data.map(normalizeSection);
}

export async function fetchSection(slug: string): Promise<ApiSection> {
  const data = await apiRequest<unknown>(`/sections/${encodeURIComponent(slug)}`, {
    method: "GET",
    next: { revalidate: 300 },
  });
  return normalizeSection(data);
}

export async function fetchSubsegment(
  sectionSlug: string,
  subsegmentSlug: string,
): Promise<ApiSubsegment> {
  const data = await apiRequest<Partial<ApiSubsegment> | null>(
    `/sections/${encodeURIComponent(sectionSlug)}/${encodeURIComponent(subsegmentSlug)}`,
    { method: "GET", next: { revalidate: 300 } },
  );
  return { id: data?.id ?? "", name: data?.name ?? "", slug: data?.slug ?? "" };
}

/** Chief Editor only — backend enforces via RolesGuard. */
export function createSection(payload: {
  name: string;
  slug: string;
  isSponsored?: boolean;
}): Promise<ApiSection> {
  return apiRequest<unknown>("/sections", { method: "POST", auth: true, body: payload }).then(
    normalizeSection,
  );
}

/** Section Lead (own sections only) or Chief Editor — backend enforces. */
export function updateSection(
  slug: string,
  payload: Partial<{ name: string; slug: string; isSponsored: boolean }>,
): Promise<ApiSection> {
  return apiRequest<unknown>(`/sections/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    auth: true,
    body: payload,
  }).then(normalizeSection);
}

/** Chief Editor only; refused while the section still holds articles. */
export function deleteSection(slug: string): Promise<void> {
  return apiRequest<void>(`/sections/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    auth: true,
  });
}

export function createSubsegment(
  sectionSlug: string,
  payload: { name: string; slug: string },
): Promise<ApiSubsegment> {
  return apiRequest<Partial<ApiSubsegment> | null>(
    `/sections/${encodeURIComponent(sectionSlug)}/subsegments`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  ).then((data) => ({ id: data?.id ?? "", name: data?.name ?? "", slug: data?.slug ?? "" }));
}

export function updateSubsegment(
  sectionSlug: string,
  subsegmentSlug: string,
  payload: Partial<{ name: string; slug: string }>,
): Promise<ApiSubsegment> {
  return apiRequest<Partial<ApiSubsegment> | null>(
    `/sections/${encodeURIComponent(sectionSlug)}/subsegments/${encodeURIComponent(subsegmentSlug)}`,
    { method: "PATCH", auth: true, body: payload },
  ).then((data) => ({ id: data?.id ?? "", name: data?.name ?? "", slug: data?.slug ?? "" }));
}

/** Refused (409 SECTION_NOT_EMPTY) while the subsegment still holds articles. */
export function deleteSubsegment(sectionSlug: string, subsegmentSlug: string): Promise<void> {
  return apiRequest<void>(
    `/sections/${encodeURIComponent(sectionSlug)}/subsegments/${encodeURIComponent(subsegmentSlug)}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
}

function normalizeSection(raw: unknown): ApiSection {
  const s = raw as Partial<ApiSection> | null;
  const rawSubsegments = s?.subsegments as unknown;
  return {
    id: s?.id ?? "",
    name: s?.name ?? "",
    slug: s?.slug ?? "",
    isSponsored: Boolean(s?.isSponsored),
    subsegments: Array.isArray(rawSubsegments)
      ? rawSubsegments.map((subRaw): ApiSubsegment => {
          const sub = subRaw as Partial<ApiSubsegment> | null;
          return { id: sub?.id ?? "", name: sub?.name ?? "", slug: sub?.slug ?? "" };
        })
      : [],
  };
}
