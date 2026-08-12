"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import MarketTicker from "./MarketTicker";
import { WhiteLogo } from "./whiteLogo";
import { HeaderAccountMenu } from "@/components/HeaderAccountMenu";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-text-inverse/15 bg-navy md:hidden">
      <div className="container-eshspeaks relative flex items-center justify-between py-3">
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="relative z-10 cursor-pointer p-1 text-text-inverse"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 flex justify-center">
          <WhiteLogo size="sm" inverted />
        </div>

        <div className="relative z-10 flex items-center gap-3 text-text-inverse/90">
          <Link href="/search" aria-label="Search" className="p-1 hover:text-accent">
            <Search className="h-5 w-5" />
          </Link>
          <HeaderAccountMenu />
        </div>
      </div>

      <MarketTicker />

      <MobileNavigationDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

export default MobileHeader;