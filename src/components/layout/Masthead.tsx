"use client";

import React from "react";
import { WhiteLogo } from "@/components/layout/whiteLogo";

export function Masthead() {
  return (
    <div className="hidden bg-navy md:block">
      <div className="container-eshspeaks flex flex-col items-center gap-2 pb-6 pt-3">
        <WhiteLogo size="md" inverted />
        {/* <p className="kicker-muted text-text-inverse/55">
          Nigerian journalism · Interviews · Opinion
        </p> */}
      </div>
      <div className="container-eshspeaks">
        <div className="border-b border-text-inverse/15" />
      </div>
    </div>
  );
}

export default Masthead;
