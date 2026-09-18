import Link from "next/link";
import { ALL_DESKS } from "@/lib/data/desks";
import { SectionHeading } from "./SectionHeading";

const SOCIAL_ITEMS = [
  { platform: "W", color: "#25D366", text: "#NairaWatch, forwarded 12k times", q: "naira" },
  { platform: "T", color: "#000000", text: "Zoning drama, trending #3 nationally", q: "zoning" },
  { platform: "X", color: "var(--ink)", text: "Analysts split on FPI inflow read", q: "FPI" },
  { platform: "I", color: "#E1306C", text: "Election Matters clips, 400k views", q: "election" },
  { platform: "Y", color: "#FF0000", text: "Front Bench Ep. 41, climbing fast", q: "front bench" },
];

export function TrendingSocial() {
  return (
    <section className="border-y-2 border-ink bg-green-bg py-14 sm:py-16">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--green)"
          chipLabel="Trending"
          title="What's moving on social"
          note="Pulled from WhatsApp forwards, TikTok, and X, where most Nigerians actually meet the news first."
        />
        <div className="flex gap-3 overflow-x-auto pb-1.5">
          {SOCIAL_ITEMS.map((s, i) => (
            <Link
              key={i}
              href={`/search?q=${encodeURIComponent(s.q)}`}
              className="flex shrink-0 items-center gap-2.5 rounded-full border-2 border-ink bg-white px-4 py-2.5 text-[12.5px] font-bold transition-colors hover:bg-green-tint"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                style={{ background: s.color }}
              >
                {s.platform}
              </span>
              {s.text}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const POPULAR_ITEMS = [
  {
    rank: 1,
    tag: "The Vibe · Fashion",
    title: "Ankara reinterpreted: the tailors behind Lagos Fashion Week's loudest looks",
    g1: "var(--purple)",
    g2: "#2E1966",
    href: "/coming-soon?s=The%20Vibe",
  },
  {
    rank: 2,
    tag: "The Vibe · Culture",
    title: "Afrobeats to Amapiano: the crossover nobody saw coming",
    g1: "var(--orange)",
    g2: "#7A3B00",
    href: "/coming-soon?s=The%20Vibe",
  },
  {
    rank: 3,
    tag: "Human Interest",
    title: "The trader who turned a market stall into a logistics company",
    g1: "var(--green)",
    g2: "#0F4A22",
    href: "/the-bag",
  },
  {
    rank: 4,
    tag: "The Whistle · Sports",
    title: "Super Eagles watch: the midfield gamble that's dividing fans",
    g1: "var(--red)",
    g2: "#7A1A0F",
    href: "/coming-soon?s=The%20Whistle",
  },
];

export function PopularGrid() {
  return (
    <section className="container-colouresh py-14 sm:py-16">
      <SectionHeading
        dot="var(--purple)"
        chipLabel="Popular right now"
        title="What everyone's looking at"
        note="Fashion, culture, and the human-interest stories carrying the most engagement this week."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {POPULAR_ITEMS.map((p) => (
          <Link
            key={p.rank}
            href={p.href as `/${string}`}
            className="relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl border-2 border-ink"
            style={{ background: `linear-gradient(160deg,${p.g1},${p.g2})` }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(0deg, rgba(0,0,0,.72), rgba(0,0,0,0) 60%)" }}
            />
            <span className="absolute left-2.5 top-2.5 z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-ink">
              {p.rank}
            </span>
            <div className="relative z-[1] p-4 text-white">
              <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold">
                {p.tag}
              </span>
              <h5 className="text-[14.5px] leading-[1.3] font-semibold text-white">{p.title}</h5>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const OPPORTUNITIES = [
  {
    d: "14",
    m: "OCT",
    title: "The Seat: Lagos Social",
    desc: "Stage interviews and open floor, Victoria Island.",
    meta: "Free · RSVP required",
    href: "/the-seat#events",
  },
  {
    d: "01",
    m: "NOV",
    title: "Colouresh Contributor Call",
    desc: "Pitch a column for State of Play, The Bag, or Money Moves.",
    meta: "Applications close 25 Oct",
    href: "/the-seat#profile",
  },
  {
    d: "02",
    m: "NOV",
    title: "The Seat: Abuja Roundtable",
    desc: "Panel plus stage interviews, Central Business District.",
    meta: "Free · RSVP required",
    href: "/the-seat#events",
  },
  {
    d: "15",
    m: "NOV",
    title: "State Correspondent Programme",
    desc: "Paid per-piece role covering your state for State of Play.",
    meta: "Rolling applications",
    href: "/the-seat#profile",
  },
  {
    d: "21",
    m: "NOV",
    title: "The Seat: Port Harcourt Mixer",
    desc: "Open floor and networking, GRA Phase 2.",
    meta: "Free · RSVP required",
    href: "/the-seat#events",
  },
  {
    d: "30",
    m: "NOV",
    title: "Advertise on Colouresh",
    desc: "Sponsor a desk, a topic, or an in-feed placement.",
    meta: "Book a slot",
    href: "/advertise",
  },
];

export function EventsOpportunities() {
  return (
    <section className="bg-ink py-14 sm:py-16">
      <div className="container-colouresh">
        <SectionHeading
          inverted
          dot="var(--green)"
          chipLabel="Enroll & attend"
          title="Events and opportunities"
          note="Things happening around Colouresh you can actually show up for, or apply to."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITIES.map((o, i) => (
            <Link
              key={i}
              href={o.href as `/${string}`}
              className="flex flex-col gap-3 rounded-2xl border-2 border-white/15 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-2.5">
                <h5 className="max-w-[170px] text-[16px] leading-[1.3] font-semibold text-white">
                  {o.title}
                </h5>
                <div className="min-w-[52px] rounded-[10px] bg-white px-3 py-2 text-center text-ink">
                  <div className="font-serif text-[17px] leading-none">{o.d}</div>
                  <div className="text-[9px] font-bold">{o.m}</div>
                </div>
              </div>
              <p className="text-[12.5px] text-white/60">{o.desc}</p>
              <div className="mt-auto text-[11.5px] font-semibold text-white/60">{o.meta}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeatCTA() {
  return (
    <section className="container-colouresh py-14 sm:py-16">
      <SectionHeading
        dot="var(--red)"
        chipLabel="Live from The Seat"
        title="The floor is already open"
        note="Every story here can become a conversation. Pull up a chair."
      />
      <div
        className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border-2 border-ink p-6"
        style={{ background: "#F1EBFF", boxShadow: "6px 6px 0 var(--purple)" }}
      >
        <div>
          <div className="mb-1.5 font-serif text-[19px] text-ink">
            Is the new housing policy built for people who actually need it, or for the headlines?
          </div>
          <div className="text-[12.5px] font-semibold text-ink-soft">
            1,204 replies and counting
          </div>
        </div>
        <Link href="/the-seat#thread" className="btn-purple">
          Join the Thread
        </Link>
      </div>
    </section>
  );
}

export function ShareStoryCTA() {
  return (
    <section className="bg-yellow py-14 text-center sm:py-16">
      <div className="container-colouresh mx-auto max-w-[600px]">
        <span className="chip border-transparent bg-black/[0.08]">Your voice is powerful</span>
        <h2 className="mt-3.5 text-[28px] font-semibold text-ink sm:text-[34px]">
          Got a story only you can tell?
        </h2>
        <p className="mt-3 text-[15.5px] text-ink/65">
          Not everything worth reading starts as a press release. Bring your own story, your own
          angle, and let Colouresh carry it to the right audience.
        </p>
        <Link href="/the-seat#story" className="btn-primary mt-6 inline-flex">
          Share Your Story
        </Link>
      </div>
    </section>
  );
}

const PARTNER_LOGOS = ["Paystack", "MTN", "GTCO", "Wakanow", "Air Peace"];

export function Partners() {
  return (
    <section className="container-colouresh py-14 sm:py-16">
      <SectionHeading
        dot="var(--green)"
        chipLabel="Who we work with"
        title="Brands we partner with"
        note="Media collaborations, sponsors, and platforms Colouresh already builds with."
      />
      <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-5">
        {PARTNER_LOGOS.map((name) => (
          <div
            key={name}
            className="rounded-2xl border-2 border-ink bg-white px-2.5 py-5 text-center font-serif text-sm text-ink"
          >
            {name}
          </div>
        ))}
      </div>
      <div
        className="mt-7 flex flex-wrap items-center justify-between gap-6 rounded-[22px] border-2 border-ink p-8"
        style={{ background: "linear-gradient(120deg,#F1EBFF,#FDEAE6)" }}
      >
        <div>
          <h3 className="text-[22px] font-semibold text-ink">Want to be on this wall?</h3>
          <p className="max-w-[420px] text-[13.5px] text-ink-soft">
            Vendors, investors, and brands looking to reach Colouresh&rsquo;s audience can start the
            conversation here.
          </p>
        </div>
        <Link href="/the-seat#profile" className="btn-purple">
          Partner With Us
        </Link>
      </div>
    </section>
  );
}

export function ExploreDesks() {
  return (
    <section className="bg-ink py-14 sm:py-16">
      <div className="container-colouresh">
        <SectionHeading
          inverted
          dot="var(--yellow)"
          chipLabel="Explore"
          title="Every desk at Colouresh"
          note="Nine beats, one newsroom. Some are live, some are still being built."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ALL_DESKS.map((desk) => (
            <Link
              key={desk.key}
              href={desk.href as `/${string}`}
              className="rounded-2xl border-2 border-white/15 bg-white/[0.03] p-5"
            >
              <div className="mb-3.5 h-3 w-3 rounded-full" style={{ background: desk.color }} />
              <div className="font-serif text-[17px] text-white">{desk.label}</div>
              <div className="mt-1 text-[11.5px] text-white/50">{desk.tag}</div>
              {!desk.live ? (
                <div className="mt-2.5 text-[10.5px] font-bold text-yellow">COMING SOON</div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
