import React from "react";
import Link from "next/link";
import { sections } from "@/lib/data/sections";
import { SectionDropdown } from "./SectionDropdown";

export function SectionNavigation() {
  return (
    <nav
      aria-label="Sections"
      className="hidden bg-navy shadow-[0_1px_0_rgba(252,251,248,0.14)] md:block"
    >
      <div className="container-eshspeaks">
        <ul className="scrollbar-hide flex w-full flex-nowrap items-center justify-between overflow-x-auto whitespace-nowrap border-b border-text-inverse/15 py-2 lg:overflow-visible">
          {sections.map((s) => (
            <li key={s.slug} className="flex shrink-0 items-center">
              {s.subsegments && s.subsegments.length > 0 ? (
                <SectionDropdown section={s as never} inverted />
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
