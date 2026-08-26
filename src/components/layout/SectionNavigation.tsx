"use client";

import React from "react";
import Link from "next/link";
import { useSectionsCatalog } from "@/hooks/useSectionsCatalog";
import { toUiSection } from "@/lib/api/adapters";
import { SectionDropdown } from "./SectionDropdown";

export function SectionNavigation() {
  const { sections, loading } = useSectionsCatalog();

  return (
    <nav
      aria-label="Sections"
      className="hidden bg-navy shadow-[0_1px_0_rgba(252,251,248,0.14)] md:block"
    >
      <div className="container-eshspeaks">
        <ul className="scrollbar-hide flex w-full flex-nowrap items-center justify-between overflow-x-auto whitespace-nowrap border-b border-text-inverse/15 py-2 lg:overflow-visible">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="h-4 w-16 shrink-0 animate-pulse rounded bg-text-inverse/10"
                />
              ))
            : sections.map((s, i) => (
                <li key={s.slug} className="flex shrink-0 items-center">
                  {s.subsegments && s.subsegments.length > 0 ? (
                    <SectionDropdown section={toUiSection(s, i)} inverted />
                  ) : (
                    <Link
                      href={`/${s.slug}`}
                      className="block cursor-pointer py-1.5 text-[12px] font-medium tracking-[0.04em] text-text-inverse/80 transition-colors hover:text-accent"
                    >
                      {s.name}
                    </Link>
                  )}
                </li>
              ))}
          <li className="shrink-0">
            <Link
              href="/the-seat"
              className="block cursor-pointer py-1.5 text-[12px] font-semibold tracking-[0.04em] text-accent transition-colors hover:text-accent-hover"
            >
              The Seat
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SectionNavigation;
