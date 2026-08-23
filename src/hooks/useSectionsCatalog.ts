"use client";

import { useEffect, useState } from "react";
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
const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function toMockCatalog(): ApiSection[] {
  return mockSections.map((s) => ({
    id: `mock-${s.slug}`,
    name: s.name,
    slug: s.slug,
    isSponsored: false,
    subsegments: s.subsegments.map((sub) => ({ id: `mock-${s.slug}-${sub.slug}`, name: sub.name, slug: sub.slug })),
  }));
}

export function useSectionsCatalog() {
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSections()
      .then((data) => {
        if (cancelled) return;
        setSections(data);
        setUsingMock(false);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (USE_MOCK_FALLBACK) {
          setSections(toMockCatalog());
          setUsingMock(true);
          setError(null);
        } else {
          setSections([]);
          setError(e instanceof Error ? e.message : "Couldn't load sections.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { sections, loading, error, usingMock };
}
