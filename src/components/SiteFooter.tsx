"use client";

import Link from "next/link";
import { sections } from "@/lib/data/sections";
import { NewsletterSignup } from "./NewsletterSignup";
import { DevTierToggle } from "./DevTierToggle";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule bg-navy text-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {sections.map((s) => (
              <div key={s.slug}>
                <Link
                  href={`/${s.slug}`}
                  className="font-sans text-sm font-medium text-background hover:text-accent"
                >
                  {s.name}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {s.subsegments.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/${s.slug}/${sub.slug}`}
                        className="text-xs text-background/65 hover:text-background"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-background/20 p-5">
            <h3 className="font-serif text-lg text-background">The morning brief</h3>
            <p className="mt-1 text-xs text-background/70">
              One email each weekday. Politics, markets, security.
            </p>
            <div className="mt-3 [&_h3]:hidden [&_p]:text-background/70 [&_input]:bg-navy [&_input]:text-background [&_input]:border-background/30">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-background/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-xs text-background/60">
            <Link href="/pricing" className="hover:text-background">
              Pricing
            </Link>
            <Link href="/search" className="hover:text-background">
              Search
            </Link>
            <Link href="/account" className="hover:text-background">
              Newsletters
            </Link>
            <Link href="/the-seat" className="hover:text-background">
              The Seat
            </Link>
            <span>© 2026 EshSpeaks Media</span>
          </div>
          <DevTierToggle />
        </div>
      </div>
    </footer>
  );
}
