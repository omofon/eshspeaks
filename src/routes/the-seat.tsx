import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Printer } from "lucide-react";

export const Route = createFileRoute("/the-seat")({
  component: TheSeatPage,
  head: () => ({
    meta: [
      { title: "The Seat — constituency intelligence from EshSpeaks" },
      {
        name: "description",
        content:
          "The Seat is a constituency-level briefing on Nigerian representation: who holds the seat, what they voted for, and what changed.",
      },
      { property: "og:title", content: "The Seat — constituency intelligence" },
      { property: "og:description", content: "A constituency-level briefing on Nigerian representation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/the-seat" },
    ],
    links: [{ rel: "canonical", href: "/the-seat" }],
  }),
});

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function CaptureForm() {
  const [values, setValues] = useState({ name: "", email: "", constituency: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next["name"] = "Enter your name.";
    if (!emailOk(values.email)) next["email"] = "Enter a valid email address.";
    if (!values.constituency) next["constituency"] = "Select your state or constituency.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-md border border-background/25 p-6">
        <p className="inline-flex items-center gap-2 text-base text-background">
          <Check className="h-5 w-5 text-accent" strokeWidth={2} />
          You are on the list
        </p>
        <p className="mt-2 text-sm text-background/70">
          The first briefing for {values.constituency} goes out at the start of the next sitting week.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-background/25 p-6">
      <h2 className="font-serif text-2xl text-background">Get your constituency briefing</h2>
      <p className="mt-1 text-sm text-background/70">Three fields. No cost, no advertising.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="seat-name" className="text-sm text-background/80">Name</label>
          <input
            id="seat-name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className="mt-1 w-full rounded-sm border border-background/30 bg-navy px-3 py-2 text-sm text-background outline-none focus:border-accent"
          />
          {errors["name"] ? <p className="mt-1 text-sm text-down">{errors["name"]}</p> : null}
        </div>
        <div>
          <label htmlFor="seat-email" className="text-sm text-background/80">Email address</label>
          <input
            id="seat-email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            className="mt-1 w-full rounded-sm border border-background/30 bg-navy px-3 py-2 text-sm text-background outline-none focus:border-accent"
          />
          {errors["email"] ? <p className="mt-1 text-sm text-down">{errors["email"]}</p> : null}
        </div>
        <div>
          <label htmlFor="seat-constituency" className="text-sm text-background/80">Constituency or state</label>
          <select
            id="seat-constituency"
            value={values.constituency}
            onChange={(e) => setValues({ ...values, constituency: e.target.value })}
            className="mt-1 w-full rounded-sm border border-background/30 bg-navy px-3 py-2 text-sm text-background outline-none focus:border-accent"
          >
            <option value="">Select a state</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors["constituency"] ? <p className="mt-1 text-sm text-down">{errors["constituency"]}</p> : null}
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-background hover:text-navy"
      >
        Send me the briefing
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}

function PrintForm() {
  const [values, setValues] = useState({ email: "", address: "", copies: "1" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!emailOk(values.email)) next["email"] = "Enter a valid email address.";
    if (values.address.trim().length < 8) next["address"] = "Enter a delivery address.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent">
        <Printer className="h-4 w-4" strokeWidth={1.75} />
        Print edition
      </p>
      <h2 className="mt-2 font-serif text-2xl text-navy">Request the quarterly print edition</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Constituency scorecards, printed and posted. Limited run.
      </p>

      {done ? (
        <p className="mt-5 inline-flex items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2 text-sm">
          <Check className="h-4 w-4 text-accent" strokeWidth={2} />
          Request received. We will confirm by email before printing.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="print-email" className="text-sm font-medium">Email address</label>
            <input
              id="print-email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors["email"] ? <p className="mt-1 text-sm text-down">{errors["email"]}</p> : null}
          </div>
          <div>
            <label htmlFor="print-address" className="text-sm font-medium">Delivery address</label>
            <textarea
              id="print-address"
              rows={3}
              value={values.address}
              onChange={(e) => setValues({ ...values, address: e.target.value })}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors["address"] ? <p className="mt-1 text-sm text-down">{errors["address"]}</p> : null}
          </div>
          <div>
            <label htmlFor="print-copies" className="text-sm font-medium">Copies</label>
            <select
              id="print-copies"
              value={values.copies}
              onChange={(e) => setValues({ ...values, copies: e.target.value })}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["1", "5", "25", "100"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-background hover:bg-accent"
          >
            Request print edition
          </button>
        </form>
      )}
    </div>
  );
}

function TheSeatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between border-b border-background/15 py-4">
            <span className="font-serif text-xl text-background">
              The Seat<span className="text-accent">.</span>
            </span>
            <Link to="/" className="text-xs text-background/60 hover:text-background">
              An EshSpeaks product
            </Link>
          </div>

          <div className="grid gap-10 py-16 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-accent">Constituency intelligence</p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-background md:text-6xl">
                Know who holds your seat, and what they did with it
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-background/75">
                Every sitting week, The Seat sends one page on your representative: bills sponsored,
                votes cast, attendance, constituency spend and the questions left unanswered. Written
                plainly, sourced from the record.
              </p>
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-background/20 pt-6">
                {[
                  ["469", "seats tracked"],
                  ["36+1", "states and FCT"],
                  ["Weekly", "during sittings"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-mono text-2xl text-background">{v}</dt>
                    <dd className="mt-1 text-xs text-background/60">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <CaptureForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <section>
            <h2 className="font-serif text-3xl text-navy">What arrives in the briefing</h2>
            <ul className="mt-6 divide-y divide-border">
              {[
                ["The record", "Bills sponsored and co-sponsored, with plain-language summaries."],
                ["The votes", "How your representative voted, including the divisions that were not recorded."],
                ["The money", "Constituency project allocations, awarded contractors and delivery status."],
                ["The gaps", "Sittings missed, questions unanswered, and commitments left open."],
              ].map(([title, body]) => (
                <li key={title} className="py-5">
                  <p className="font-serif text-xl text-navy">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </section>
          <PrintForm />
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>The Seat is published by EshSpeaks Media. Data is illustrative in this build.</span>
          <Link to="/" className="text-accent hover:underline">
            Back to EshSpeaks
          </Link>
        </div>
      </div>
    </div>
  );
}
