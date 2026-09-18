"use client";

import Link from "next/link";
import { useCookieConsent } from "@/lib/cookieConsent";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LogoWordmark } from "./layout/Logo";
import { NewsletterSignup } from "./NewsletterSignup";

const SECTIONS = [
  { label: "State of Play", href: "/state-of-play" },
  { label: "The Bag", href: "/the-bag" },
  { label: "Money Moves", href: "/money-moves" },
  { label: "Red Zone", href: "/red-zone" },
];

const COLOURESH_LINKS = [
  { label: "The Seat", href: "/the-seat" },
  { label: "Events", href: "/events" },
  { label: "Watch", href: "/#watch" },
  { label: "Listen", href: "/#listen" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

const MORE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise", href: "/advertise" },
  { label: "Careers", href: "/careers" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h5 className="mb-3 text-[12.5px] font-bold text-white">{title}</h5>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href as `/${string}`}
              className="text-[13.5px] text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { openSettings } = useCookieConsent();
  const { isAuthenticated } = useAuth();

  const accountLinks = [
    isAuthenticated
      ? { label: "Manage account", href: "/account" }
      : { label: "Sign in", href: "/login" },
    { label: "Subscribe", href: "/pricing" },
    { label: "Newsletters", href: "/account#newsletters" },
  ];

  return (
    <footer className="bg-ink text-white/60">
      <div className="container-colouresh py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="mb-2.5 flex items-center">
              <LogoWordmark className="w-[140px]" />
            </Link>
            <p className="max-w-[220px] text-[12.5px]">
              Nigerian stories, told in colour. A product of Colouresh LLP: Media Intelligence,
              Strategic Communications, Public Affairs.
            </p>
          </div>

          <FooterColumn title="Sections" links={SECTIONS} />
          <FooterColumn title="Colouresh" links={COLOURESH_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
          <FooterColumn title="More" links={[...MORE_LINKS, ...accountLinks]} />
        </div>

        <div className="mt-10 rounded-xl border border-white/15 bg-white/[0.03] p-5 sm:mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h5 className="text-[13px] font-bold text-white">The morning brief</h5>
              <p className="mt-1 text-[12.5px]">One email each weekday before 7am WAT.</p>
            </div>
            <div className="w-full sm:max-w-xs [&_h3]:hidden [&_input]:border-white/25 [&_input]:bg-transparent [&_input]:text-white [&_input]:placeholder:text-white/40 [&_p]:hidden">
              <NewsletterSignup />
            </div>
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="mt-4 text-[12.5px] font-medium text-white/70 transition-colors hover:text-white"
          >
            Cookie settings
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11.5px] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Colouresh LLP</span>
          <span>We tell it in colour.</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
