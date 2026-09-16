const TICKER_ITEMS = [
  { color: "var(--orange)", text: "Fuel subsidy debate is back" },
  { color: "var(--purple)", text: "Naira strength, real or PR?" },
  { color: "var(--green)", text: "State of Play: Kano heats up" },
  { color: "var(--red)", text: "Election Matters: live now" },
];

const STATS = [
  { value: "2,140", label: "active members" },
  { value: "340", label: "posts this week" },
  { value: "18", label: "topics live" },
  { value: "3", label: "cities hosting events" },
];

const TAKES = [
  {
    text: '"The housing policy piece missed the enforcement gap entirely. Rules mean nothing without teeth."',
    name: "Adaeze P.",
    tag: "State of Play",
    border: "var(--orange)",
  },
  {
    text: "\"Nobody's talking about how this affects the informal sector. That's most of the country.\"",
    name: "Kelechi O.",
    tag: "The Circuit",
    border: "var(--purple)",
  },
  {
    text: '"Been saying this for two years. Glad it\'s finally on the front bench."',
    name: "Tunde B.",
    tag: "Front Bench",
    border: "var(--green)",
  },
];

export function SeatHero() {
  return (
    <header className="relative overflow-hidden border-b-2 border-ink pb-16 pt-10 sm:pt-14">
      <div
        className="absolute -right-16 -top-24 h-[260px] w-[260px] rounded-full opacity-55"
        style={{ background: "var(--yellow)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-10 h-[180px] w-[180px] rounded-full opacity-45"
        style={{ background: "var(--green)" }}
        aria-hidden
      />

      <div className="container-eshspeaks relative z-[1]">
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-white py-[7px] pl-[7px] pr-4">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-red">
            <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-white" />
          </span>
          <span className="text-xs font-bold">LIVE ON THE SEAT</span>
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

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <h1 className="text-[38px] leading-[1.04] font-semibold text-ink sm:text-[52px] lg:text-[62px]">
              Everyone has a <span className="text-orange">seat.</span>
              <br />
              What&rsquo;s <span className="text-purple">yours?</span>
            </h1>
            <p className="mt-2 max-w-[460px] text-[16px] text-ink-soft sm:text-[17px]">
              A forum for the views, opinions, and perspective that don&rsquo;t fit in a headline.
              Started by EshSpeaks, carried forward by whoever&rsquo;s willing to talk, online and
              in the room.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#composer-anchor" className="btn-accent">
                Share Your View
              </a>
              <a href="#membership" className="btn-ghost">
                Join The List
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-7 border-t-2 border-dashed border-line pt-5">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-xs font-semibold text-ink-soft">
                  <strong className="block font-serif text-[26px] font-semibold text-ink">
                    {stat.value}
                  </strong>
                  {stat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[1] flex flex-col gap-3">
            {TAKES.map((take, i) => (
              <div
                key={take.name}
                className="rounded-2xl border-2 bg-white p-4"
                style={{
                  borderColor: take.border,
                  boxShadow: `5px 5px 0 ${take.border}`,
                  marginLeft: i === 1 ? "26px" : undefined,
                }}
              >
                <div className="text-sm text-ink">{take.text}</div>
                <div className="mt-2.5 flex justify-between text-[11.5px] font-semibold text-ink-soft">
                  <span>{take.name}</span>
                  <span>{take.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
