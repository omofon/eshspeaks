import Link from "next/link";

const TICKER_ITEMS = [
  { color: "var(--orange)", text: "Naira steadies after CBN clears backlog" },
  { color: "var(--purple)", text: "Zoning decision delayed, again" },
  { color: "var(--green)", text: "Trade corridor still catching up on paperwork" },
  { color: "var(--red)", text: "Election Matters, live on The Seat" },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b-2 border-ink pb-14 pt-10 sm:pt-14">
      <div
        className="absolute -right-12 -top-20 h-[240px] w-[240px] rounded-full opacity-50"
        style={{ background: "var(--yellow)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-12 -left-8 h-[160px] w-[160px] rounded-full opacity-40"
        style={{ background: "var(--green)" }}
        aria-hidden
      />

      <div className="container-colouresh relative z-[1]">
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-white py-[7px] pl-[7px] pr-4">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-red">
            <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-white" />
          </span>
          <span className="text-xs font-bold">HAPPENING NOW</span>
          <div className="w-[150px] overflow-hidden sm:w-[300px]">
            <div className="flex w-max animate-ticker gap-[22px] whitespace-nowrap text-[13.5px] font-semibold [animation-duration:18s]">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-[7px] w-[7px] rounded-full"
                    style={{ background: item.color }}
                  />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <h1 className="text-[36px] leading-[1.05] font-semibold text-ink sm:text-[46px] lg:text-[58px]">
              The news, in <span className="text-orange">colour.</span>
              <br />
              Not just <span className="text-purple">headlines,</span>{" "}
              <span className="text-green">stories.</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-[16px] text-ink-soft sm:text-[16.5px]">
              Colouresh is where Nigeria&rsquo;s stories get told the way they actually happen,
              watched, listened to, read, and argued about, all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/state-of-play" className="btn-accent">
                Start Reading
              </Link>
              <Link href="/the-seat" className="btn-ghost">
                Take a Seat
              </Link>
            </div>
          </div>

          <div
            className="relative aspect-square overflow-hidden rounded-[28px] border-2 border-ink"
            style={{ background: "linear-gradient(160deg,#2A1F52,#141024)" }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <circle cx="120" cy="120" r="60" fill="var(--orange)" opacity=".85" />
              <circle cx="290" cy="90" r="40" fill="var(--yellow)" opacity=".9" />
              <circle cx="320" cy="260" r="70" fill="var(--purple)" opacity=".8" />
              <circle cx="100" cy="300" r="46" fill="var(--green)" opacity=".85" />
              <circle cx="210" cy="210" r="52" fill="var(--red)" opacity=".8" />
              <g opacity=".95">
                <rect x="170" y="150" width="60" height="110" rx="20" fill="#fff" />
                <circle cx="200" cy="128" r="26" fill="#fff" />
                <rect x="184" y="185" width="32" height="10" rx="5" fill="var(--ink)" />
                <rect x="150" y="230" width="14" height="45" rx="7" fill="#fff" />
                <rect x="236" y="230" width="14" height="45" rx="7" fill="#fff" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
