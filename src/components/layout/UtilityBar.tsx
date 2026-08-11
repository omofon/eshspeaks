"use client";

import { Calendar } from "lucide-react";
import React from "react";
import Link from "next/link";

export function UtilityBar() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-background-soft border-b border-rule text-sm">
      <div className="container-eshspeaks flex items-center justify-between gap-4 py-2">
        <div className="text-muted text-xs flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{today}</span>
        </div>

        <div className="text-center" aria-hidden>
          {/* space intentionally left for masthead alignment on desktop */}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Search" className="text-muted-foreground hover:text-foreground">
            Search
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link href="/pricing" className="rounded-sm bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/90">
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UtilityBar;
