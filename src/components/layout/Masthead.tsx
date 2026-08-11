"use client";

import Link from "next/link";
import React from "react";

export function Masthead() {
  return (
    <div className="bg-background">
      <div className="container-eshspeaks flex items-center justify-center py-6">
        <Link href="/" className="font-serif text-3xl tracking-tight text-foreground">
          {/* Wordmark uses dedicated display font via globals */}
          <span className="not-italic">EshSpeaks</span>
        </Link>
      </div>
      <div className="border-t border-rule" />
    </div>
  );
}

export default Masthead;
