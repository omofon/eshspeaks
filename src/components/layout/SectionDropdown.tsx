"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Section } from "@/lib/data/types";

export function SectionDropdown({ section, inverted }: { section: Section; inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative"
    >
      <button
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        className={`inline-flex items-center gap-1 text-sm ${inverted ? "text-background/90 hover:text-background" : "text-foreground/90 hover:text-foreground"}`}
      >
        {section.name}
        <span aria-hidden>▾</span>
      </button>

      <div
        role="menu"
        aria-label={`${section.name} menu`}
        className={`absolute left-0 z-40 mt-2 w-56 rounded bg-card p-3 shadow-card ring-1 ring-border transition-opacity duration-150 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ willChange: "opacity" }}
      >
        <div className="flex flex-col gap-2">
          <Link href={`/${section.slug}`} className="text-sm font-semibold text-foreground">
            {section.name}
          </Link>
          <div className="mt-1 grid grid-cols-1 gap-1 text-sm">
            {section.subsegments?.map((s) => (
              <Link key={s.slug} href={`/${section.slug}/${s.slug}`} className="text-muted-foreground hover:text-foreground">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionDropdown;
