"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTier } from "@/lib/tier";
import UtilityBar from "./layout/UtilityBar";
import Masthead from "./layout/Masthead";
import SectionNavigation from "./layout/SectionNavigation";
import MarketTicker from "./layout/MarketTicker";
import MobileHeader from "./layout/MobileHeader";

export function SiteHeader() {
  const { isLoggedIn } = useTier();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <UtilityBar />
      <Masthead />
      <MobileHeader />
      <div className="hidden md:block">
        <SectionNavigation />
        <MarketTicker />
      </div>
    </header>
  );
}
