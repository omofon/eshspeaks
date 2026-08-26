"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSections, type ApiSection } from "@/lib/api/sections";
import { sections as mockSections } from "@/lib/data/sections";

/**
 * Dev-only fallback so the editor is usable before the backend has real
 * section data (or while offline). Mock sections have no real ids, so
 * these are NOT valid `sectionId`/`subsegmentId` values against the live
 * API — submitting a draft built from mock data will fail. Gated behind
 * an explicit env var per the "controlled dev fallback" rule: never mix
 * mock data into a production response silently.
 */
const USE_MOCK_FALLBACK = process.env["NEXT_PUBLIC_USE_MOCK_DATA"] === "true";

function toMockCatalog(): ApiSection[] {
  return mockSections.map((s) => ({
    id: `mock-${s.slug}`,
    name: s.name,
    slug: s.slug,
    isSponsored: false,
    subsegments: s.subsegments.map((sub) => ({
      id: `mock-${s.slug}-${sub.slug}`,
      name: sub.name,
      slug: sub.slug,
    })),
  }));
}

/** Shared cache key — every consumer (header, mobile drawer, admin forms,
 *  editor) resolves to the same React Query cache entry, so mounting the
 *  hook in five places still fires exactly one network request. */
export const SECTIONS_QUERY_KEY = ["sections"] as const;

export function useSectionsCatalog() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: SECTIONS_QUERY_KEY,
    queryFn: fetchSections,
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
  });

  const usingMock = USE_MOCK_FALLBACK && Boolean(error) && !data;
  const sections = data ?? (usingMock ? toMockCatalog() : []);

  return {
    sections,
    loading: isLoading,
    fetching: isFetching,
    error:
      !usingMock && error
        ? error instanceof Error
          ? error.message
          : "Couldn't load sections."
        : null,
    usingMock,
  };
}
