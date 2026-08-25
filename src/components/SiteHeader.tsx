import React from "react";
import UtilityBar from "./layout/UtilityBar";
import SectionNavigation from "./layout/SectionNavigation";
import MarketTicker from "./layout/MarketTicker";
import MobileHeader from "./layout/MobileHeader";

export function SiteHeader() {
  return (
    <header className="bg-navy">
      <MobileHeader />

      <div className="sticky top-0 z-40 hidden md:block">
        <UtilityBar />
        <SectionNavigation />
        <MarketTicker />
      </div>
    </header>
  );
}

export default SiteHeader;
