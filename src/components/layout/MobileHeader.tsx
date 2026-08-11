"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import MobileNavigationDrawer from "./MobileNavigationDrawer";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden bg-background border-b border-rule">
      <div className="container-eshspeaks flex items-center justify-between py-3">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-1">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="font-serif text-lg">
          EshSpeaks
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Search" className="p-1">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/account" aria-label="Account" className="p-1">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <MobileNavigationDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default MobileHeader;
