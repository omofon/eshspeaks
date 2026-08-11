"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sections } from "@/lib/data/sections";
import { ChevronDown, X } from "lucide-react";

export function MobileNavigationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute right-0 top-0 h-full w-80 bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-rule p-4">
          <div className="font-serif text-lg">EshSpeaks</div>
          <button aria-label="Close menu" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-auto p-4">
          <nav className="flex flex-col gap-2">
            {sections.map((s) => (
              <div key={s.slug}>
                <button
                  onClick={() => setExpanded((v) => (v === s.slug ? null : s.slug))}
                  className="w-full flex items-center justify-between py-2 text-left text-foreground"
                >
                  <span>{s.name}</span>
                  {s.subsegments?.length ? <ChevronDown className="h-4 w-4" /> : null}
                </button>

                {expanded === s.slug && (
                  <div className="ml-3 mt-1 flex flex-col gap-1">
                    {s.subsegments?.map((sub) => (
                      <Link key={sub.slug} href={`/${s.slug}/${sub.slug}`} onClick={onClose} className="py-1 text-sm text-muted-foreground">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 border-t border-rule pt-4">
              <Link href="/login" onClick={onClose} className="block py-2">
                Sign in
              </Link>
              <Link href="/pricing" onClick={onClose} className="block py-2 text-accent">
                Subscribe
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigationDrawer;
