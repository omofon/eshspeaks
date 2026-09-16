import Link from "next/link";
import { NotifyMeForm } from "@/components/NotifyMeForm";

export const metadata = {
  title: "Events",
  description:
    "A calendar of everything happening across Colouresh, on stage, on air, and in person.",
};

export default function EventsPage() {
  return (
    <div className="container-eshspeaks py-14 sm:py-20">
      <div className="mx-auto max-w-[560px] text-center">
        <div className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-red">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </div>
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full bg-red" />
          Coming soon
        </span>
        <h1 className="mt-3.5 font-serif text-[28px] font-semibold text-ink">
          Events is being built.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[420px] text-sm text-ink-soft">
          A proper calendar of everything happening across Colouresh, on stage, on air, and in
          person, is on the way. In the meantime, The Seat, Live already has dates on the board.
        </p>
        <NotifyMeForm />
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/the-seat#events" className="btn-ghost">
            See The Seat, Live Dates
          </Link>
          <Link href="/" className="btn-ghost">
            Back to the Front Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
