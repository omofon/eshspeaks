"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSectionsCatalog } from "@/hooks/useSectionsCatalog";
import { ChevronDown, X } from "lucide-react";
import { WhiteLogo } from "@/components/layout/whiteLogo";

export function MobileNavigationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sections } = useSectionsCatalog();
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-deep/50" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-background shadow-raised outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule px-4 py-4">
          <WhiteLogo size="sm" />
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="cursor-pointer p-1 text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-auto px-4 py-2">
          {sections.map((s) => (
            <div key={s.slug} className="border-b border-border">
              <div className="flex items-center justify-between">
                <Link href={`/${s.slug}`} onClick={onClose} className="headline-sm py-3 text-navy">
                  {s.name}
                </Link>
                {s.subsegments?.length ? (
                  <button
                    aria-label={`Toggle ${s.name} subsections`}
                    onClick={() => setExpanded((v) => (v === s.slug ? null : s.slug))}
                    className="cursor-pointer p-2 text-text-muted"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${expanded === s.slug ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : null}
              </div>

              {expanded === s.slug && (
                <div className="mb-3 ml-1 flex flex-col gap-2 border-l-2 border-accent pl-3">
                  {s.subsegments?.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/${s.slug}/${sub.slug}`}
                      onClick={onClose}
                      className="text-sm text-text-secondary"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link href="/the-seat" onClick={onClose} className="tag-category py-4">
            The Seat
          </Link>
        </nav>

        <div className="border-t border-rule px-4 py-4">
          <Link href="/login" onClick={onClose} className="btn-ghost w-full cursor-pointer">
            Sign in
          </Link>
          <Link href="/pricing" onClick={onClose} className="btn-accent mt-2 w-full cursor-pointer">
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigationDrawer;
