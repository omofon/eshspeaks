import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { sections } from "@/lib/data/sections";
import { useTier } from "@/lib/tier";
import { DevTierToggle } from "./DevTierToggle";
import { TickerStrip } from "./TickerStrip";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, isPremium } = useTier();

  return (
    <header>
      <div className="bg-navy text-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link to="/" className="font-serif text-2xl leading-none tracking-tight text-background">
              EshSpeaks
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <DevTierToggle />
              </div>
              <Link
                to="/search"
                aria-label="Search"
                className="rounded-sm p-1.5 text-background/80 hover:text-background"
              >
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </Link>
              {isLoggedIn ? (
                <Link
                  to="/account"
                  className="rounded-sm border border-background/30 px-3 py-1.5 text-sm hover:border-background"
                >
                  {isPremium ? "Account · premium" : "Account"}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-sm border border-background/30 px-3 py-1.5 text-sm hover:border-background"
                >
                  Sign in
                </Link>
              )}
              <Link
                to="/pricing"
                className="hidden rounded-sm bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 sm:block"
              >
                Subscribe
              </Link>
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setOpen((v) => !v)}
                className="rounded-sm p-1.5 text-background md:hidden"
              >
                {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <nav className="hidden border-t border-background/15 md:block">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 py-2">
              {sections.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/$section"
                    params={{ section: s.slug }}
                    className="text-sm text-background/80 hover:text-background"
                    activeProps={{ className: "text-sm text-accent" }}
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/the-seat" className="text-sm text-accent hover:underline">
                  The Seat
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {open ? (
          <div className="border-t border-background/15 md:hidden">
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {sections.map((s) => (
                <li key={s.slug} className="border-b border-background/10 last:border-0">
                  <Link
                    to="/$section"
                    params={{ section: s.slug }}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 text-sm text-background/85"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              <li className="border-t border-background/10 py-2.5">
                <Link to="/the-seat" onClick={() => setOpen(false)} className="text-sm text-accent">
                  The Seat
                </Link>
              </li>
              <li className="py-3">
                <DevTierToggle />
              </li>
            </ul>
          </div>
        ) : null}
      </div>
      <TickerStrip />
    </header>
  );
}
