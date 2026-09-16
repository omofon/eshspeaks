"use client";

import { useMemo, useState, type FormEvent } from "react";
import { initialsFor } from "@/lib/data/seatTopics";
import { LeadFormConfirm } from "./LeadFormConfirm";

const COMMUNITY = [
  {
    name: "Adaeze P.",
    role: "State of Play regular, 340 replies this month",
    color: "var(--orange)",
  },
  {
    name: "Dr. Femi Adisa",
    role: "Policy economist, Policy Desk contributor",
    color: "var(--purple)",
  },
  {
    name: "Kelechi Obi",
    role: "Started the housing thread with 1,200 replies",
    color: "var(--green)",
  },
  { name: "Chioma Nwosu", role: "Security analyst, Border and Maritime", color: "var(--red)" },
  { name: "Tunde Bakare-Ojo", role: "Frequent Money Moves commenter", color: "var(--orange)" },
  { name: "Amina Yusuf", role: "The List, Bold member since launch", color: "var(--purple)" },
  { name: "Musa Danjuma", role: "State correspondent, Kano", color: "var(--green)" },
  { name: "Grace Ekanem", role: "Community spotlight, September", color: "var(--red)" },
];

/** No /seat/events/nominations endpoint exists yet — confirms locally. */
export function NominateForm() {
  const [mode, setMode] = useState<"community" | "new">("community");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const filtered = useMemo(
    () => COMMUNITY.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <LeadFormConfirm
        accent="var(--orange)"
        title="Nomination received"
        description="The Seat's producers review every nomination ahead of each event and reach out directly if it's a fit."
        backHref="/the-seat"
        backLabel="Back to The Seat"
      />
    );
  }

  return (
    <div>
      <span className="chip">
        <span className="inline-block h-2 w-2 rounded-full bg-orange" />
        On stage
      </span>
      <h1 className="mb-2 mt-3.5 text-[30px] font-semibold text-ink">Nominate a Guest</h1>
      <p className="mb-6.5 max-w-[520px] text-[14.5px] text-ink-soft">
        Put someone forward for a guided stage interview at the next Seat, Live event, someone from
        the community, or someone new entirely.
      </p>

      <div className="mb-6 flex w-fit gap-2.5 rounded-full border-2 border-ink bg-white p-1">
        {(["community", "new"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-4.5 py-2.5 text-[13px] font-bold ${
              mode === m ? "bg-ink text-white" : "text-ink-soft"
            }`}
          >
            {m === "community" ? "Pick from Community" : "Add Someone New"}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border-2 border-ink bg-white p-7"
        style={{ boxShadow: "6px 6px 0 var(--orange)" }}
      >
        {mode === "community" ? (
          <>
            <label className="mb-1.5 block text-xs font-bold text-ink">Search the community</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="mb-3 w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
            <div className="grid max-h-[320px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {filtered.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setSelected(member.name)}
                  className={`flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left ${
                    selected === member.name ? "border-purple bg-purple-tint" : "border-line"
                  }`}
                >
                  <span
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                    style={{ background: member.color }}
                  >
                    {initialsFor(member.name)}
                  </span>
                  <span>
                    <strong className="block text-[13px] text-ink">{member.name}</strong>
                    <span className="text-[11.5px] text-ink-soft">{member.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <label className="mb-1.5 block text-xs font-bold text-ink">Full name</label>
            <input
              type="text"
              placeholder="Their name"
              className="mb-3.5 w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">
                  Role / what they do
                </label>
                <input
                  type="text"
                  placeholder="e.g. Policy economist"
                  className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">
                  Where they&rsquo;re based
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos"
                  className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
                />
              </div>
            </div>
            <label className="mb-1.5 mt-3.5 block text-xs font-bold text-ink">Short bio</label>
            <textarea
              placeholder="Why should they have a seat on stage?"
              className="min-h-[80px] w-full resize-y rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </>
        )}

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Your name</label>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Who's nominating?"
            className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
          />
          <input
            type="email"
            required
            placeholder="Your email"
            className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
          />
        </div>

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Why them, in a line</label>
        <textarea
          placeholder="What would make this a great stage conversation?"
          className="min-h-[80px] w-full resize-y rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />

        <div className="mt-5.5 flex justify-end">
          <button type="submit" className="btn-accent">
            Submit Nomination
          </button>
        </div>
      </form>
    </div>
  );
}
