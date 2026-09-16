"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./layout/navItems";
import { MobileNavigationDrawer } from "./layout/MobileNavigationDrawer";
import { HeaderAccountMenu } from "./HeaderAccountMenu";
import { SearchOverlay } from "./SearchOverlay";

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const activeHref =
    NAV_ITEMS.find((item) => item.href !== "/" && pathname?.startsWith(item.href))?.href ??
    (pathname === "/" ? "/" : "");

  return (
    <Fragment>
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
        <div className="container-eshspeaks flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/colouresh/assets/Eshicon.svg"
              alt="Colouresh"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="font-serif text-[18px] font-semibold text-ink sm:text-[19px]">
              Colouresh
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`border-b-2 py-1.5 text-[13.5px] font-semibold transition-colors ${
                  item.seat
                    ? "border-transparent text-purple hover:text-purple-deep"
                    : activeHref === item.href
                      ? "border-orange text-ink"
                      : "border-transparent text-ink-soft hover:border-orange hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <SearchOverlay inverted={false} />
            <HeaderAccountMenu />
            <Link
              href="/the-seat#composer-anchor"
              className="hidden items-center justify-center rounded-full border-2 border-ink px-3.5 py-2 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-0.5 lg:inline-flex"
            >
              Raise a Topic
            </Link>
            <Link
              href="/the-seat#membership"
              className="hidden items-center justify-center rounded-full bg-purple px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_0_var(--purple-deep)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none lg:inline-flex"
            >
              Join The List
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-ink lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered as a sibling of <header>, not inside it: the header's
          backdrop-blur-sm creates a new containing block for `position:
          fixed` descendants (same rule as `filter`/`transform`), which
          would otherwise clip this drawer to the header's own short box
          instead of the full viewport. */}
      <MobileNavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeHref={activeHref}
      />
    </Fragment>
  );
}

export default SiteHeader;
