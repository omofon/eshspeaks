"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import MobileNavigationDrawer from "./MobileNavigationDrawer";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden bg-navy text-background">
      <div className="container-eshspeaks flex items-center justify-between py-3">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-1">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="font-serif text-lg" style={{ fontFamily: "var(--font-bodoni)", color: "var(--color-background)" }}>
          EshSpeaks
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Search" className="p-1 text-background/90">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35"></path></svg>
          </Link>
          <Link href="/account" aria-label="Account" className="p-1 text-background/90">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3"></circle><path d="M6 20c0-3 4-5 6-5s6 2 6 5"></path></svg>
          </Link>
        </div>
      </div>

      <MobileNavigationDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default MobileHeader;
