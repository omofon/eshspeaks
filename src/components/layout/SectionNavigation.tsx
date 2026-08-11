"use client";

import React from "react";
import Link from "next/link";
import { sections } from "@/lib/data/sections";
import { SectionDropdown } from "./SectionDropdown";

export function SectionNavigation() {
  return (
    <nav className="bg-background">
      <div className="container-eshspeaks">
        <div className="flex justify-center">
          <ul className="flex gap-8 py-3">
            {sections.map((s) => (
              <li key={s.slug} className="flex items-center">
                {s.subsegments && s.subsegments.length > 0 ? (
                  <SectionDropdown section={s as any} />
                ) : (
                  <Link href={`/${s.slug}`} className="text-sm md:text-base text-foreground/85 hover:text-foreground hover:underline-offset-2">
                    {s.name}
                  </Link>
                )}
              </li>
            ))}

            <li>
              <Link href="/the-seat" className="text-sm md:text-base text-accent hover:underline">
                The Seat
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default SectionNavigation;
