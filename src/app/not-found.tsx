import Link from "next/link";
import { sections } from "@/lib/data/sections";
import { WhiteLogo } from "@/components/layout/whiteLogo";

export const metadata = {
  title: "Page not found — EshSpeaks",
  description:
    "The page you requested no longer exists or has moved. Browse EshSpeaks sections or return to the front page.",
};

export default function NotFound() {
  return (
    <div className="container-eshspeaks py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <WhiteLogo size="md" inverted={false} asLink={false} />
        </div>

        <p className="kicker mt-10">Error 404</p>
        <h1 className="headline-lg mt-3 text-navy">This page has gone to press without us.</h1>
        <p className="mt-4 text-[17px] leading-8 text-text-secondary">
          The story you were looking for may have been moved, renamed, or never existed. The
          newsroom is still here — start again from the front page or pick a section below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-accent">
            Go to the front page
          </Link>
          <Link href="/search" className="btn-ghost">
            Search the archive
          </Link>
        </div>

        <div className="mt-14 border-t-2 border-navy pt-6 text-left">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-navy">
            Sections
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {sections.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="link-underline font-serif text-lg text-navy">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
