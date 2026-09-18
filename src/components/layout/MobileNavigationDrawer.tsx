"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { LogoWordmark } from "./Logo";

export function MobileNavigationDrawer({
  open,
  onClose,
  activeHref,
}: {
  open: boolean;
  onClose: () => void;
  activeHref: string;
}) {
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
    <div className="fixed inset-0 z-50 bg-ink/50" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
          <Link href="/" onClick={onClose} className="flex items-center">
            <LogoWordmark className="w-[128px]" />
          </Link>
          <button aria-label="Close menu" onClick={onClose} className="p-1 text-ink">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex flex-1 flex-col overflow-auto px-5 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              className={`border-b border-line py-3.5 font-serif text-lg font-semibold ${
                item.seat ? "text-purple" : activeHref === item.href ? "text-orange" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 border-t-2 border-ink px-5 py-4">
          <Link
            href="/the-seat#composer-anchor"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border-2 border-ink px-4 py-2.5 text-[13.5px] font-semibold text-ink"
          >
            Raise a Topic
          </Link>
          <Link href="/the-seat#membership" onClick={onClose} className="btn-purple justify-center">
            Join The List
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigationDrawer;
