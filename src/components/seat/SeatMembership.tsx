import Link from "next/link";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";

const TIERS = [
  {
    name: "Grey",
    className: "border-2 border-ink bg-white text-ink",
    perks: [
      "Access to the members-only feed",
      "Early word on upcoming topics",
      "Invitations to select digital sessions",
      "The Seat member card",
    ],
    btn: "btn-ghost",
  },
  {
    name: "Slate",
    className: "border-2 border-purple-deep text-white",
    style: { background: "linear-gradient(160deg,#8A5CF0,#5E33C4)" },
    perks: [
      "Everything in Grey",
      "Priority invites to physical events",
      "Curated content drops",
      "Access to the wider Colouresh network",
    ],
    btn: "btn-primary",
  },
  {
    name: "Bold",
    className: "relative overflow-hidden border-2 border-ink bg-ink text-white",
    perks: [
      "Everything in Slate",
      "Pitch opportunities to brand partners",
      "Entry into the right environments and rooms",
      "Direct line to Eshomomoh's Corner",
    ],
    btn: "btn-accent",
  },
];

/**
 * These tier cards are marketing content for the real membership system —
 * every "Join" button below links to /pricing, the real Paystack-backed
 * Grey/Slate/Bold checkout, rather than a second local join form. See
 * membership.html (converted separately at /membership) for the
 * prototype's own standalone lead-capture form, which is not this.
 */
export function SeatMembership() {
  return (
    <section id="membership" className="py-14 sm:py-20">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--purple)"
          chipLabel="Community"
          title="The List"
          note="Network. Get invited. Get in the right room. Three tiers, one community."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex min-h-[400px] flex-col gap-4 rounded-3xl p-7 ${tier.className}`}
              style={tier.style}
            >
              {tier.name === "Bold" ? (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.14]"
                  style={{
                    background:
                      "conic-gradient(from 90deg, var(--orange), var(--red), var(--purple), var(--green), var(--yellow), var(--orange))",
                  }}
                />
              ) : null}
              <div className="relative z-[1] font-serif text-2xl">
                <span className="mb-1.5 block text-[11.5px] font-sans font-bold uppercase tracking-wide opacity-60">
                  The List
                </span>
                {tier.name}
              </div>
              <ul className="relative z-[1] flex flex-1 flex-col gap-2.5 text-[13.5px]">
                {tier.perks.map((perk) => (
                  <li key={perk} className="relative pl-5.5">
                    <span className="absolute left-0 font-bold">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className={`${tier.btn} relative z-[1] w-fit`}>
                Join {tier.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Choose your tier",
              cards: ["GREY, essential access", "SLATE, priority + perks", "BOLD, all-access"],
            },
            {
              title: "Your details",
              cards: ["Name", "Email", "Card preference: Physical / Virtual"],
            },
            {
              title: "Welcome to The List",
              cards: ["Membership card + QR", "Reserved Seating ✓", "Priority Entry ✓"],
            },
          ].map((step, i) => (
            <div key={step.title} className="rounded-[26px] bg-ink p-2">
              <div className="rounded-[20px] bg-[#141414] p-5 text-white">
                <h5 className="mb-3.5 font-serif text-[15px] text-white">{step.title}</h5>
                {step.cards.map((card) => (
                  <div
                    key={card}
                    className="mb-2 rounded-[10px] bg-[#2A2A2A] px-3 py-2.5 text-[11.5px] font-semibold"
                  >
                    {card}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 text-center text-xs font-bold text-ink-soft">
                {i + 1}. {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
