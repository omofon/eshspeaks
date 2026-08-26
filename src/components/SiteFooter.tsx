"use client";

import Link from "next/link";
import { useCookieConsent } from "@/lib/cookieConsent";
import { useSectionsCatalog } from "@/hooks/useSectionsCatalog";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NewsletterSignup } from "./NewsletterSignup";
import { WhiteLogo } from "./layout/whiteLogo";

const company = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise", href: "/advertise" },
  { label: "Careers", href: "/careers" },
];

function getAccountLinks(authenticated: boolean) {
  const identity = authenticated
    ? { label: "Manage account", href: "/account" }
    : { label: "Sign in", href: "/login" };

  return [
    identity,
    { label: "Subscribe", href: "/pricing" },
    { label: "Gift subscriptions", href: "/pricing?gift=1" },
    { label: "Newsletters", href: "/account#newsletters" },
  ];
}

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href as `/${string}`}
              className="cursor-pointer text-[13px] text-text-inverse/70 transition-colors hover:text-text-inverse"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionLink({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/${slug}`}
      className="cursor-pointer text-[13px] text-text-inverse/70 transition-colors hover:text-text-inverse"
    >
      {name}
    </Link>
  );
}

function NewsletterBlock({
  authenticated,
  onOpenCookieSettings,
}: {
  authenticated: boolean;
  onOpenCookieSettings: () => void;
}) {
  return (
    <div className="rounded-sm border border-text-inverse/15 bg-navy-soft/40 p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
        {authenticated ? "Subscribe" : "Subscribe to Newsletter"}
      </h3>
      <p className="mt-3 font-serif text-2xl text-text-inverse">The morning brief</p>
      <p className="mt-2 text-[13px] text-text-inverse/65">
        One email each weekday before 7am WAT.
      </p>
      <div className="mt-4 [&_h3]:hidden [&_input]:border-text-inverse/30 [&_input]:bg-transparent [&_input]:text-text-inverse [&_p]:hidden">
        <NewsletterSignup />
      </div>
      <button
        type="button"
        onClick={onOpenCookieSettings}
        className="mt-4 cursor-pointer text-[13px] font-medium text-text-inverse/80 transition-colors hover:text-text-inverse"
      >
        Cookie settings
      </button>
    </div>
  );
}

export function SiteFooter() {
  const { openSettings } = useCookieConsent();
  const { isAuthenticated } = useAuth();
  const { sections } = useSectionsCatalog();
  const accountLinks = getAccountLinks(isAuthenticated);

  return (
    <footer className="mt-20 bg-navy text-text-inverse">
      <div className="container-eshspeaks py-10 md:py-12">
        <div className="border-b border-text-inverse/15 pb-8">
          <WhiteLogo size="lg" inverted />
        </div>

        {/* MOBILE — stacked: Sections (2-col grid) → Company/Account (2-col) → Newsletter */}
        <div className="flex flex-col gap-8 pt-8 md:hidden">
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-accent">Sections</h3>
            {/* grid-flow-col fills column 1 top-to-bottom first, then column 2 —
                matches the requested 4-and-4 column split rather than an
                interleaved row-major fill. Assumes ~8 section items (today's
                live catalog); gracefully wraps into more/fewer columns if
                the backend's section count changes. */}
            <div className="mt-3 grid grid-flow-col grid-rows-4 gap-x-6 gap-y-2.5">
              {sections.map((s) => (
                <SectionLink key={s.slug} slug={s.slug} name={s.name} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <Column title="Company" links={company} />
            <Column title="Account" links={accountLinks} />
          </div>

          <NewsletterBlock authenticated={isAuthenticated} onOpenCookieSettings={openSettings} />
        </div>

        {/* TABLET — 3 columns */}
        <div
          className="
            hidden
            pt-8
            md:grid
            md:grid-cols-[160px_180px_minmax(0,3fr)]
            md:gap-10
            lg:grid-cols-[220px_220px_minmax(0,3fr)]
            lg:gap-14
            min-[1440px]:hidden!
          "
        >
          {/* Sections */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-accent">Sections</h3>

            <ul className="mt-3 space-y-2.5">
              {sections.map((s) => (
                <li key={s.slug}>
                  <SectionLink slug={s.slug} name={s.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Account */}
          <div className="flex flex-col gap-8">
            <Column title="Company" links={company} />
            <Column title="Account" links={accountLinks} />
          </div>

          {/* Newsletter */}
          <div className="w-full">
            <NewsletterBlock authenticated={isAuthenticated} onOpenCookieSettings={openSettings} />
          </div>
        </div>

        {/* DESKTOP ≥1440px — 4 equal functional columns */}
        <div
          className="
            hidden
            min-[1440px]:grid
            min-[1440px]:grid-cols-[1fr_1fr_1fr_2fr]
            min-[1440px]:gap-12
            pt-8
          "
        >
          {/* COLUMN 1 — Sections */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-accent">Sections</h3>

            <ul className="mt-3 space-y-2.5">
              {sections.map((s) => (
                <li key={s.slug}>
                  <SectionLink slug={s.slug} name={s.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2 — Company */}
          <Column title="Company" links={company} />

          {/* COLUMN 3 — Account */}
          <Column title="Account" links={accountLinks} />

          {/* COLUMN 4 — Newsletter */}
          <div className="w-full">
            <NewsletterBlock authenticated={isAuthenticated} onOpenCookieSettings={openSettings} />
          </div>
        </div>

        {/* FOOTER META — copyright + Privacy/Terms/Cookies only. No Search,
            Pricing, or a standalone Legal section (all removed per spec);
            Cookies here links to the policy page, distinct from the
            "Cookie settings" button above which reopens the consent manager. */}
        <div className="mt-10 border-t border-text-inverse/15 pt-5">
          <div className="flex flex-col gap-3 text-[11px] uppercase tracking-[0.14em] text-text-inverse/55 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} EshSpeaks Media</span>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/privacy" className="cursor-pointer hover:text-text-inverse">
                Privacy
              </Link>
              <Link href="/terms" className="cursor-pointer hover:text-text-inverse">
                Terms
              </Link>
              <Link href="/cookies" className="cursor-pointer hover:text-text-inverse">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
