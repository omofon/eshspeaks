"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { btnOrangeSm, btnGhostSm } from "./seatButtons";

/**
 * "Share your story" submissions map onto `POST /seat/stories` (B1), not
 * yet live, so this confirms locally like the rest of The Seat's forms
 * rather than pretending to file it with an editor.
 */
function ShareStory() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setOpen(false);
    setDone(true);
  }

  return (
    <section id="story" className="bg-yellow py-14 text-center sm:py-20">
      <div className="container-colouresh mx-auto max-w-[620px]">
        <span className="chip mb-4 border-transparent bg-black/[0.08]">Your voice is powerful</span>
        <h2 className="mb-3.5 text-[32px] font-semibold text-ink sm:text-[38px]">
          Let it reach the right audience.
        </h2>
        <p className="mb-7 text-base text-ink/65">
          Not every take fits inside someone else&rsquo;s thread. Bring your own story, your own
          take, and let The Seat carry it.
        </p>

        {done ? (
          <p className="font-semibold text-ink">
            ✓ Story received, our editorial team will be in touch if it&rsquo;s a fit.
          </p>
        ) : open ? (
          <form
            onSubmit={submit}
            className="mx-auto rounded-[20px] border-2 border-ink bg-white p-6 text-left"
          >
            <label className="mb-1.5 block text-xs font-bold text-ink">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your story called?"
              className="mb-3.5 w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
            <label className="mb-1.5 block text-xs font-bold text-ink">Your story</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                error ? "Add a little of your story before submitting…" : "Tell it your way..."
              }
              className={`mb-3.5 min-h-[110px] w-full resize-y rounded-xl border-2 px-3.5 py-3 text-sm outline-none ${
                error ? "border-red" : "border-line"
              }`}
            />
            <label className="mb-1.5 block text-xs font-bold text-ink">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="mb-4.5 w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={() => setOpen(false)} className={btnGhostSm}>
                Cancel
              </button>
              <button type="submit" className={btnOrangeSm}>
                Submit Story
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="btn-primary">
            Start Here
          </button>
        )}
      </div>
    </section>
  );
}

function Profile() {
  return (
    <section id="profile" className="py-14 sm:py-20">
      <div className="container-colouresh">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip">
              <span className="inline-block h-2 w-2 rounded-full bg-ink" />
              Company profile
            </span>
            <h2 className="my-3.5 text-[32px] font-semibold text-ink">Built by Colouresh LLP</h2>
            <p className="text-[15.5px] text-ink-soft">
              The Seat is Colouresh&rsquo;s community engagement arm, media intelligence and
              strategic communications behind it. If you&rsquo;re a vendor, an investor, or a brand
              looking to be part of where the conversation happens, here&rsquo;s the front door.
            </p>
            <div className="mt-6 flex flex-wrap gap-7">
              <div>
                <strong className="block font-serif text-2xl text-orange">2,140+</strong>
                <span className="text-xs text-ink-soft">active members</span>
              </div>
              <div>
                <strong className="block font-serif text-2xl text-purple">8</strong>
                <span className="text-xs text-ink-soft">sections feeding in</span>
              </div>
              <div>
                <strong className="block font-serif text-2xl text-green">3</strong>
                <span className="text-xs text-ink-soft">cities, physical events</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { title: "Vendors", sub: "Supply, services, and event partnerships", type: "vendor" },
              { title: "Investors", sub: "Growth and platform conversations", type: "investor" },
              {
                title: "Partners",
                sub: "Brand collaborations, cross-border and local",
                type: "partner",
              },
            ].map((cta) => (
              <Link
                key={cta.type}
                href={`/partner?type=${cta.type}`}
                className="flex items-center justify-between rounded-2xl border-2 border-ink bg-white px-5 py-4.5"
              >
                <div>
                  <strong className="mb-0.5 block text-[15px] text-ink">{cta.title}</strong>
                  <span className="text-xs text-ink-soft">{cta.sub}</span>
                </div>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdsCTA() {
  return (
    <section className="bg-red py-10 text-white">
      <div className="container-colouresh flex flex-wrap items-center justify-between gap-6">
        <div>
          <h4 className="mb-1.5 text-[22px] font-semibold text-white">Advertise on The Seat</h4>
          <p className="max-w-[420px] text-sm text-white/80">
            Topic sponsorship, spotlight sponsorship, or event sponsorship, placed where the
            conversation is already happening.
          </p>
        </div>
        <Link href="/advertise" className="btn-primary">
          Advertise With Us
        </Link>
      </div>
    </section>
  );
}

export function SeatClosing() {
  return (
    <>
      <ShareStory />
      <Profile />
      <AdsCTA />
    </>
  );
}
