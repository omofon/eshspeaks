"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
        className={`inline-flex cursor-pointer items-center gap-1 py-1.5 text-[12px] font-medium tracking-[0.04em] transition-colors ${
          inverted ? "text-text-inverse/80 hover:text-accent" : "text-navy hover:text-accent"
        }`}
      >
        {section.name}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <div
        role="menu"
        aria-label={`${section.name} menu`}
        className={`absolute left-1/2 z-40 w-60 -translate-x-1/2 border-t-2 border-accent bg-card p-4 shadow-raised transition-opacity duration-150 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Link href={`/${section.slug}`} className="headline-sm block text-navy hover:text-accent">
          {section.name}
        </Link>
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {section.subsegments?.map((s) => (
            <Link
              key={s.slug}
              href={`/${section.slug}/${s.slug}`}
              className="text-sm text-text-secondary transition-colors hover:text-accent"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SectionDropdown;
